import { parseSetCookie, RequestCookies } from 'next/dist/compiled/@edge-runtime/cookies';
import redis from './redis';

const SIGNIN_URL = 'https://wandrer.earth/signin';
const SESSION_COOKIE_NAME = '_percent_session';

const SESSION_REDIS_KEY = 'wandrer_session';

if (!process.env.WANDRER_USERNAME || !process.env.WANDRER_PASSWORD) {
  throw new Error('WANDRER_USERNAME and WANDRER_PASSWORD must be set');
}
const { WANDRER_USERNAME, WANDRER_PASSWORD } = process.env;


// HELPERS

/** Extract relevant cookies from a Response from wandrer, and update redis */
async function handleResponseCookies(response: Response) {
  const responseCookies = response.headers.getSetCookie().map(parseSetCookie).filter((c) => !!c);
  const sessionCookie = responseCookies.find((c) => c.name === SESSION_COOKIE_NAME);
  if (sessionCookie?.value) {
    await redis.set(SESSION_REDIS_KEY, sessionCookie.value, { ex: 24 * 60 * 60 });
  }

  return { session: sessionCookie?.value };
}


// SESSION RETRIEVAL

/** Get a signed-in session ID that we’ve stored in redis */
async function getStoredSession() {
  const storedSession = await redis.get(SESSION_REDIS_KEY);
  if (typeof storedSession !== 'string' || !storedSession.length) return undefined;
  console.log('[session] using stored session');
  return storedSession;
}

/** Sign in to Wandrer using username/password to establish a session */
async function establishNewSession() {
  console.log('[session] establishing new session');
  const signinPageRes = await fetch(SIGNIN_URL);
  // extract session cookies
  const initialCookies = signinPageRes.headers.getSetCookie()
    .map(parseSetCookie).filter((c) => !!c);
  // extract csrf token
  const signinPageText = await signinPageRes.text();
  const csrfParam = /<meta name="csrf-param" content="([^"]+)"/.exec(signinPageText)?.[1];
  const csrfToken = /<meta name="csrf-token" content="([^"]+)"/.exec(signinPageText)?.[1];
  if (!csrfParam || !csrfToken) { throw new Error('No CSRF token found'); }

  // construct login request with our credentials, plus csrf token + session cookies
  const signinRequest = new Request(SIGNIN_URL, {
    method: 'POST',
    redirect: 'manual',
    body: new URLSearchParams({
      [csrfParam]: csrfToken,
      'athlete[email]': WANDRER_USERNAME,
      'athlete[password]': WANDRER_PASSWORD,
      'athlete[remember_me]': '1',
    }),
  });
  const signinRequestCookies = new RequestCookies(signinRequest.headers);
  initialCookies.forEach((c) => signinRequestCookies.set(c));
  // Make login request
  const signinRes = await fetch(signinRequest);
  if (signinRes.status < 200 || signinRes.status >= 400) { throw new Error('Failed to sign in'); }

  // extract session from response cookies
  const { session } = await handleResponseCookies(signinRes);
  if (!session) { throw new Error('Failed to sign in: no new session cookie found'); }
  return session;
}


// API

/** Get an authenticated session cookie for wandrer, by any of several mechanisms */
export async function getWandrerSession() {
  const session = await getStoredSession() ?? await establishNewSession();
  return session;
}

/** Make a fetch request to an auth-protected resource on wandrer */
export async function wandrerAuthedFetch(
  url: string,
  init: RequestInit = {},
) {
  async function fetchWithSession(session: string, retry = true) {
    // Construct the request using the given session cookie
    const request = new Request(url, init);
    const requestCookies = new RequestCookies(request.headers);
    requestCookies.set(SESSION_COOKIE_NAME, session);
    // Send the request
    const response = await fetch(request);
    // Handle a first rejection by retrying with a new session
    const isSigninRedirect = (response.redirected && response.url.endsWith('/signin'))
      || (response.status === 302 && response.headers.get('location')?.endsWith('/signin'));
    if (isSigninRedirect) {
      console.warn('[session] Wandrer session was rejected');
      await redis.del(SESSION_REDIS_KEY);
      if (!retry) throw new Error('Session was rejected');
      return fetchWithSession(await establishNewSession(), false);
    }
    return response;
  }

  // Make the request
  const response = await fetchWithSession(await getWandrerSession());

  // Update stored session from the response
  await handleResponseCookies(response);

  return response;
}

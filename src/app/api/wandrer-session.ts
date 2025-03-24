import { parseSetCookie, RequestCookies } from 'next/dist/compiled/@edge-runtime/cookies';

const SIGNIN_URL = 'https://wandrer.earth/signin';
const SESSION_COOKIE_NAME = '_percent_session';

if (!process.env.WANDRER_USERNAME || !process.env.WANDRER_PASSWORD) {
  throw new Error('WANDRER_USERNAME and WANDRER_PASSWORD must be set');
}
const { WANDRER_USERNAME, WANDRER_PASSWORD } = process.env;


export async function getWandrerSession() {
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

  // extract relevant cookies
  const signedInCookies = signinRes.headers.getSetCookie().map(parseSetCookie).filter((c) => !!c);
  const sessionCookie = signedInCookies.find((c) => c.name === SESSION_COOKIE_NAME);
  if (!sessionCookie?.value) { throw new Error('Failed to sign in: no new session cookie found'); }

  // return Headers that can be sent in a request to be authenticated
  const out = new Headers();
  new RequestCookies(out).set(sessionCookie);
  return out;
}

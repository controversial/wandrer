import { wandrerAuthedFetch } from '../wandrer-session';

if (!process.env.NEXT_PUBLIC_WANDRER_ATHLETE_ID) throw new Error('Missing athlete ID');
const WANDRER_ATHLETE_ID = process.env.NEXT_PUBLIC_WANDRER_ATHLETE_ID;
const DATA_URL = `https://wandrer.earth/athletes/${WANDRER_ATHLETE_ID}/tile_data`;


export async function GET(): Promise<Response> {
  const dataRes = await wandrerAuthedFetch(DATA_URL, { redirect: 'error' });
  if (!dataRes.ok) { return new Response('Received error response from tile data', { status: 500 }); }
  return new Response(dataRes.body);
}

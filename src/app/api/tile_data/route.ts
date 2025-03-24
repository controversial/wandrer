import { WANDRER_USER_ID } from '../../../constants';
import { getWandrerSession } from '../wandrer-session';

const DATA_URL = `https://wandrer.earth/athletes/${WANDRER_USER_ID}/tile_data`;


export async function GET(): Promise<Response> {
  const sessionHeaders = await getWandrerSession();
  const dataRes = await fetch(DATA_URL, {
    headers: sessionHeaders,
    redirect: 'error',
  });
  if (!dataRes.ok) { return new Response('Received error response from tile data', { status: 500 }); }

  return new Response(dataRes.body);
}

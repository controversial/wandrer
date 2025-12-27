import { Redis } from '@upstash/redis';

if (!process.env.REDIS_URL || !process.env.REDIS_TOKEN) throw new Error('REDIS_URL and REDIS_TOKEN must be set');
const { REDIS_URL, REDIS_TOKEN } = process.env;

const redis = new Redis({
  url: REDIS_URL,
  token: REDIS_TOKEN,
});

export default redis;

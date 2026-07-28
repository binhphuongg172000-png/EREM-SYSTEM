import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
dotenv.config();

async function testConnection(url: string, label: string) {
  const client = new PrismaClient({ datasources: { db: { url } } });
  const t0 = Date.now();
  await client.$connect();
  const connectMs = Date.now() - t0;

  const t1 = Date.now();
  await client.$queryRaw`SELECT 1`;
  const pingMs = Date.now() - t1;

  const t2 = Date.now();
  await client.user.count();
  const queryMs = Date.now() - t2;

  await client.$disconnect();
  const total = Date.now() - t0;

  console.log(`\n=== ${label} ===`);
  console.log(`Connect: ${connectMs}ms`);
  console.log(`SELECT 1: ${pingMs}ms`);
  console.log(`user.count(): ${queryMs}ms`);
  console.log(`Total: ${total}ms`);
}

const base = process.env.DATABASE_URL!;
// Remove existing params
const cleanBase = base.split('?')[0];

const poolerUrl = `${cleanBase}?pgbouncer=true`;
const directUrl5432 = `${cleanBase.replace(':6543/', ':5432/')}`;
const directUrl5432v2 = cleanBase.includes(':6543') ? directUrl5432 : cleanBase;

(async () => {
  console.log('Testing DB connection speeds...\n');
  await testConnection(base, 'Current URL (from .env)');
  await testConnection(directUrl5432v2, 'Direct port 5432 (no pooler)');
})();

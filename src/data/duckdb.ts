import * as duckdb from '@duckdb/duckdb-wasm';
import duckdbWasm from '@duckdb/duckdb-wasm/dist/duckdb-mvp.wasm';
import duckdbWasmNext from '@duckdb/duckdb-wasm/dist/duckdb-eh.wasm';


if (typeof window === 'undefined') throw new Error('DuckDB must be lazy-loaded on the client');


// Instantiate a DuckDB instance

const BUNDLES = {
  mvp: {
    mainModule: duckdbWasm,
    mainWorker: new URL('@duckdb/duckdb-wasm/dist/duckdb-browser-mvp.worker.js', import.meta.url).toString(),
  },
  eh: {
    mainModule: duckdbWasmNext,
    mainWorker: new URL('@duckdb/duckdb-wasm/dist/duckdb-browser-eh.worker.js', import.meta.url).toString(),
  },
} satisfies duckdb.DuckDBBundles;

const bundle = await duckdb.selectBundle(BUNDLES);
if (!bundle.mainWorker) throw new Error('No worker URL found in the selected bundle.');
const worker = new Worker(bundle.mainWorker);
const logger = new duckdb.ConsoleLogger();
const db = new duckdb.AsyncDuckDB(logger, worker);
await db.instantiate(bundle.mainModule, bundle.pthreadWorker);
const conn = await db.connect();


// Load the “spatial” extension

await conn.query('INSTALL spatial; LOAD spatial;');

// Make db instance and default connection available

export { db, conn };

// Template literal tags for performing SQL queries

export async function execSql(strings: TemplateStringsArray, ...values: unknown[]) {
  if (!values.length) return conn.query(strings.join(''));
  const stmt = await conn.prepare(strings.join(' ? '));
  return stmt.query(...values);
}

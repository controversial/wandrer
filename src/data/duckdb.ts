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

// Load the “spatial” extension

await db.instantiate(bundle.mainModule, bundle.pthreadWorker);
const conn = await db.connect();
await conn.query('INSTALL spatial; LOAD spatial;');

// Make db instance and default connection available

export { db, conn };

// noop template tag; vscode provides syntax highlighting for sql`...`
export const sql = (strings: TemplateStringsArray, ...values: unknown[]) => {
  if (values.length) throw new Error('Interpolating values makes query unsafe; use `prepare` instead.');
  return strings.join('');
};

// Template literal tags for performing SQL queries

export async function execSql(strings: TemplateStringsArray, ...values: unknown[]) {
  if (!values.length) return conn.query(strings.join(''));
  const stmt = await conn.prepare(strings.join(' ? '));
  return stmt.query(...values);
}

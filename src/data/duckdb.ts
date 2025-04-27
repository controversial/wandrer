import * as duckdb from '@duckdb/duckdb-wasm';
import duckdbWasm from '@duckdb/duckdb-wasm/dist/duckdb-mvp.wasm';
import duckdbWasmNext from '@duckdb/duckdb-wasm/dist/duckdb-eh.wasm';


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


/** Initialize a duckdb instance with the spatial extension loaded */
export async function initializeDuckDB() {
  const bundle = await duckdb.selectBundle(BUNDLES);
  if (!bundle.mainWorker) throw new Error('No worker URL found in the selected bundle.');
  const worker = new Worker(bundle.mainWorker);
  const logger = new duckdb.ConsoleLogger(duckdb.LogLevel.WARNING);
  const db = new duckdb.AsyncDuckDB(logger, worker);
  await db.instantiate(bundle.mainModule, bundle.pthreadWorker);
  const conn = await db.connect();

  // Load the “spatial” extension
  await conn.query('INSTALL spatial; LOAD spatial;');

  return { db, conn };
}

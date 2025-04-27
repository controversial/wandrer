import type { Feature } from 'geojson';

import { initializeDuckDB } from './duckdb';
import sql from './noop-template-tag';


export class SpatialIndex {
  #dbPromise = Promise.withResolvers<Awaited<ReturnType<typeof initializeDuckDB>>>();
  /** database connection; only resolves when initialize() has completed */
  get conn() { return this.#dbPromise.promise.then(({ conn }) => conn); }
  get db() { return this.#dbPromise.promise.then(({ db }) => db); }

  constructor() {
    // kick off initialization immediately
    this.#initialize()
      .catch((e: unknown) => { console.error('Failed to initialize spatial index:', e); });
  }

  /**
   * Wait for duckdb to load and establish table schemas; finally resolve `conn` to signal the
   * database connection is ready and available
   */
  async #initialize() {
    // Initialize database
    let duck;
    try {
      duck = await initializeDuckDB();
    } catch (e) { this.#dbPromise.reject(e); throw e; }
    const { conn } = duck;

    // Core table for features that are loaded from wandrer tiles
    await conn.query(sql`
      CREATE TABLE IF NOT EXISTS segments (
        wandrer_id UBIGINT PRIMARY KEY,
        geom GEOMETRY NOT NULL,
        traveled BOOLEAN NOT NULL,
        unpaved BOOLEAN NOT NULL,
        -- The zoom level at which the feature was recorded
        recorded_at_z TINYINT NOT NULL
      );
    `);
    await conn.query(sql`
      CREATE INDEX IF NOT EXISTS idx_segments_geom ON segments USING RTREE (geom);
    `);

    // Separately, we load timestamp data from a different wandrer endpoint.
    // wandrer_id is the key between the two, but it’s not guaranteed that all features in this
    // table will have loaded into the segments_table, so there’s no foreign key constraint.
    await conn.query(sql`
      CREATE TABLE IF NOT EXISTS segments_traveled_at (
        wandrer_id UBIGINT PRIMARY KEY,
        traveled_at TIMESTAMP NOT NULL
      );
    `);
    await conn.query(sql`
      CREATE INDEX IF NOT EXISTS idx_segments_traveled_at ON segments_traveled_at (traveled_at);
    `);

    // Let everyone know the connection is ready to use
    this.#dbPromise.resolve(duck);
  }


  /** Record features in the database when a Mapbox tile is loaded */
  async recordLoadedFeatures(features: Feature[], traveled: boolean, tileZ: number) {
    const db = await this.db;
    const conn = await this.conn;
    const startTime = performance.now();

    // Construct and upload a newline-delimited GeoJSON file to duckdb
    const geojsonl = features.map((f) => JSON.stringify({
      type: 'Feature',
      geometry: f.geometry,
      properties: { wid: f.id, z: tileZ, t: traveled, up: Boolean(f.properties?.unpaved) },
    })).join('\n');
    const filename = `${crypto.randomUUID()}.geojsonl`;
    await db.registerFileText(filename, geojsonl);

    // Copy data from the geojson file into the segments table
    const statement = await conn.prepare(sql`
      INSERT INTO segments (wandrer_id, geom, traveled, unpaved, recorded_at_z)
      SELECT wid, geom, t, up, z FROM ST_Read(?)
      ON CONFLICT (wandrer_id) DO UPDATE SET
        geom = EXCLUDED.geom,
        recorded_at_z = EXCLUDED.recorded_at_z
      WHERE segments.recorded_at_z < EXCLUDED.recorded_at_z;
    `);
    await statement.query(filename);

    console.log(`recorded ${features.length} features in ${performance.now() - startTime}ms`);

    db.dropFile(filename).catch(() => {});
  }
}

// default instance; there’s not much reason to have multiple as they’ll all connect to the same
// duckdb database
const spatialIndex = new SpatialIndex();
export default spatialIndex;

import { AsyncDuckDBConnection } from '@duckdb/duckdb-wasm';
import type { Feature } from 'geojson';
import sql from './noop-template-tag';


export class SpatialIndex {
  #connPromise = Promise.withResolvers<AsyncDuckDBConnection>();
  /** database connection; only resolves when initialize() has completed */
  get conn() { return this.#connPromise.promise; }

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
    let conn;
    try {
      ({ conn } = await import('./duckdb'));
    } catch (e) { this.#connPromise.reject(e); throw e; }

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
    this.#connPromise.resolve(conn);
  }


  /** Query for recording a GeoJSON feature in the database */
  #insertFeatureQuery = this.conn.then((conn) => conn.prepare(sql`
    INSERT INTO segments (wandrer_id, geom, traveled, unpaved, recorded_at_z)
    VALUES (?, ST_GeomFromGeoJSON(?), ?, ?, ?)
    -- overwrite geometry when it’s loaded at a higher zoom level
    ON CONFLICT (wandrer_id) DO UPDATE SET
      geom = EXCLUDED.geom,
      recorded_at_z = EXCLUDED.recorded_at_z
    WHERE segments.recorded_at_z <= EXCLUDED.recorded_at_z;
  `));
  /** Record a feature in the database when it’s loaded from a Mapbox tile */
  async recordLoadedFeature(feature: Feature, traveled: boolean, tileZ: number) {
    await (await this.#insertFeatureQuery).query(
      feature.id,
      JSON.stringify(feature.geometry),
      traveled,
      typeof feature.properties?.unpaved === 'boolean' ? feature.properties.unpaved : false,
      tileZ,
    );
  }
}

// default instance; there’s not much reason to have multiple as they’ll all connect to the same
// duckdb database
const spatialIndex = new SpatialIndex();
export default spatialIndex;

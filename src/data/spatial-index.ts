import { conn, sql } from './duckdb';
import type { Feature } from 'geojson';

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
// wandrer_id is the key between the two, but it’s not guaranteed that all features in this table
// will have loaded into the segments_table, so there’s no foreign key constraint.
await conn.query(sql`
  CREATE TABLE IF NOT EXISTS segments_traveled_at (
    wandrer_id UBIGINT PRIMARY KEY,
    traveled_at TIMESTAMP NOT NULL
  );
`);
await conn.query(sql`
  CREATE INDEX IF NOT EXISTS idx_segments_traveled_at ON segments_traveled_at (traveled_at);
`);


const insertFeatureQuery = conn.prepare(sql`
  INSERT INTO segments (wandrer_id, geom, traveled, unpaved, recorded_at_z)
  VALUES (?, ST_GeomFromGeoJSON(?), ?, ?, ?)
  -- overwrite geometry when it’s loaded at a higher zoom level
  ON CONFLICT (wandrer_id) DO UPDATE SET
    geom = EXCLUDED.geom,
    recorded_at_z = EXCLUDED.recorded_at_z
  WHERE segments.recorded_at_z <= EXCLUDED.recorded_at_z;
`);
/** Record a feature in the database when it’s loaded from a Mapbox tile */
export async function recordLoadedFeature(feature: Feature, traveled: boolean, tileZ: number) {
  await (await insertFeatureQuery).query(
    feature.id,
    JSON.stringify(feature.geometry),
    traveled,
    typeof feature.properties?.unpaved === 'boolean' ? feature.properties.unpaved : false,
    tileZ,
  );
}

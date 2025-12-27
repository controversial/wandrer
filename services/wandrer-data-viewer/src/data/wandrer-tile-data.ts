import Pbf from 'pbf';

function readTileDataInner(pbf: Pbf, end: number) {
  return pbf.readFields((tag, result) => {
    switch (tag) {
      case 1:
        result.osm_id = pbf.readVarint(true);
        break;
      case 2:
        result.timestamp = pbf.readVarint();
        break;
      case 3:
        result.is_bike = pbf.readBoolean();
        break;
      case 4:
        result.is_combined = pbf.readBoolean();
        break;
      default:
        console.warn('unexpected tag in tile data', tag);
        break;
    }
  }, {
    osm_id: 0,
    timestamp: 0,
    is_bike: false,
    is_combined: false,
  }, end);
}

export function readWandrerTileData(buff: ArrayBuffer) {
  const pbf = new Pbf(buff);
  return pbf.readFields(
    (tag, result) => {
      if (tag === 1) {
        const dataLength = pbf.readVarint();
        const dataPoint = readTileDataInner(pbf, pbf.pos + dataLength);
        if (!dataPoint.is_bike) return;
        result.set(
          dataPoint.osm_id.toString(),
          dataPoint.timestamp * 1000, // seconds to milliseconds for js convention
        );
      } else { console.warn('unexpected tag in tile data', tag); }
    },
    new Map<string, number>(),
  );
}

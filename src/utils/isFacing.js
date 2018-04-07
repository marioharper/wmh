import geolib from 'geolib';

const angleDiff = (angle1, angle2) => Math.abs((angle1 - angle2 + 180 + 360) % 360 - 180);

export default function ({
  heading, origin, destination, precision = 0,
}) {
  const bearing = geolib.getBearing(origin, destination);

  return angleDiff(heading, bearing) <= precision;
}

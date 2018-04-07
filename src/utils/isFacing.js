import geolib from 'geolib';

const degreeDiff = (degree1, degree2) => Math.abs((degree1 - degree2 + 180 + 360) % 360 - 180);

export default function ({
  heading, origin, destination, precision = 0,
}) {
  const bearing = geolib.getBearing(origin, destination);

  return degreeDiff(heading, bearing) <= precision;
}

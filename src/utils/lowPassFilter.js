/**
 * converts degree to radians
 * @param degree
 * @returns {number}
 */
const toRadians = degree => degree * (Math.PI / 180);

/**
 * Converts radian to degree
 * @param radians
 * @returns {number}
 */
const toDegree = radians => radians * (180 / Math.PI);

/**
 * Smooths two degree values.
 * @param currentDegree (0-360)
 * @param previousDegree (0-360)
 * @param smoothing smoothing (0-1)
 * @returns {number} degree (0-360)
 * @see http://christine-coenen.de/blog/2014/07/02/smooth-compass-needle-in-android-or-any-angle-with-low-pass-filter/
 */
export default function lowPassFilter(currentDegree, previousDegree, smoothing = 0.6) {
  if (previousDegree == null) return currentDegree;

  let previousSin = Math.sin(toRadians(previousDegree));
  let previousCos = Math.cos(toRadians(previousDegree));

  previousSin = smoothing * previousSin + (1 - smoothing) * Math.sin(toRadians(currentDegree));
  previousCos = smoothing * previousCos + (1 - smoothing) * Math.cos(toRadians(currentDegree));

  const degrees = toDegree(Math.atan2(toRadians(previousSin), toRadians(previousCos)));

  return (degrees + 360) % 360;
}

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

  const smoothValue = (curr, prev) => smoothing * prev + (1 - smoothing) * curr;

  const previousSin = Math.sin(toRadians(previousDegree));
  const previousCos = Math.cos(toRadians(previousDegree));

  const currentSin = Math.sin(toRadians(currentDegree));
  const currentCos = Math.cos(toRadians(currentDegree));

  const smoothedSin = smoothValue(currentSin, previousSin);
  const smoothedCos = smoothValue(currentCos, previousCos);

  const degrees = toDegree(Math.atan2(toRadians(smoothedSin), toRadians(smoothedCos)));

  return (degrees + 360) % 360;
}

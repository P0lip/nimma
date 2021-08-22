export default function (value, pos, start, end, step) {
  if (!Array.isArray(value)) return false;

  const len = value.length;
  start = start < 0 ? Math.max(0, start + len) : Math.min(len, start);
  end = end < 0 ? Math.max(0, end + len) : Math.min(len, end);
  for (let i = start; i < end; i += step) {
    if (i === pos) {
      return true;
    }
  }

  return false;
}

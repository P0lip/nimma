export default function (value, pos, start, end, step) {
  if (!Array.isArray(value)) return false;

  const actualStart =
    start < 0
      ? Math.max(0, start + value.length)
      : Math.min(value.length, start);
  const actualEnd =
    end < 0 ? Math.max(0, end + value.length) : Math.min(value.length, end);

  return pos >= actualStart && pos < actualEnd && (pos + start) % step === 0;
}

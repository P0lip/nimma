export default function getOutputFormat() {
  try {
    Function('a', 'a?.b')({});
    return 'ES2021';
  } catch {
    return 'ES2018';
  }
}
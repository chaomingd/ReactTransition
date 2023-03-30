export function safeJSONParse<T = any>(jsonStr: string, fallback?: any) {
  let res: T;
  try {
    res = JSON.parse(jsonStr);
  } catch (error) {
    res = fallback;
  }
  return res;
}

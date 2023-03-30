
interface IPendStrOptions {
  length: number;
  pendString?: string;
  pendStart?: boolean;
}
/**
 * 字符串补齐
 * @examples
 * 1. pendStr(1, { length: 2 }) =>  01
 * 2. pendStr(1, { length: 8 }) =>  00000001
 * 3. pendStr(1, { length: 8, pendString: 'a' }) =>  aaaaaaa1
*/
export function pendStr(str: string, { length, pendString = '0', pendStart = true }: IPendStrOptions) {
  if (!str) return str;
  if (str.length < length) {
    const count = length - str.length;
    const pendStrs: string[] = [];
    for (let i = 0; i < count; i++) {
      pendStrs.push(pendString);
    }
    return pendStart ? pendStrs.join('') + str : str + pendStrs.join('');
  }
  return str;
}

export function lowercaseFirstLetter(str: string) {
  return str[0].toLowerCase() + str.slice(1);
}

export function uppercaseFirstLetter(str: string) {
  return str[0].toUpperCase() + str.slice(1);
}

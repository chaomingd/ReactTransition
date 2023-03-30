import { Nullable } from '@/types';

interface ITreeOptions {
  children: string;
}

export function treeMap<T = any, R = any>(treeDatas: T[], interator: (item: T) => R, options?: ITreeOptions) {
  const res: R[] = [];
  treeForEach(
    treeDatas,
    (item) => {
      res.push(interator(item));
    },
    options,
  );
  return res;
}

export function treeToMap<T = any>(treeDatas: Nullable<T[]>, getKey: (item: T) => string, options?: ITreeOptions) {
  const map: Record<string, T> = {};
  if (!treeDatas) return {};
  treeForEach(treeDatas, (item) => {
    map[getKey(item)] = item;
  }, options);
  return map;
}

export function treeFilter<T = any>(treeDatas: T[], interator: (item: T) => boolean, options?: ITreeOptions) {
  const res: T[] = [];
  treeForEach(
    treeDatas,
    (item) => {
      if (interator(item)) {
        res.push(item);
      }
    },
    options,
  );
  return res;
}

export function treeForEach<T = any>(treeDatas: T[], interator: (item: T) => any, options?: ITreeOptions) {
  const childrenName = options?.children || 'children';
  function walker(treeDatas: T[]) {
    treeDatas &&
      treeDatas.length &&
      treeDatas.forEach((item) => {
        interator(item);
        if (item[childrenName] && item[childrenName].length) {
          walker(item[childrenName]);
        }
      });
  }
  walker(treeDatas);
}

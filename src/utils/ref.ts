import { RefTarget } from '@/types';

export function getRefTarget(ref: RefTarget<HTMLElement>) {
  if (!ref) return null;
  if ('current' in ref) {
    return ref.current;
  }
  return ref;
}

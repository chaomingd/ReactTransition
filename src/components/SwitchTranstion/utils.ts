import { isValidElement } from 'react';

export function isSameChild(oldChild, child) {
  if (isValidElement(oldChild) && isValidElement(child)) {
    return oldChild.type === child.type && oldChild.key === child.key;
  }
  if (isValidElement(oldChild) || isValidElement(child)) {
    return false;
  }
  return oldChild === child;
}

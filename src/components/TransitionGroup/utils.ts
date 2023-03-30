import { ReactNode, Children, isValidElement, cloneElement } from 'react';

export function getChildrenMap(children: ReactNode | ReactNode[], mapFn: (reactEl: ReactNode, index: number) => {
  index: number;
  item: ReactNode;
}) {
  const childMap: Record<string, any> = {};
  Children.forEach(children, (child, index) => {
    const isReactElement = child && isValidElement(child);
    let key = (isReactElement ? child.key : index) as string;
    childMap[key] = mapFn(child, index);
  });
  return childMap;
}

export function getInitialChildrenMap(children) {
  const newChildren: any[] = [];
  const childMap = getChildrenMap(children, (child, index) => {
    if (child && isValidElement(child)) {
      const newChild = cloneElement(child, {
        visible: true,
      } as any);
      newChildren.push(newChild);
      return {
        index,
        item: newChild,
      };
    }
    newChildren.push(child);
    return {
      index,
      item: child,
    };
  });
  return {
    childMap,
    children: newChildren,
  }
}

export function mergeChildren(prevChildrenMap, nextChildren: any, onExited) {
  const newChildren: any[] = [];
  const nextChildMap = getChildrenMap(nextChildren, (child, index) => {
    if (child && isValidElement(child)) {
      const newChild = cloneElement(child, {
        visible: true,
      } as any);
      newChildren.push(newChild);
      return {
        index,
        item: newChild,
      };
    }
    return {
      index,
      item: child,
    };
  });
  const mergeChildren: any[] = [...newChildren];
  Object.keys(prevChildrenMap).forEach(key => {
    if (!nextChildMap[key]) {
      const index = prevChildrenMap[key].index;
      const item = prevChildrenMap[key].item;
      const shouldRemoveNode = (item && isValidElement(item)) ? cloneElement(item, {
        visible: false,
        onExited,
      } as any): item;
      if (index < mergeChildren.length) {
        mergeChildren.splice(index, 0, shouldRemoveNode);
      } else {
        mergeChildren.push(shouldRemoveNode);
      }
    }
  });
  return {
    nextChildMap,
    mergeChildren,
    newChildren,
  }
}

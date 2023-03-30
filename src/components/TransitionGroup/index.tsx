import { useModel } from '@/hooks/react-store/useModel';
import { useMemoizedFn } from 'ahooks';
import { ReactNode, useEffect, useRef } from 'react';
import { getInitialChildrenMap, mergeChildren } from './utils';

interface ITransitionGroup {
  children: ReactNode | ReactNode[];
}
interface IState {
  children: ReactNode[];
}
const TransitionGroup = ({ children }: ITransitionGroup) => {
  const preChildrenInfoRef = useRef<any>(null);
  const transtionGroupModel = useModel<IState>({
    state: {
      children: []
    }
  })
  const { children: renderChildren } = transtionGroupModel.useGetState();
  const onExited = useMemoizedFn(() => {
    transtionGroupModel.setState({
      children: preChildrenInfoRef.current.children
    });
  })
  useEffect(() => {
    if (!preChildrenInfoRef.current) {
      const initChildrenInfo = getInitialChildrenMap(children);
      transtionGroupModel.setState({
        children: initChildrenInfo.children
      })
      preChildrenInfoRef.current = initChildrenInfo;
    } else {
      // 对比合并子节点
      const mergeChildrenInfo = mergeChildren(preChildrenInfoRef.current.childMap, children, onExited);
      transtionGroupModel.setState({
        children: mergeChildrenInfo.mergeChildren
      });
      preChildrenInfoRef.current = {
        childMap: mergeChildrenInfo.nextChildMap,
        children: mergeChildrenInfo.newChildren,
      };
    }
  }, [children, transtionGroupModel, onExited]);
  return (
    <div>{renderChildren}</div>
  )
}

export default TransitionGroup;

import { useModel } from '@/hooks/react-store/useModel';
import {
  Children,
  cloneElement,
  isValidElement,
  ReactNode,
  useEffect,
  useRef,
} from 'react';
import { isSameChild } from './utils';

interface SwitchTransitionProps {
  children: ReactNode;
  mode?: 'out-in' | 'in-out';
}

const MODE = {
  inOut: 'in-out',
  outIn: 'out-in',
};

interface IState {
  status: 'enter' | 'leave' | 'none';
  children: any;
}

const cloneChild = (child, props) => {
  return child && isValidElement(child)
    ? cloneElement(child, props as any)
    : child;
};

const enterRender = {
  [MODE.inOut]: ({ prevChildrenRef, currentChildRef, SwitchTransitionModel }) => {
    return [
      cloneChild(prevChildrenRef.current, {
        visible: true,
      }),
      cloneChild(currentChildRef.current, {
        visible: true,
        apear: true,
        onEntered: () => {
          SwitchTransitionModel.setState({
            status: 'leave',
          });
        },
      }),
    ];
  },
  [MODE.outIn]: ({ prevChildrenRef, currentChildRef, SwitchTransitionModel }) => {
    return cloneChild(prevChildrenRef.current, {
      visible: false,
      onExited: () => {
        SwitchTransitionModel.setState({
          status: 'leave',
        });
      },
    });
  },
};
const leaveRender = {
  [MODE.inOut]: ({ prevChildrenRef, currentChildRef, SwitchTransitionModel }) => {
    return [
      cloneChild(prevChildrenRef.current, {
        visible: false,
        onExited: () => {
          SwitchTransitionModel.setState({
            children: cloneChild(currentChildRef.current, {
              visible: true,
            }),
            status: 'none',
          });
        },
      }),
      cloneChild(currentChildRef.current, {
        visible: true,
        apear: true,
      }),
    ];
  },
  [MODE.outIn]: ({ prevChildrenRef, currentChildRef, SwitchTransitionModel }) => {
    return cloneChild(currentChildRef.current, {
      visible: true,
      appear: true,
      onEntered: () => {
        SwitchTransitionModel.setState({
          status: 'none',
          children: cloneChild(currentChildRef.current, {
            visible: true,
          }),
        });
      },
    });
  },
};

const SwitchTransition = ({
  children,
  mode = 'out-in',
}: SwitchTransitionProps) => {
  const prevChildrenRef = useRef<any>(null);
  const SwitchTransitionModel = useModel<IState>({
    state: {
      status: 'none',
      children: [],
    },
  });
  const { status, children: renderChildren } =
    SwitchTransitionModel.useGetState();
  const child = Children.only(children);
  const currentChildRef = useRef(child);
  useEffect(() => {
    if (!prevChildrenRef.current) {
      const newChild = cloneChild(child, {
        visible: true,
        appear: false,
      });
      SwitchTransitionModel.setState({
        children: newChild,
      });
      prevChildrenRef.current = child;
      currentChildRef.current = child;
      return;
    }
    prevChildrenRef.current = currentChildRef.current;
    currentChildRef.current = child;
    if (isSameChild(prevChildrenRef.current, child)) {
      SwitchTransitionModel.setState({
        children: cloneChild(child, {
          visible: true,
        }),
        status: 'none',
      });
      return
    };
    SwitchTransitionModel.setState({
      status: 'enter'
    });
  }, [child, SwitchTransitionModel, currentChildRef]);
  useEffect(() => {
    if (status === 'enter') {
      SwitchTransitionModel.setState({
        children: enterRender[mode]({ prevChildrenRef, currentChildRef, SwitchTransitionModel }),
      })
      return;
    }
    if (status === 'leave') {
      SwitchTransitionModel.setState({
        children: leaveRender[mode]({ prevChildrenRef, currentChildRef, SwitchTransitionModel }),
      })
      return;
    }
  }, [status, SwitchTransitionModel, mode]);
  return renderChildren;
};

export default SwitchTransition;

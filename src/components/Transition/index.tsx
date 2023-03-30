import { useModel } from '@/hooks/react-store/useModel';
import { useLatest, useUnmount } from 'ahooks';
import { useEffect, useMemo, useRef } from 'react';
import {
  TransitionProps,
  ETransitionStatus,
  ITransitionState,
  TransitionClassNames,
} from './type';
import { getDuration } from './utils';

const Transition = ({
  children,
  visible,
  exitUnMount = true,
  transitionName,
  duration = 200,
  appear = true,
  ...props
}: TransitionProps) => {
  const propsRef = useLatest(props);
  const transitionModel = useModel<ITransitionState>({
    state: {
      status: (visible && !appear) ? ETransitionStatus.entered : ETransitionStatus.exited,
    },
  });
  const transitionClassNames = useMemo(() => {
    let baseClassNames: string[];
    if (!transitionName) {
      baseClassNames = ['transtion']
    } else {
      baseClassNames = typeof transitionName === 'string' ? [transitionName] : transitionName;
    }
    return baseClassNames.map(baseClassName => {
      const classNames = {} as TransitionClassNames;
      Object.keys(ETransitionStatus).forEach((status) => {
        classNames[status] = `${baseClassName}-${status}`;
      });
      return classNames;
    })
  }, [transitionName]);
  const { status } = transitionModel.useGetState();
  const transitionClassNamesWithStatus = useMemo(() => {
    return transitionClassNames.map(item => item[status])
  }, [transitionClassNames, status])
  const transitionTimerRef = useRef<any>();
  const enteringTimerRef = useRef<any>();
  useEffect(() => {
    clearTimeout(transitionTimerRef.current);
    clearTimeout(enteringTimerRef.current);
    const { status: currentStatus } = transitionModel.getState();
    if (visible) {
      if (![ETransitionStatus.entering, ETransitionStatus.entered].includes(currentStatus)) {
        transitionModel.setState({
          status: ETransitionStatus.enter,
        });
        propsRef.current.onEnter?.();
      }
    } else {
      if (![ETransitionStatus.exited, ETransitionStatus.exiting].includes(currentStatus)) {
        transitionModel.setState({
          status: ETransitionStatus.exit,
        });
        propsRef.current.onExit?.();
      }
    }
    // eslint-disable-next-line
  }, [visible]);
  // entering
  useEffect(() => {
    if ([ETransitionStatus.enter, ETransitionStatus.exit].includes(status)) {
      clearTimeout(enteringTimerRef.current);
      enteringTimerRef.current = setTimeout(() => {
        if (status === ETransitionStatus.enter) {
          transitionModel.setState({
            status: ETransitionStatus.entering,
          });
          propsRef.current.onEntering?.();
        } else if (status === ETransitionStatus.exit) {
          transitionModel.setState({
            status: ETransitionStatus.exiting,
          });
          propsRef.current.onExiting?.();
        }
      }, 17);
    }
    // eslint-disable-next-line
  }, [status]);
  // entered
  useEffect(() => {
    if ([ETransitionStatus.entering, ETransitionStatus.exiting].includes(status)) {
      clearTimeout(transitionTimerRef.current);
      transitionTimerRef.current = setTimeout(
        () => {
          if (status === ETransitionStatus.entering) {
            transitionModel.setState({
              status: ETransitionStatus.entered,
            });
            propsRef.current.onEntered?.();
          } else if (status === ETransitionStatus.exiting) {
            transitionModel.setState({
              status: ETransitionStatus.exited,
            });
            propsRef.current.onExited?.();
          }
        },
        getDuration({
          duration,
          status,
        })
      );
    }
    // eslint-disable-next-line
  }, [status]);
  useUnmount(() => {
    clearTimeout(transitionTimerRef.current);
    clearTimeout(enteringTimerRef.current);
  });
  if (exitUnMount) {
    if (status === ETransitionStatus.exited) return null;
  }
  if (typeof children === 'function') {
    return children(status, transitionClassNamesWithStatus[0], transitionClassNamesWithStatus);
  }
  return children;
};

export default Transition;

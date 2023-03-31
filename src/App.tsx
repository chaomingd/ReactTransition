import './App.css';
import './animation.scss';

import { useLayoutEffect, useRef, useState } from 'react';
import Transition from './components/Transition';
import classNames from 'classnames';
import TransitionGroup from './components/TransitionGroup';
import SwitchTransition from './components/SwitchTranstion';
import { uuid } from './utils/uuid';

const Flip = {
  first(els: HTMLElement[]) {
    els.forEach((el) => {
      (el as any).__boundingRect = el.getBoundingClientRect();
    });
  },
  lastAndInvert(els: HTMLElement[]) {
    els.forEach((el) => {
      const firstRect = (el as any).__boundingRect;
      const lastRect = el.getBoundingClientRect();
      el.style.transform = `translate3d(${firstRect.left - lastRect.left}px, ${
        firstRect.top - lastRect.top
      }px, 0) scale(${firstRect.width / lastRect.width}, ${
        firstRect.height / lastRect.height
      })`;
    });
  },
  play(els: HTMLElement[]) {
    setTimeout(() => {
      els.forEach((el) => {
        el.style.transition = 'all 500ms';
        el.style.removeProperty('transform');
        el.ontransitionend = () => {
          el.style.removeProperty('transition');
          delete (el as any).__boundingRect;
        };
      });
    }, 17);
  },
};

function FlipApp() {
  const [list, updateList] = useState(() => {
    const list: any[] = [];
    for (let i = 0; i < 64; i++) {
      list.push(i);
    }
    return list;
  });
  const containerRef = useRef<HTMLDivElement | null>(null);
  const showFlipAnimationRef = useRef(false);
  const shuff = () => {
    Flip.first(Array.from(containerRef.current!.children) as HTMLElement[]);
    showFlipAnimationRef.current = true;
    updateList(
      list.slice().sort((a, b) => {
        return Math.random() > 0.5 ? -1 : 1;
      })
    );
  };

  useLayoutEffect(() => {
    if (showFlipAnimationRef.current) {
      const lis = Array.from(containerRef.current!.children) as HTMLElement[];
      Flip.lastAndInvert(lis);
      Flip.play(lis);
      showFlipAnimationRef.current = false;
    }
  }, [list]);
  return (
    <div>
      <div className="grid" ref={containerRef}>
        {list.map((item) => {
          return <div className="grid-item" key={item + ''}>{item}</div>;
        })}
      </div>
      <button onClick={shuff}>打乱顺序</button>
    </div>
  );
}

let count = 2;

const App = () => {
  const [fadeVisible, setFadeVisible] = useState(false);
  const [fadeLeftVisible, setFadeLeftVisible] = useState(false);
  const [switchKey, setSwitchKey] = useState(1);
  const [data, setData] = useState<any[]>([0, 1, 2, 3]);
  const onAdd = () => {
    setData((data) => {
      return [...data, data.length ? data[data.length - 1] + 1 : 0];
    });
  };
  const onRemoveSome = () => {
    const removeIndexs: number[] = [];
    for (let i = 0; i < 3; i++) {
      removeIndexs.push(Math.floor(Math.random() * data.length));
    }
    setData((data) => {
      return data.filter((_, index) => !removeIndexs.includes(index));
    });
  };
  const onRemove = (index) => {
    setData((data) => {
      return data.filter((_, ind) => ind !== index);
    });
  };
  return (
    <div
      style={{
        padding: '0 20px',
      }}
    >
      <h1>Flip</h1>
      <FlipApp />
      <h1>Transition</h1>
      <div>
        <button
          className="button"
          onClick={() => {
            setFadeVisible(!fadeVisible);
          }}
        >
          淡入/淡出
        </button>
        <Transition visible={fadeVisible} transitionName="fade">
          {(status, transitionClassName) => {
            console.log(status, transitionClassName)
            return (
              <div
                className={classNames('demoRect', transitionClassName)}
              ></div>
            );
          }}
        </Transition>
      </div>
      <div>
        <button
          className="button"
          onClick={() => {
            setFadeLeftVisible(!fadeLeftVisible);
          }}
        >
          左边淡入/淡出
        </button>
        <Transition visible={fadeLeftVisible} transitionName="fade-left">
          {(_, transitionClassName) => {
            return (
              <div
                className={classNames('demoRect', transitionClassName)}
              ></div>
            );
          }}
        </Transition>
      </div>
      <h1>SwitchTransition</h1>
      <button
        className="button"
        onClick={() => {
          console.log(count)
          setSwitchKey(count++);
        }}
      >
        切换过渡
      </button>
      <div>
        <SwitchTransition mode="out-in">
          <Transition duration={300} key={switchKey} transitionName="switch-ani">
            {(_, transitionClassName) => {
              return (
                <div className={classNames('demoRect', transitionClassName)}>
                  {switchKey}
                </div>
              );
            }}
          </Transition>
        </SwitchTransition>
      </div>
      <h1>TransitionGroup</h1>
      <button
        onClick={() => {
          onAdd();
        }}
        className="button"
      >
        添加一条
      </button>
      <button
        onClick={() => {
          onRemoveSome();
        }}
        className="button"
      >
        删除多条
      </button>
      <TransitionGroup>
        {data.map((item, index) => {
          return (
            <Transition key={item} transitionName="fade">
              {(_, transtionClassName) => {
                return (
                  <div className={classNames(transtionClassName, 'rect')}>
                    {item}
                    <span
                      style={{
                        width: 15,
                        height: 15,
                        backgroundColor: '#f00',
                        color: '#fff',
                        display: 'inline-flex',
                        borderRadius: 2,
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginLeft: 30,
                        cursor: 'pointer',
                      }}
                      onClick={() => {
                        onRemove(index);
                      }}
                    >
                      X
                    </span>
                  </div>
                );
              }}
            </Transition>
          );
        })}
      </TransitionGroup>
      <div
        style={{
          height: 500,
        }}
      ></div>
    </div>
  );
};

export default App;

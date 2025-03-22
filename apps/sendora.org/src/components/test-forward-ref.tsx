import React, {
  useState,
  useRef,
  useImperativeHandle,
  forwardRef,
} from 'react';

export interface ChildRef {
  increment: () => string;
  reset: () => void;
  getCount: () => number;
}
const Child = forwardRef((props, ref) => {
  const [count, setCount] = useState(0);

  useImperativeHandle(ref, () => ({
    increment: () => setCount((prev) => prev + 1),
    reset: () => setCount(0),
    getCount: () => count,
  }));

  return <h2>Count: {count}</h2>;
});

function Parent() {
  const childRef = useRef<ChildRef | null>(null);

  return (
    <div>
      <Child ref={childRef} />
      <button type="button" onClick={() => childRef?.current?.increment()}>
        Increment
      </button>
      <button type="button" onClick={() => childRef?.current?.reset()}>
        Reset
      </button>
      <button
        type="button"
        onClick={() => alert(childRef?.current?.getCount())}
      >
        Show Count
      </button>
    </div>
  );
}

export default Parent;

import React, { useState, useMemo } from 'react';

function MyComponent() {
  const [array, setArray] = useState([1, 2, 3]);

  const sum = useMemo(() => {
    console.log('Calculating sum...');
    return array.reduce((acc, curr) => acc + curr, 0);
  }, [array]);

  const addNumber = () => {
    setArray([...array, array.length + 1]);
  };

  const changeFirst = () => {
    array[0] = Math.random() * 10;
    setArray(array);
  };

  return (
    <div>
      <p>Array: {array.join(', ')}</p>
      <p>Sum: {sum}</p>
      <button onClick={addNumber}>Add Number</button>
      <button onClick={changeFirst}>Change First Number</button>
    </div>
  );
}

export default MyComponent;

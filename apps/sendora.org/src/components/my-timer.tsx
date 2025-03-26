import type React from 'react';
import { useEffect, useState } from 'react';

const MyTimer: React.FC = () => {
  const [seconds, setSeconds] = useState<number>(0);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setSeconds((prevSeconds) => prevSeconds + 1);
    }, 1000);

    return () => clearInterval(intervalId);
  }, []);

  return <span> {seconds} s</span>;
};

export default MyTimer;

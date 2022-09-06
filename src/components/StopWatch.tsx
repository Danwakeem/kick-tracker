import { useEffect, useState } from "react";
import { intervalToDuration } from 'date-fns';

export const zeroPad = (num: number) => String(num).padStart(2, '0');

export const StopWatch = ({
  started,
  duration,
  setDuration,
}: {
  started: boolean;
  duration: { start: number, end: number };
  setDuration: any,
}) => {
  const [isStarted, setIsStarted] = useState(started);

  const format = intervalToDuration(duration);

  useEffect(() => {
    let interval: any;
    if (!started) {
      setIsStarted(false);
      return;
    }
    const start = Date.now();
    if (!isStarted && started) {
      setIsStarted(true);
    }
    if (started) {
      interval = setInterval(() => {
        setDuration({
          start,
          end: Date.now(),
        });
      }, 1);
    }

    return () => clearInterval(interval);
  }, [started, isStarted, setDuration]);

  return (
    <h3 style={{ textAlign: 'center', margin: 0 }}>
      {zeroPad(format.hours || 0)}:{zeroPad(format.minutes || 0)}:{zeroPad(format.seconds || 0)}:{zeroPad(((duration.end - duration.start) % 1000) % 100)}
    </h3>
  );
}
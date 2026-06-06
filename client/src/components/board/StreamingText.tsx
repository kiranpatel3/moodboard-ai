import { useEffect, useState } from 'react';

interface StreamingTextProps {
  text: string;
  streamKey: string;
  className?: string;
  charDelayMs?: number;
}

export default function StreamingText({
  text,
  streamKey,
  className,
  charDelayMs = 16,
}: StreamingTextProps) {
  const [displayed, setDisplayed] = useState('');
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    setDisplayed('');
    setIsComplete(false);

    if (!text) {
      setIsComplete(true);
      return;
    }

    let index = 0;
    const interval = window.setInterval(() => {
      index += 1;
      setDisplayed(text.slice(0, index));

      if (index >= text.length) {
        window.clearInterval(interval);
        setIsComplete(true);
      }
    }, charDelayMs);

    return () => window.clearInterval(interval);
  }, [text, streamKey, charDelayMs]);

  return (
    <p className={className}>
      {displayed}
      {!isComplete && (
        <span
          aria-hidden="true"
          className="ml-0.5 inline-block h-4 w-0.5 animate-pulse bg-indigo-500 align-middle"
        />
      )}
    </p>
  );
}

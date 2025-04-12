import type React from 'react';
import { useEffect, useState } from 'react';

interface TypewriterProps {
  tips: string[];
  typingSpeed?: number; // Typing speed per character in milliseconds
  pauseDuration?: number; // Pause duration after each tip in milliseconds
}

const Typewriter: React.FC<TypewriterProps> = ({
  tips,
  typingSpeed = 100, // Default to 0.1 seconds per character
  pauseDuration = 2000, // Default to 2 seconds pause
}) => {
  const [currentTipIndex, setCurrentTipIndex] = useState(0);
  const [currentText, setCurrentText] = useState('');
  const [charIndex, setCharIndex] = useState(0);
  const [isTyping, setIsTyping] = useState(true);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    // Skip the effect if paused
    if (isPaused) return;

    const currentTip = tips[currentTipIndex];

    // Handle typing effect
    if (isTyping) {
      if (charIndex < currentTip.length) {
        const timeout = setTimeout(() => {
          setCurrentText((prev) => prev + currentTip.charAt(charIndex));
          setCharIndex(charIndex + 1);
        }, typingSpeed);
        return () => clearTimeout(timeout);
      }
      // Tip is fully typed, switch to pause mode
      setIsTyping(false);
    } else {
      // Handle pause after typing is complete
      const pauseTimeout = setTimeout(() => {
        // Reset for the next tip
        setCurrentText('');
        setCharIndex(0);
        setCurrentTipIndex((prev) => (prev + 1) % tips.length);
        setIsTyping(true); // Start typing the next tip
      }, pauseDuration);
      return () => clearTimeout(pauseTimeout);
    }
  }, [
    charIndex,
    isTyping,
    isPaused,
    currentTipIndex,
    tips,
    typingSpeed,
    pauseDuration,
  ]);

  // Pause typing on mouse hover, resume on mouse leave
  const handleMouseEnter = () => {
    setIsPaused(true);
  };

  const handleMouseLeave = () => {
    setIsPaused(false);
  };

  return (
    <div
      className="flex items-center w-full"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {currentText}
    </div>
  );
};

export default Typewriter;

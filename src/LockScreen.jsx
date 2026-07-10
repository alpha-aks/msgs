import React, { useState, useEffect } from 'react';
import { Lock, Heart } from 'lucide-react';

export default function LockScreen({ onUnlock }) {
  const [code, setCode] = useState('');
  const [error, setError] = useState(false);
  const [shake, setShake] = useState(false);

  const correctCode = '2512';

  const handleKeyPress = (num) => {
    if (code.length < 4) {
      const newCode = code + num;
      setCode(newCode);
      setError(false);

      if (newCode === correctCode) {
        setTimeout(() => {
          onUnlock();
        }, 300);
      } else if (newCode.length === 4) {
        // Wrong code entered
        setTimeout(() => {
          setShake(true);
          setError(true);
          setCode('');
          // Clear shake after animation completes
          setTimeout(() => setShake(false), 400);
        }, 200);
      }
    }
  };

  const handleBackspace = () => {
    setCode((prev) => prev.slice(0, -1));
    setError(false);
  };

  // Keyboard support
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key >= '0' && e.key <= '9') {
        handleKeyPress(e.key);
      } else if (e.key === 'Backspace') {
        handleBackspace();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [code]);

  return (
    <div className="lock-screen-wrapper">
      <div className={`glass-card ${shake ? 'animate-shake' : ''}`}>
        <div className="lock-header">
          <div className="lock-icon-outer animate-pulse-slow">
            <Lock size={32} />
          </div>
          <h2 className="lock-title">Our Private Space</h2>
          <p className="lock-subtitle">Enter our special anniversary date to unlock</p>
        </div>

        {/* Input dots */}
        <div className="dots-container">
          {[0, 1, 2, 3].map((index) => (
            <div
              key={index}
              className={`dot ${code.length > index ? 'active' : ''}`}
            />
          ))}
        </div>

        {/* Numpad Keypad */}
        <div className="numpad">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => {
            // Cute custom sub-letters for num keys like on a phone keyboard
            const subtext = {
              1: '❤',
              2: 'abc',
              3: 'def',
              4: 'ghi',
              5: 'jkl',
              6: 'mno',
              7: 'pqrs',
              8: 'tuv',
              9: 'wxyz',
            }[num];

            return (
              <button
                key={num}
                type="button"
                className="num-btn"
                onClick={() => handleKeyPress(num.toString())}
              >
                {num}
                <span className="num-sub">{subtext}</span>
              </button>
            );
          })}
          
          <button
            type="button"
            className="num-btn"
            style={{ fontSize: '0.9rem', fontWeight: 600 }}
            onClick={() => setCode('')}
          >
            Clear
          </button>

          <button
            type="button"
            className="num-btn"
            onClick={() => handleKeyPress('0')}
          >
            0
            <span className="num-sub">love</span>
          </button>

          <button
            type="button"
            className="num-btn"
            style={{ fontSize: '0.9rem', fontWeight: 600 }}
            onClick={handleBackspace}
          >
            Delete
          </button>
        </div>

        <div className="error-msg">
          {error ? "Incorrect date, my love. Try again! ❤" : ""}
        </div>
      </div>
    </div>
  );
}

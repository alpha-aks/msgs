import React, { useState, useEffect } from 'react';
import LockScreen from './LockScreen';
import Dashboard from './Dashboard';
import { Heart } from 'lucide-react';
import './App.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('isUnlocked') === 'true';
  });

  const [showerHearts, setShowerHearts] = useState([]);
  const [backgroundHearts, setBackgroundHearts] = useState([]);

  // Generate background floating hearts
  useEffect(() => {
    const hearts = Array.from({ length: 15 }).map((_, idx) => ({
      id: idx,
      size: Math.random() * 1.5 + 0.5, // 0.5 to 2rem
      left: Math.random() * 100, // 0 to 100%
      delay: Math.random() * 8, // 0 to 8s
      duration: Math.random() * 10 + 6, // 6 to 16s
      rotation: Math.random() * 360 // 0 to 360deg
    }));
    setBackgroundHearts(hearts);
  }, []);

  const handleUnlock = () => {
    localStorage.setItem('isUnlocked', 'true');
    setIsAuthenticated(true);
  };

  const handleLockOut = () => {
    localStorage.removeItem('isUnlocked');
    setIsAuthenticated(false);
  };

  // Shower of hearts action when clicking the floating bubble button
  const triggerHeartShower = () => {
    const newHearts = Array.from({ length: 25 }).map((_, idx) => {
      const id = Date.now() + idx;
      return {
        id,
        left: Math.random() * 100, // percentage
        size: Math.random() * 2 + 1, // rem size
        duration: Math.random() * 2.5 + 1.5, // speed
        rotation: Math.random() * 180 - 90 // random angle
      };
    });

    setShowerHearts((prev) => [...prev, ...newHearts]);

    // Clean up hearts after they finish animating to prevent DOM bloat
    setTimeout(() => {
      setShowerHearts((prev) => prev.filter((h) => !newHearts.some((nh) => nh.id === h.id)));
    }, 4500);
  };

  return (
    <div className="app-container">
      {/* Background Floating Hearts */}
      <div className="hearts-container">
        {backgroundHearts.map((heart) => (
          <div
            key={heart.id}
            className="floating-heart"
            style={{
              left: `${heart.left}%`,
              '--size': `${heart.size}rem`,
              '--delay': `${heart.delay}s`,
              '--duration': `${heart.duration}s`,
              '--rotation': `${heart.rotation}deg`,
            }}
          >
            ❤
          </div>
        ))}
      </div>

      {/* Screen Router */}
      {isAuthenticated ? (
        <Dashboard onLockOut={handleLockOut} />
      ) : (
        <LockScreen onUnlock={handleUnlock} />
      )}

      {/* Shower Hearts Overlay */}
      {showerHearts.map((heart) => (
        <div
          key={heart.id}
          className="shower-heart"
          style={{
            left: `${heart.left}%`,
            fontSize: `${heart.size}rem`,
            '--size': `${heart.size}rem`,
            '--duration': `${heart.duration}s`,
            '--rotation': `${heart.rotation}deg`,
            '--delay': '0s'
          }}
        >
          ❤
        </div>
      ))}

      {/* Floating Action Button for Sweet Heart Burst */}
      {isAuthenticated && (
        <button
          type="button"
          className="hearts-trigger-btn animate-pulse-slow"
          onClick={triggerHeartShower}
          title="Send hugs & kisses"
          aria-label="Send heart shower"
        >
          <Heart fill="white" size={24} />
        </button>
      )}
    </div>
  );
}

export default App;

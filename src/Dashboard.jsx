import React, { useState, useEffect, useRef } from 'react';
import { 
  Heart, MessageCircle, Calendar, FileText, Settings, 
  Send, Trash2, LogOut, Play, Pause, Sparkles, Plus 
} from 'lucide-react';
import { encryptJSON, decryptJSON } from './crypto';

const DB_URL = 'https://jsonblob.com/api/jsonBlob/019f4ca4-0beb-76b2-9344-b3398fb07dc4';

export default function Dashboard({ onLockOut }) {
  const [activeTab, setActiveTab] = useState('chat');
  const [currentUser, setCurrentUser] = useState('Me');
  const [partnerName, setPartnerName] = useState('My Love');
  const [anniversaryDate, setAnniversaryDate] = useState(() => {
    return localStorage.getItem('anniversaryDate') || '2024-12-25';
  });
  
  const [messages, setMessages] = useState([]);
  const [notes, setNotes] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [noteText, setNoteText] = useState('');
  
  // Together counter state
  const [timeLeft, setTimeLeft] = useState({
    days: 0, hours: 0, minutes: 0, seconds: 0
  });

  // Audio synthesis state
  const [isPlayingMusic, setIsPlayingMusic] = useState(false);
  const audioCtxRef = useRef(null);
  const synthIntervalRef = useRef(null);

  const messagesEndRef = useRef(null);

  // Fetch all data (messages and notes together from the single encrypted blob)
  const fetchData = async () => {
    try {
      const res = await fetch(DB_URL);
      if (res.ok) {
        const json = await res.json();
        if (json && json.data) {
          const decrypted = decryptJSON(json.data);
          if (decrypted) {
            if (decrypted.messages && Array.isArray(decrypted.messages)) {
              setMessages(decrypted.messages);
            }
            if (decrypted.notes && Array.isArray(decrypted.notes)) {
              setNotes(decrypted.notes);
            }
          }
        }
      }
    } catch (e) {
      console.error('Error fetching data from remote database:', e);
    }
  };

  // Save both messages and notes to the remote database
  const saveData = async (updatedMessages, updatedNotes) => {
    const payload = {
      messages: updatedMessages,
      notes: updatedNotes
    };
    try {
      const encrypted = encryptJSON(payload);
      await fetch(DB_URL, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ data: encrypted })
      });
    } catch (e) {
      console.error('Error saving data to remote database:', e);
    }
  };

  // Load initial data
  useEffect(() => {
    fetchData();
  }, []);

  // Poll for updates every 3 seconds
  useEffect(() => {
    const interval = setInterval(fetchData, 3000);
    return () => clearInterval(interval);
  }, []);

  // Auto-scroll chat
  useEffect(() => {
    if (activeTab === 'chat' && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, activeTab]);

  // Together counter effect
  useEffect(() => {
    const calculateTime = () => {
      const difference = +new Date() - +new Date(anniversaryDate);
      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60)
        });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };
    
    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [anniversaryDate]);

  // Love Melodies Web Audio Synthesizer
  const toggleMusic = () => {
    if (isPlayingMusic) {
      if (synthIntervalRef.current) clearInterval(synthIntervalRef.current);
      setIsPlayingMusic(false);
    } else {
      setIsPlayingMusic(true);
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
      }
      
      const notesList = [261.63, 293.66, 329.63, 349.23, 392.00, 440.00, 493.88, 523.25];
      let noteIndex = 0;

      const playCuteNote = () => {
        const ctx = audioCtxRef.current;
        if (!ctx) return;
        if (ctx.state === 'suspended') ctx.resume();

        const osc = ctx.createOscillator();
        const gainNode = ctx.createGain();

        osc.connect(gainNode);
        gainNode.connect(ctx.destination);

        const freq = notesList[noteIndex];
        osc.frequency.setValueAtTime(freq, ctx.currentTime);
        osc.type = 'triangle';

        gainNode.gain.setValueAtTime(0, ctx.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.08, ctx.currentTime + 0.1);
        gainNode.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 1.2);

        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 1.2);

        noteIndex = (noteIndex + Math.floor(Math.random() * 3) + 1) % notesList.length;
      };

      playCuteNote();
      synthIntervalRef.current = setInterval(playCuteNote, 800);
    }
  };

  useEffect(() => {
    return () => {
      if (synthIntervalRef.current) clearInterval(synthIntervalRef.current);
    };
  }, []);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const newMsg = {
      id: Date.now(),
      sender: currentUser,
      text: inputText.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const updatedMessages = [...messages, newMsg];

    // Optimistically update UI
    setMessages(updatedMessages);
    setInputText('');

    // Save to remote DB
    await saveData(updatedMessages, notes);
  };

  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!noteText.trim()) return;

    const newNote = {
      id: Date.now(),
      text: noteText.trim(),
      date: new Date().toLocaleDateString(),
      rot: Math.floor(Math.random() * 8) - 4
    };

    const updatedNotes = [newNote, ...notes];

    // Optimistically update UI
    setNotes(updatedNotes);
    setNoteText('');

    // Save to remote DB
    await saveData(messages, updatedNotes);
  };

  const handleDeleteNote = async (id) => {
    const updatedNotes = notes.filter(note => note.id !== id);
    setNotes(updatedNotes);

    // Save to remote DB
    await saveData(messages, updatedNotes);
  };

  const handleSaveSettings = () => {
    localStorage.setItem('anniversaryDate', anniversaryDate);
    alert('Settings Saved! Your together-timer has updated. ❤');
  };

  return (
    <div className="dashboard-wrapper">
      {/* Header */}
      <div className="dashboard-header">
        <div className="brand">
          <Heart className="brand-heart animate-beat" fill="#ff6584" size={28} />
          <h1>Our Love Space</h1>
        </div>
        <button type="button" className="lock-out-btn" onClick={onLockOut}>
          <LogOut size={16} />
          Lock Space
        </button>
      </div>

      {/* Tabs */}
      <div className="tabs-nav">
        <button 
          className={`tab-btn ${activeTab === 'chat' ? 'active' : ''}`}
          onClick={() => setActiveTab('chat')}
        >
          <MessageCircle size={18} />
          Our Chat
        </button>
        <button 
          className={`tab-btn ${activeTab === 'counter' ? 'active' : ''}`}
          onClick={() => setActiveTab('counter')}
        >
          <Calendar size={18} />
          Together
        </button>
        <button 
          className={`tab-btn ${activeTab === 'notes' ? 'active' : ''}`}
          onClick={() => setActiveTab('notes')}
        >
          <FileText size={18} />
          Love Notes
        </button>
        <button 
          className={`tab-btn ${activeTab === 'settings' ? 'active' : ''}`}
          onClick={() => setActiveTab('settings')}
        >
          <Settings size={18} />
          Config
        </button>
      </div>

      {/* Tab Panels */}
      <div className="glass-card" style={{ flex: 1, padding: '20px', minHeight: '400px', display: 'flex', flexDirection: 'column' }}>
        
        {/* Chat Tab */}
        {activeTab === 'chat' && (
          <div className="chat-container">
            <div className="chat-messages">
              {messages.length === 0 ? (
                <div style={{ textAlign: 'center', color: 'var(--text-muted)', margin: 'auto' }}>
                  <Heart size={48} className="animate-pulse-slow" style={{ color: 'var(--primary-pink)', marginBottom: '15px' }} />
                  <p>No messages yet. Send your first sweet message to start! ❤</p>
                </div>
              ) : (
                messages.map((msg) => {
                  const isSelf = msg.sender === currentUser;
                  return (
                    <div key={msg.id} className={`message-bubble-wrapper ${isSelf ? 'self' : 'other'}`}>
                      <span className="message-meta">
                        {msg.sender} • {msg.time}
                      </span>
                      <div className="message-bubble">
                        {msg.text}
                      </div>
                    </div>
                  );
                })
              )}
              {isTyping && (
                <div className="message-bubble-wrapper other">
                  <span className="message-meta">{currentUser === 'Me' ? partnerName : 'Me'} is typing...</span>
                  <div className="message-bubble" style={{ opacity: 0.6 }}>
                    ✍ typing...
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSendMessage} className="chat-input-bar">
              <select 
                className="sender-select" 
                value={currentUser}
                onChange={(e) => setCurrentUser(e.target.value)}
              >
                <option value="Me">Send as: Me</option>
                <option value="My Love">Send as: My Love</option>
              </select>
              <input 
                type="text" 
                className="chat-input"
                placeholder="Write a sweet message..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
              />
              <button type="submit" className="send-btn">
                <Send size={18} />
              </button>
            </form>
          </div>
        )}

        {/* Counter Tab */}
        {activeTab === 'counter' && (
          <div className="counter-view">
            <div className="heart-mascot animate-beat">
              <Heart fill="#ff6584" size={72} />
            </div>
            
            <h2 style={{ fontSize: '1.8rem', marginBottom: '8px', color: 'var(--text-dark)' }}>We've been together for:</h2>
            
            <div className="time-grid">
              <div className="time-box">
                <span className="time-num">{timeLeft.days}</span>
                <span className="time-label">Days</span>
              </div>
              <div className="time-box">
                <span className="time-num">{timeLeft.hours}</span>
                <span className="time-label">Hours</span>
              </div>
              <div className="time-box">
                <span className="time-num">{timeLeft.minutes}</span>
                <span className="time-label">Mins</span>
              </div>
              <div className="time-box">
                <span className="time-num">{timeLeft.seconds}</span>
                <span className="time-label">Secs</span>
              </div>
            </div>

            <div className="counter-footer">
              <div className="anniversary-badge">
                <Sparkles size={16} />
                Anniversary: {new Date(anniversaryDate).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
              </div>
            </div>
          </div>
        )}

        {/* Notes Tab */}
        {activeTab === 'notes' && (
          <div className="notes-container">
            <form onSubmit={handleAddNote} className="notes-header">
              <input 
                type="text" 
                className="note-input"
                placeholder="Leave a sweet reminder or note..."
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
              />
              <button type="submit" className="add-note-btn">
                <Plus size={18} />
                Post Note
              </button>
            </form>

            {notes.length === 0 ? (
              <div style={{ textAlign: 'center', color: 'var(--text-muted)', margin: '40px 0' }}>
                <p>No sticky notes posted. Write one above to place it on the board! 📝</p>
              </div>
            ) : (
              <div className="notes-grid">
                {notes.map((note) => (
                  <div 
                    key={note.id} 
                    className="sticky-note"
                    style={{ '--rotation': `${note.rot}deg` }}
                  >
                    <span className="note-text">{note.text}</span>
                    <div className="note-bottom">
                      <span>{note.date}</span>
                      <button 
                        type="button" 
                        className="delete-note-btn"
                        onClick={() => handleDeleteNote(note.id)}
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="settings-container">
            <div className="settings-group">
              <h3>Customize Anniversary Timer</h3>
              <div className="settings-card">
                <div className="settings-row">
                  <label htmlFor="anniversary-input">Our Anniversary Date</label>
                  <input 
                    id="anniversary-input"
                    type="date" 
                    className="settings-input"
                    value={anniversaryDate}
                    onChange={(e) => setAnniversaryDate(e.target.value)}
                  />
                </div>
                
                <button type="button" className="save-settings-btn" onClick={handleSaveSettings}>
                  Save Date
                </button>
              </div>
            </div>

            <div className="settings-group">
              <h3>Cute Couple Ambient Music</h3>
              <div className="music-player-widget">
                <div className="music-info">
                  <p className="music-title">Love Melody Synth Loop</p>
                  <p className="music-artist">Synthesized Live WebAudio</p>
                </div>
                <div className="music-controls">
                  <button 
                    type="button" 
                    className="music-control-btn"
                    onClick={toggleMusic}
                    aria-label={isPlayingMusic ? "Pause" : "Play"}
                  >
                    {isPlayingMusic ? <Pause size={24} /> : <Play size={24} />}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

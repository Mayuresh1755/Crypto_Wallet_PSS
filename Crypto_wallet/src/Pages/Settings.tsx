import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
//import { useTheme } from './ThemeContext'; // adjust path if needed
import './Settings.css';

// Define props interface to accept onLogout
interface SettingsProps {
  onLogout: () => void;
}

export default function Settings({ onLogout }: SettingsProps) {
  const navigate = useNavigate();

  // Theme state - load from localStorage or default to 'system'
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('theme') || 'system';
  });

  // Other settings states
  const [currency, setCurrency] = useState('USD - United States Dollar');
  const [language, setLanguage] = useState('English');
  const [showNativeAsMain, setShowNativeAsMain] = useState(false);
  const [hideZeroBalance, setHideZeroBalance] = useState(false);

  // Apply theme to document root
  useEffect(() => {
    const root = document.documentElement;

    if (theme === 'light') {
      root.classList.remove('dark');
      root.classList.add('light');
      localStorage.setItem('theme', 'light');
    } else if (theme === 'dark') {
      root.classList.remove('light');
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      // system
      root.classList.remove('light', 'dark');
      localStorage.setItem('theme', 'system');
    }
  }, [theme]);

  // Handle system theme changes when 'system' is selected
  useEffect(() => {
  const root = document.documentElement;

  if (theme === 'system') {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    root.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
    localStorage.setItem('theme', 'system');
  } else {
    root.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }
}, [theme]);

// Keep the system preference listener
useEffect(() => {
  if (theme !== 'system') return;

  const media = window.matchMedia('(prefers-color-scheme: dark)');

  const handleChange = () => {
    document.documentElement.setAttribute('data-theme', media.matches ? 'dark' : 'light');
  };

  media.addEventListener('change', handleChange);
  handleChange();

  return () => media.removeEventListener('change', handleChange);
}, [theme]);


  return (
    <div className="settings-page">
      <header className="settings-header">
        <h1>Settings</h1>

        <div className="search-center">
          <input type="text" placeholder="Search" className="search-input" />
        </div>

        <button className="close-button" onClick={() => navigate('/')}>
          ×
        </button>
      </header>

      <div className="settings-body">
        <nav className="settings-sidebar">
          <div className="menu-item active">
            <span className="menu-icon">⚙</span>
            General
          </div>
        </nav>

        <main className="settings-main">
          <h2>General</h2>

          <section className="setting-group">
            <div className="setting-row">
              <label className="setting-label">Currency</label>
              <select value={currency} onChange={(e) => setCurrency(e.target.value)}>
                <option>USD - United States Dollar</option>
                <option>EUR - Euro</option>
                <option>GBP - British Pound</option>
                <option>JPY - Japanese Yen</option>
              </select>
            </div>

            <div className="setting-row toggle-row">
              <label className="setting-label">Show native token as main balance</label>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={showNativeAsMain}
                  onChange={() => setShowNativeAsMain(!showNativeAsMain)}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>

            <div className="setting-row">
              <label className="setting-label">Current language</label>
              <select value={language} onChange={(e) => setLanguage(e.target.value)}>
                <option>English</option>
                <option>Español</option>
                <option>Français</option>
                <option>Deutsch</option>
              </select>
            </div>

            <div className="setting-row">
              <label className="setting-label">Theme</label>
              <select value={theme} onChange={(e) => setTheme(e.target.value)}>
                <option value="system">System</option>
                <option value="light">Light</option>
                <option value="dark">Dark</option>
              </select>
            </div>

            <div className="setting-row toggle-row">
              <label className="setting-label">Hide tokens without balance</label>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={hideZeroBalance}
                  onChange={() => setHideZeroBalance(!hideZeroBalance)}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>

            {/* Logout button - placed at the bottom */}
            <div className="setting-row" style={{ marginTop: '2.5rem', justifyContent: 'center' }}>
              <button
                onClick={onLogout}
                style={{
                  padding: '0.9rem 2.5rem',
                  fontSize: '1.1rem',
                  fontWeight: 500,
                  backgroundColor: '#ef4444', // red for logout action
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = '#dc2626';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = '#ef4444';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                Log Out
              </button>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
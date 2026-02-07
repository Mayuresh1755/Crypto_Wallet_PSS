import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Auth.css';  // ← import the CSS file

interface AuthProps {
  onLogin: () => void;
}

export default function Auth({ onLogin }: AuthProps) {
  const navigate = useNavigate();

  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  // States for recovery phrase modal
  const [showRecoveryModal, setShowRecoveryModal] = useState(false);
  const [recoveryPhrase, setRecoveryPhrase] = useState('');
  const [copySuccess, setCopySuccess] = useState(false);

  // Loading screen after continue
  const [showLoading, setShowLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError('Please fill in both email and password');
      return;
    }

    try {
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';

      const response = await fetch(`http://localhost:5000${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Something went wrong');
      }

      localStorage.setItem('token', data.token);

      if (!isLogin && data.recoveryPhrase) {
        setRecoveryPhrase(data.recoveryPhrase);
        setShowRecoveryModal(true);
      } else {
        onLogin();
        navigate('/', { replace: true });
      }
    } catch (err: any) {
      setError(err.message || 'Network error - is backend running?');
      console.error('Auth error:', err);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setError(null);
    setEmail('');
    setPassword('');
  };

  const copyRecoveryPhrase = () => {
    navigator.clipboard.writeText(recoveryPhrase).then(() => {
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    }).catch(err => {
      console.error('Failed to copy:', err);
    });
  };

  const handleCloseRecoveryModal = () => {
    setShowRecoveryModal(false);
    setRecoveryPhrase('');

    setShowLoading(true);

    setTimeout(() => {
      setShowLoading(false);
      onLogin();
      navigate('/', { replace: true });
    }, 2000);
  };

  const title = isLogin ? 'Login to CryptoWallet' : 'Create Account';
  const buttonText = isLogin ? 'Continue' : 'Sign Up';
  const switchText = isLogin ? "Don't have an account? " : "Already have an account? ";
  const switchLinkText = isLogin ? 'Sign up' : 'Login';

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1 className="auth-title">
          <i className="fa-solid fa-wallet"></i>
          {title}
        </h1>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              autoFocus
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="form-input"
            />
          </div>

          <button type="submit" className="submit-btn">
            {buttonText}
          </button>
        </form>

        <p className="switch-text">
          {switchText}
          <button type="button" onClick={toggleMode} className="switch-link">
            {switchLinkText}
          </button>
        </p>
      </div>

      {/* Recovery Phrase Modal */}
      {showRecoveryModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2 className="modal-title">Important: Secret Recovery Phrase</h2>

            <p className="modal-warning-bold">
              Copy the secret recovery phrase. It won't be visible again.
            </p>

            <div className="recovery-phrase-box">
              {recoveryPhrase}

              <button
                onClick={() => {
                  navigator.clipboard.writeText(recoveryPhrase).then(() => {
                    setCopySuccess(true);
                    setTimeout(() => setCopySuccess(false), 2000);
                  });
                }}
                className="copy-icon-btn"
                title="Copy recovery phrase"
              >
                <i className="fa-solid fa-copy"></i>
              </button>

              {copySuccess && <span className="copy-success">Copied!</span>}
            </div>

            <p className="modal-warning">
              Write it down and store it securely offline.  
              <strong> Anyone with this phrase can access your wallet and funds permanently.</strong>
            </p>

            <div className="modal-actions">
              <button onClick={handleCloseRecoveryModal} className="continue-btn">
                I've saved it – Continue to Dashboard
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Loading Screen */}
      {showLoading && (
        <div className="modal-overlay">
          <div className="modal-content loading-content">
            <h2 className="loading-title">Wallet is being created...</h2>
            <div className="loading-spinner"></div>
          </div>
        </div>
      )}
    </div>
  );
}
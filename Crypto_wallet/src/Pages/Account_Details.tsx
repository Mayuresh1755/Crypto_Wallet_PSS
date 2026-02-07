import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import './Account_Details.css';

export default function Account_Details() {
  const navigate = useNavigate();

  // ── Account Name ──────────────────────────────────────────────────────
  const [accountName, setAccountName] = useState('Account 1');
  const [newName, setNewName] = useState(accountName);
  const [isNameModalOpen, setIsNameModalOpen] = useState(false);
  const [nameLoading, setNameLoading] = useState(false);
  const [nameError, setNameError] = useState('');

  // ── Private Key states ────────────────────────────────────────────────
  const [showPrivateKey, setShowPrivateKey] = useState(false);
  const [revealedPrivateKey, setRevealedPrivateKey] = useState('');
  const [isAuthorizedForPrivateKey, setIsAuthorizedForPrivateKey] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  const [isPrivateKeyModalOpen, setIsPrivateKeyModalOpen] = useState(false);
  const [enteredPassword, setEnteredPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // ── Recovery Phrase states ────────────────────────────────────────────
  const [showRecoveryPhrase, setShowRecoveryPhrase] = useState(false);
  const [isRecoveryWarningOpen, setIsRecoveryWarningOpen] = useState(false);
  const [selectedRiskOption, setSelectedRiskOption] = useState<
    'can-recover' | 'cannot-recover' | null
  >(null);
  const [hasAcknowledgedRisk, setHasAcknowledgedRisk] = useState(false);

  // Demo / placeholder data
  const walletName = 'Wallet 1';
  const networksCount = 10;
  const recoveryPhrase =
    'apple banana cherry date elderberry fig grape honeydew igloo jelly kiwi lemon mango';

  // ── Load account name ─────────────────────────────────────────────────
  useEffect(() => {
    const fetchAccountName = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;

      try {
        const res = await fetch('http://localhost:5000/api/auth/me', {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) throw new Error();

        const data = await res.json();
        if (data.accountName) {
          setAccountName(data.accountName);
          setNewName(data.accountName);
          localStorage.setItem('accountName', data.accountName);
        }
      } catch (err) {
        console.error('Failed to load account name from server', err);
        const saved = localStorage.getItem('accountName');
        if (saved) {
          setAccountName(saved);
          setNewName(saved);
        }
      }
    };

    fetchAccountName();
  }, []);

  // ── Handlers ──────────────────────────────────────────────────────────

  const handleAccountNameClick = () => {
    setNewName(accountName);
    setNameError('');
    setIsNameModalOpen(true);
  };

  const handleSaveName = async () => {
    const trimmed = newName.trim();
    if (!trimmed) {
      setNameError('Name cannot be empty');
      return;
    }

    setNameLoading(true);
    setNameError('');

    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/auth/update-account-name', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: trimmed }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update');

      setAccountName(data.accountName);
      localStorage.setItem('accountName', data.accountName);
      setIsNameModalOpen(false);
    } catch (err: any) {
      setNameError(err.message || 'Error saving name');
    } finally {
      setNameLoading(false);
    }
  };

  const handleNetworksClick = () => console.log('Networks clicked');
  const handleWalletClick = () => console.log('Wallet clicked');

  // Private key handlers
  const requestPrivateKeyAccess = () => {
    if (isAuthorizedForPrivateKey) {
      setShowPrivateKey(true);
      setTimeout(() => {
        setShowPrivateKey(false);
        setRevealedPrivateKey('');
      }, 60000);
    } else {
      setEnteredPassword('');
      setPasswordError('');
      setIsLoading(false);
      setIsPrivateKeyModalOpen(true);
    }
  };

  const handleUnlockPrivateKey = async () => {
    if (!enteredPassword.trim()) {
      setPasswordError('Password is required');
      return;
    }

    setIsLoading(true);
    setPasswordError('');

    try {
      const res = await fetch('http://localhost:5000/api/auth/verify-for-private-key', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
        },
        body: JSON.stringify({ password: enteredPassword }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Verification failed');

      setRevealedPrivateKey(data.privateKey);
      setShowPrivateKey(true);
      setIsAuthorizedForPrivateKey(true);
      setIsPrivateKeyModalOpen(false);
      setEnteredPassword('');

      setTimeout(() => {
        setShowPrivateKey(false);
        setRevealedPrivateKey('');
      }, 60000);
    } catch (err: any) {
      setPasswordError(err.message || 'Incorrect password or server error');
    } finally {
      setIsLoading(false);
    }
  };

  const copyPrivateKey = () => {
    if (revealedPrivateKey) {
      navigator.clipboard
        .writeText(revealedPrivateKey)
        .then(() => {
          setCopySuccess(true);
          setTimeout(() => setCopySuccess(false), 2000);
        })
        .catch((err) => console.error('Copy failed:', err));
    }
  };

  // ── Recovery Phrase Handlers ──────────────────────────────────────────

  const handleRevealRecoveryClick = () => {
    if (showRecoveryPhrase) {
      setShowRecoveryPhrase(false);
    } else {
      setSelectedRiskOption(null);
      setHasAcknowledgedRisk(false);
      setIsRecoveryWarningOpen(true);
    }
  };

  const handleSelectRiskOption = (option: 'can-recover' | 'cannot-recover') => {
    setSelectedRiskOption(option);
    setHasAcknowledgedRisk(option === 'cannot-recover');
  };

  const handleConfirmRisk = () => {
    if (hasAcknowledgedRisk) {
      setIsRecoveryWarningOpen(false);
      setShowRecoveryPhrase(true);
      setSelectedRiskOption(null);
    }
  };

  const handleCloseWarning = () => {
    setIsRecoveryWarningOpen(false);
    setSelectedRiskOption(null);
    setHasAcknowledgedRisk(false);
  };

  // Sliced private key display
  const slicedPrivateKey = revealedPrivateKey
    ? `${revealedPrivateKey.slice(0, 6)}...${revealedPrivateKey.slice(-6)}`
    : '';

  // ── Render ─────────────────────────────────────────────────────────────

  return (
    <div className="account-page">
      {/* Header */}
      <div className="account-header">
        <button className="back-btn" onClick={() => navigate('/')}>
          ←
        </button>
        <h1 className="account-title">{accountName}</h1>
      </div>

      {/* Icon */}
      <div className="account-icon-container">
        <div className="account-icon">
          <span className="icon-placeholder">✕</span>
        </div>
      </div>

      {/* Sections */}
      <div className="account-sections">
        <div className="account-card">
          <div className="account-row clickable" onClick={handleAccountNameClick}>
            <div className="row-label">Account name</div>
            <div className="row-value">{accountName}</div>
          </div>

          <div className="account-row clickable" onClick={handleNetworksClick}>
            <div className="row-label">Networks</div>
            <div className="row-value">{networksCount} addresses</div>
          </div>

          <div className="account-row clickable" onClick={requestPrivateKeyAccess}>
            <div className="row-label">Private keys</div>
            <div className="row-value">
              {showPrivateKey ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontFamily: 'monospace', wordBreak: 'break-all' }}>
                    {slicedPrivateKey}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      copyPrivateKey();
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: '#a78bfa',
                      fontSize: '18px',
                    }}
                    title="Copy full private key"
                  >
                    <i className="fa-solid fa-copy"></i>
                  </button>
                  {copySuccess && (
                    <span style={{ color: '#22c55e', fontSize: '14px' }}>Copied!</span>
                  )}
                </div>
              ) : (
                'Unlock to reveal'
              )}
            </div>
          </div>
        </div>

        <div className="account-card">
          <div className="account-row clickable" onClick={handleWalletClick}>
            <div className="row-label">Wallet</div>
            <div className="row-value">{walletName}</div>
          </div>
        </div>

        <div className="account-card">
          <div className="account-row clickable" onClick={handleRevealRecoveryClick}>
            <div className="row-label">Secret Recovery Phrase</div>
            <div className="row-value">
              {showRecoveryPhrase ? recoveryPhrase : 'Reveal'}
            </div>
          </div>
        </div>
      </div>

      {showRecoveryPhrase && (
        <div className="security-warning">
          Never share your recovery phrase with anyone. Anyone with this phrase can access your wallet and funds.
        </div>
      )}

      {/* ACCOUNT NAME MODAL */}
      {isNameModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Edit Account Name</h2>
            <div className="current-name">
              <label>Current name:</label>
              <p>{accountName}</p>
            </div>
            <div className="input-group">
              <label>New account name:</label>
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                autoFocus
                maxLength={100}
              />
              {nameError && <div className="error-message">{nameError}</div>}
            </div>
            <div className="modal-actions">
              <button
                className="btn cancel"
                onClick={() => setIsNameModalOpen(false)}
                disabled={nameLoading}
              >
                Cancel
              </button>
              <button
                className="btn save"
                onClick={handleSaveName}
                disabled={nameLoading}
              >
                {nameLoading ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PRIVATE KEY PASSWORD MODAL */}
      {isPrivateKeyModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Enter Password</h2>
            <p style={{ color: '#a0a0c0', marginBottom: '20px', textAlign: 'center' }}>
              Enter your login password to view the private key.
            </p>

            <div className="input-group">
              <label>Password</label>
              <input
                type="password"
                value={enteredPassword}
                onChange={(e) => {
                  setEnteredPassword(e.target.value);
                  setPasswordError('');
                }}
                placeholder="Enter your password"
                autoFocus
                disabled={isLoading}
              />
              {passwordError && <div className="error-message">{passwordError}</div>}
            </div>

            <div className="modal-actions">
              <button
                className="btn cancel"
                onClick={() => {
                  setIsPrivateKeyModalOpen(false);
                  setPasswordError('');
                  setEnteredPassword('');
                }}
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
                className="btn save"
                onClick={handleUnlockPrivateKey}
                disabled={isLoading}
              >
                {isLoading ? 'Verifying...' : 'Unlock'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* RECOVERY PHRASE WARNING MODAL */}
      {isRecoveryWarningOpen && (
        <div className="modal-overlay">
          <div className="modal-content recovery-warning-modal">
            <button className="modal-close" onClick={handleCloseWarning}>
              ×
            </button>

            <h2>If you lose your Secret Recovery Phrase, MetaMask...</h2>

            <div className="warning-options">
              <button
                className={`warning-btn ${
                  selectedRiskOption === 'can-recover' ? 'selected false-option' : 'false-option'
                }`}
                onClick={() => handleSelectRiskOption('can-recover')}
              >
                Can get it back for you
              </button>

              <button
                className={`warning-btn ${
                  selectedRiskOption === 'cannot-recover'
                    ? 'selected correct-option'
                    : 'correct-option'
                }`}
                onClick={() => handleSelectRiskOption('cannot-recover')}
              >
                Can’t help you
              </button>
            </div>

            {/* The explanatory warning text has been removed as requested */}

            <button
              className="btn continue-btn"
              disabled={!hasAcknowledgedRisk}
              onClick={handleConfirmRisk}
            >
              Continue
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
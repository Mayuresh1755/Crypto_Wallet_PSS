import { Routes, Route, Link, useLocation, Navigate, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import './App.css';

// Pages
import Auth from './Pages/Auth';
import Send from './Pages/Send';
import Receive from './Pages/Receive';
import Notification from './Pages/Notification';
import Account_Details from './Pages/Account_Details';
import Networks from './Pages/Networks';
import Settings from './Pages/Settings';
import Wallet from './Pages/Wallet'; // ← Wallet page import

function App() {
  const location = useLocation();
  const navigate = useNavigate();

  // Check if user is authenticated by looking for the token
  const isAuthenticated = !!localStorage.getItem('token');

  // Logout function
  const logout = () => {
    localStorage.removeItem('token');
    window.dispatchEvent(new Event('auth-logout'));
    navigate('/auth', { replace: true });
  };

  // Protected layout — shows sidebar + main content only when logged in
  const ProtectedLayout = () => {
    if (!isAuthenticated) {
      return <Navigate to="/auth" replace />;
    }

    return (
      <div className="layout">
        {/* Sidebar – visible on all protected pages */}
        <aside className="sidebar">
          <Link to="/" className="logo">
            <i className="fa-solid fa-wallet"></i>
            CryptoWallet
          </Link>

          <Link
            to="/wallet"
            className={`menu-item ${location.pathname === '/wallet' ? 'active' : ''}`}
          >
            <i className="fa-solid fa-wallet"></i>
            Wallet
          </Link>

          <Link
            to="/account-details"
            className={`menu-item ${location.pathname === '/account-details' ? 'active' : ''}`}
          >
            <i className="fa-solid fa-user"></i>
            Account Details
          </Link>

          <Link
            to="/networks"
            className={`menu-item ${location.pathname === '/networks' ? 'active' : ''}`}
          >
            <i className="fa-solid fa-network-wired"></i>
            Networks
          </Link>

          {/* Wallet link */}
          
          <Link
            to="/notification"
            className={`menu-item ${location.pathname === '/notification' ? 'active' : ''}`}
          >
            <i className="fa-solid fa-bell"></i>
            Notification
          </Link>

          <div className="sidebar-bottom">
            <Link
              to="/settings"
              className={`menu-item ${location.pathname === '/settings' ? 'active' : ''}`}
            >
              <i className="fa-solid fa-gear"></i>
              Settings
            </Link>
          </div>
        </aside>

        {/* Main content */}
        <main className="main">
          <Routes>
            {/* Dashboard (home) – now fetches real data */}
            <Route path="/" element={<Dashboard />} />

            <Route path="/send" element={<Send />} />
            <Route path="/receive" element={<Receive />} />
            <Route path="/notification" element={<Notification />} />
            <Route path="/account-details" element={<Account_Details />} />
            <Route path="/networks" element={<Networks />} />
            <Route path="/wallet" element={<Wallet />} />

            {/* Settings with logout */}
            <Route path="/settings" element={<Settings onLogout={logout} />} />

            {/* Catch-all → redirect to dashboard */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    );
  };

  // NEW: Dashboard component with real balance/network fetch
  const Dashboard = () => {
    const [balance, setBalance] = useState('$0.00');
    const [network, setNetwork] = useState('Ethereum Mainnet');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      const fetchWalletInfo = async () => {
        const token = localStorage.getItem('token');
        if (!token) return;

        try {
          const res = await fetch('http://localhost:5000/api/wallet/info', {
            headers: { 'Authorization': `Bearer ${token}` }
          });

          if (!res.ok) throw new Error('Failed to fetch');

          const data = await res.json();

          setBalance(`$${Number(data.balance || 0).toFixed(2)}`);
          setNetwork(data.network || 'Ethereum Mainnet');
        } catch (err) {
          console.error('Failed to fetch wallet info:', err);
          // Fallback mock data
          setBalance('$127,845.32');
          setNetwork('Ethereum Mainnet');
        } finally {
          setLoading(false);
        }
      };

      fetchWalletInfo();
    }, []);

    if (loading) {
      return (
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '80vh', 
          color: '#a78bfa' 
        }}>
          Loading wallet data...
        </div>
      );
    }

    return (
      <>
        <div className="portfolio-card">
          <div className="portfolio-title">Total Portfolio Value ({network})</div>
          <div className="portfolio-value">{balance}</div>
          <div className="change positive">+12.5% Last 24 hours</div>
        </div>

        <div className="actions">
          <div className="action-btn">
            <i className="fa-solid fa-plus"></i>
            <span>Add Funds</span>
          </div>
          <div className="action-btn">
            <i className="fa-solid fa-dollar-sign"></i>
            <span>Bridge</span>
          </div>
          <div className="action-btn">
            <Link
              to="/send"
              style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}
            >
              <i className="fa-solid fa-paper-plane"></i>
              <span>Send</span>
            </Link>
          </div>
          <div className="action-btn">
            <Link
              to="/receive"
              style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}
            >
              <i className="fa-solid fa-qrcode"></i>
              <span>Receive</span>
            </Link>
          </div>
        </div>

        <h2 className="tokens-title">Tokens</h2>

        <div className="token-list">
          {/* Bitcoin */}
          <div className="token-item">
            <div className="token-icon" style={{ background: "#f7931a", color: "black" }}>
              B
            </div>
            <div className="token-info">
              <div className="token-name">Bitcoin</div>
              <div className="token-symbol">BTC</div>
            </div>
            <div className="token-value-block">
              <div className="token-value">$65,432.50</div>
              <div className="token-change positive">↑ +5.24%</div>
            </div>
          </div>

          {/* Ethereum */}
          <div className="token-item">
            <div className="token-icon" style={{ background: "#627eea", color: "white" }}>
              E
            </div>
            <div className="token-info">
              <div className="token-name">Ethereum</div>
              <div className="token-symbol">ETH</div>
            </div>
            <div className="token-value-block">
              <div className="token-value">$3,421.85</div>
              <div className="token-change positive">↑ +3.67%</div>
            </div>
          </div>

          {/* Solana */}
          <div className="token-item">
            <div className="token-icon" style={{ background: "#00ffa3", color: "black" }}>
              S
            </div>
            <div className="token-info">
              <div className="token-name">Solana</div>
              <div className="token-symbol">SOL</div>
            </div>
            <div className="token-value-block">
              <div className="token-value">$182.45</div>
              <div className="token-change positive">↑ +7.89%</div>
            </div>
          </div>
        </div>
      </>
    );
  };

  return (
    <Routes>
      {/* Public route - Login / Signup */}
      <Route path="/auth" element={<Auth onLogin={() => { }} />} />

      {/* Root route - redirect based on auth state */}
      <Route
        path="/"
        element={isAuthenticated ? <ProtectedLayout /> : <Navigate to="/auth" replace />}
      />

      {/* All other protected routes */}
      <Route path="/*" element={<ProtectedLayout />} />
    </Routes>
  );
}

export default App;
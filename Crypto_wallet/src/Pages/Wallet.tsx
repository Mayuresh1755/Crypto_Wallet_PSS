import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Wallet.css'

export default function Wallet() {
  const navigate = useNavigate();

  const [walletData, setWalletData] = useState({
    totalBalance: '$0.00',
    tokens: [] as { symbol: string; amount: string; value: string }[],
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch wallet data (mocked for now – replace with real backend call later)
  useEffect(() => {
    const fetchWallet = async () => {
      try {
        setLoading(true);

        // Mock data (replace with real API fetch when ready)
        const mockData = {
          totalBalance: '$12,845.67',
          tokens: [
            { symbol: 'ETH', amount: '3.245', value: '$8,120.50' },
            { symbol: 'USDC', amount: '4,250.00', value: '$4,250.00' },
            { symbol: 'BTC', amount: '0.085', value: '$475.17' },
            { symbol: 'LINK', amount: '12.45', value: '$189.90' },
          ],
        };

        setWalletData(mockData);
      } catch (err) {
        setError('Failed to load wallet data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchWallet();
  }, []);

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#0f0f17',
        color: '#e0e0ff'
      }}>
        <div>Loading wallet...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#0f0f17',
        color: '#f87171'
      }}>
        {error}
      </div>
    );
  }

  return (
    <div className="wallet-page" style={{ 
      minHeight: '100vh', 
      background: '#0f0f17', 
      color: '#e0e0ff', 
      padding: '24px' 
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        marginBottom: '32px'
      }}>
        <button
          onClick={() => navigate('/')}
          style={{
            background: 'none',
            border: 'none',
            color: '#a78bfa',
            fontSize: '28px',
            cursor: 'pointer',
            marginRight: '16px'
          }}
        >
          ←
        </button>
        <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 600 }}>My Wallet</h1>
      </div>

      {/* Wallet Card – no address section */}
      <div style={{
        background: '#141422',
        borderRadius: '16px',
        border: '1px solid #2a2a3a',
        padding: '24px',
        marginBottom: '32px'
      }}>
        {/* Total Balance */}
        <div style={{ marginBottom: '32px' }}>
          <h3 style={{ fontSize: '1.2rem', marginBottom: '12px', color: '#a0a0c0' }}>
            Total Balance
          </h3>
          <p style={{
            fontSize: '2.8rem',
            fontWeight: 'bold',
            margin: 0,
            color: 'white'
          }}>
            {walletData.totalBalance}
          </p>
        </div>

        {/* Tokens List */}
        <div>
          <h3 style={{ fontSize: '1.2rem', marginBottom: '16px', color: '#a0a0c0' }}>
            Tokens
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {walletData.tokens.map((token, index) => (
              <div key={index} style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '16px',
                background: '#1e1e2e',
                borderRadius: '12px',
                border: '1px solid #2a2a3a'
              }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <span style={{ fontSize: '1.2rem', fontWeight: 600 }}>
                    {token.symbol}
                  </span>
                  <span style={{ fontSize: '1rem', color: '#a0a0c0' }}>
                    {token.amount}
                  </span>
                </div>
                <span style={{ fontSize: '1.1rem', fontWeight: 500, color: 'white' }}>
                  {token.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Wallet Actions */}
      <div style={{ display: 'flex', gap: '16px' }}>
        <button style={{
          flex: 1,
          padding: '14px',
          background: '#7c3aed',
          color: 'white',
          border: 'none',
          borderRadius: '12px',
          fontSize: '1.1rem',
          cursor: 'pointer',
          transition: 'all 0.2s'
        }}>
          Buy Tokens
        </button>
        <button style={{
          flex: 1,
          padding: '14px',
          background: '#7c3aed',
          color: 'white',
          border: 'none',
          borderRadius: '12px',
          fontSize: '1.1rem',
          cursor: 'pointer',
          transition: 'all 0.2s'
        }}>
          Bridge
        </button>
      </div>
    </div>
  );
}
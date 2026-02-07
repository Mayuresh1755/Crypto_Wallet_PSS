import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Networks.css';

type Network = {
  chainId: number;
  name: string;
  nativeCurrency: { symbol: string; decimals: number };
  rpc: string[];
  icon?: string;
  isActive: boolean;
  priceUsd?: number;          // ← NEW: current price in USD
  priceChange24h?: number;    // optional: 24h change %
};

export default function Networks() {
  const navigate = useNavigate();

  const [networks, setNetworks] = useState<Network[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const activeChainId = 11155111; // Sepolia

  useEffect(() => {
    const fetchNetworksAndPrices = async () => {
      try {
        setLoading(true);

        // 1. Fetch chains from Chainlist
        const chainsRes = await fetch('https://chainid.network/chains.json');
        if (!chainsRes.ok) throw new Error('Chains fetch failed');
        const allChains: Omit<Network, 'isActive' | 'priceUsd' | 'priceChange24h'>[] = await chainsRes.json();

        const popularChainIds = [1, 8453, 42161, 10, 137, 56, 324, 5000, 59144, 534352, 43114, 11155111];

        let filtered = allChains
          .filter(c => popularChainIds.includes(c.chainId))
          .map(c => ({
            ...c,
            isActive: c.chainId === activeChainId,
            icon: getEmojiFallback(c.chainId),
          }))
          .sort((a, b) => {
            if (a.isActive) return -1;
            if (b.isActive) return 1;
            return popularChainIds.indexOf(a.chainId) - popularChainIds.indexOf(b.chainId);
          });

        // 2. Map chain → CoinGecko ID for native token price
        const cgIdMap: Record<number, string> = {
          1: 'ethereum',
          8453: 'ethereum',     // Base uses ETH
          42161: 'ethereum',
          10: 'ethereum',
          137: 'matic-network', // Polygon
          56: 'binancecoin',    // BNB
          324: 'ethereum',
          5000: 'mantle',
          59144: 'ethereum',
          534352: 'ethereum',
          43114: 'avalanche-2',
          11155111: 'ethereum', // Sepolia ≈ ETH, but testnet → we'll set price $0 or skip
        };

        const cgIds = [...new Set(filtered.map(n => cgIdMap[n.chainId] || ''))].filter(Boolean);

        if (cgIds.length > 0) {
          // 3. Fetch prices in batch from CoinGecko (free, no key)
          const priceUrl = `https://api.coingecko.com/api/v3/simple/price?ids=${cgIds.join(',')}&vs_currencies=usd&include_24hr_change=true`;
          const priceRes = await fetch(priceUrl);
          if (!priceRes.ok) throw new Error('Price fetch failed');
          const prices: Record<string, { usd: number; usd_24h_change: number }> = await priceRes.json();

          // 4. Merge prices back
          filtered = filtered.map(net => {
            const cgId = cgIdMap[net.chainId];
            if (!cgId || !prices[cgId]) {
              return net; // no price (e.g. testnet)
            }
            return {
              ...net,
              priceUsd: prices[cgId].usd,
              priceChange24h: prices[cgId].usd_24h_change,
            };
          });
        }

        setNetworks(filtered);
      } catch (err) {
        console.error(err);
        setError('Failed to load networks or prices.');
      } finally {
        setLoading(false);
      }
    };

    fetchNetworksAndPrices();
  }, []);

  // Emoji fallback (same as before)
  const getEmojiFallback = (chainId: number): string => {
    const map: Record<number, string> = {
      1: '🔵',
      8453: '🟦',
      42161: '🔴',
      10: '🔴',
      137: '🟣',
      56: '🟡',
      324: '⚡',
      5000: '🟢',
      59144: '🔵',
      534352: '🌀',
      43114: '🔴',
      11155111: '🟠',
    };
    return map[chainId] || '🌐';
  };

  const filteredNetworks = networks.filter(net =>
    net.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSwitchNetwork = (network: Network) => {
    if (network.isActive) return;
    setNetworks(prev =>
      prev.map(n => ({ ...n, isActive: n.chainId === network.chainId }))
    );
    console.log(`Switched to ${network.name}`);
  };

  if (loading) return <div className="networks-page">Loading networks & prices...</div>;
  if (error) return <div className="networks-page error">{error}</div>;

  return (
    <div className="networks-page">
      <div className="networks-header">
        <button className="back-btn" onClick={() => navigate('/')}>←</button>
        <h1>Manage networks</h1>
      </div>

      <div className="search-container">
        <input
          type="text"
          placeholder="Search networks..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="search-input"
        />
      </div>

      <div className="networks-list">
        {filteredNetworks.length === 0 ? (
          <div className="no-results">No networks found</div>
        ) : (
          filteredNetworks.map(net => (
            <div
              key={net.chainId}
              className={`network-item ${net.isActive ? 'active' : ''}`}
              onClick={() => handleSwitchNetwork(net)}
            >
              <div className="network-left">
                <span className="network-icon">{net.icon}</span>
                <div className="network-info">
                  <span className="network-name">{net.name}</span>
                  {net.priceUsd !== undefined ? (
                    <span className="network-price">
                      {net.nativeCurrency.symbol} ≈ ${net.priceUsd.toFixed(2)}
                      {net.priceChange24h !== undefined && (
                        <span className={net.priceChange24h >= 0 ? 'positive' : 'negative'}>
                          {' '}({net.priceChange24h >= 0 ? '+' : ''}{net.priceChange24h.toFixed(2)}%)
                        </span>
                      )}
                    </span>
                  ) : (
                    <span className="network-price">Testnet / No market price</span>
                  )}
                </div>
              </div>

              <div className="network-right">
                {net.isActive && <span className="current-badge">Current</span>}
                <button className="menu-btn">⋯</button>
              </div>
            </div>
          ))
        )}
      </div>

      <button className="add-custom-btn">+ Add a custom network</button>
    </div>
  );
}
// Bridge.tsx
import { useState } from 'react';
import './Bridge.css';
import { ArrowDownUp } from 'lucide-react';

export default function Bridge() {
  const [amount, setAmount] = useState('');

  const handleBridgeClick = () => {
    alert("Wallet connection & bridging would start here in a real app!");
  };

  return (
    <div className="bridge-container">
      <div className="bridge-card">

        <div className="header">
          <h2>Bridge</h2>
        </div>

        <div className="transfer-section">

          {/* From */}
          <div className="transfer-block">
            <label>Transfer from</label>
            <div className="chain-selector">
              <div className="chain-info">
                <span className="chain-icon eth">◇</span>
                <span>Ethereum</span>
              </div>
              <div className="balance-info">
                Balance: <span>0</span>
              </div>
            </div>

            <div className="amount-input-wrapper">
              <input
                type="text"                    // use text instead of number (better control)
                inputMode="numeric"            // shows numeric keyboard on mobile
                pattern="[0-9]*"               // HTML5 validation (optional)
                placeholder="0"
                value={amount}
                onChange={(e) => {
                  const value = e.target.value;
                  // Only allow digits (0-9), no decimals, no minus, no letters
                  if (/^\d*$/.test(value)) {   // regex: only 0 or more digits
                    setAmount(value);
                  }
                  // Alternative: allow negative numbers too → if (/^-?\d*$/.test(value))
                }}
                className="amount-input"
              />
              <div className="input-controls">
                <div className="percentage-buttons">
                  <button>25%</button>
                  <button>50%</button>
                  <button>MAX</button>
                </div>
                <button className="token-selector">
                  ETH <span className="dropdown-arrow">▼</span>
                </button>
              </div>
            </div>
          </div>

          {/* Swap button */}
          <div className="swap-button-wrapper">
            <button className="swap-button">
              <ArrowDownUp size={20} />
            </button>
          </div>

          {/* To */}
          <div className="transfer-block">
            <label>Transfer to</label>
            <div className="chain-selector">
              <div className="chain-info">
                <span className="chain-icon polygon">⊛</span>
                <span>Polygon zkEVM</span>
              </div>
              <div className="balance-info">
                Balance: <span>0</span>
              </div>
            </div>

            <div className="refuel-gas">
              <span>Refuel Gas</span>
              <span className="not-supported">
                Not Supported <span className="tooltip-icon">ℹ</span>
              </span>
            </div>

            <div className="add-address-link">+ Transfer to different address</div>
          </div>

        </div>

        {/* Button moved here – now inside the main padded area */}
        <button
          className="connect-bridge-btn"
          onClick={handleBridgeClick}
        >
          Connect wallet and bridge
        </button>

      </div>
    </div>
  );
}
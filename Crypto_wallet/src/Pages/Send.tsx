import { useState } from 'react';
import './Send.css';

const Send = () => {
  const [availableBalance] = useState(0.0);
  const [amount, setAmount] = useState(''); // controlled input for amount

  const handleGoBack = () => {
    window.history.back();
  };

  // Allow only numbers and one decimal point
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    // Allow empty string, digits, and exactly one decimal point
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setAmount(value);
    }
  };

  return (
    <div className="send-container">
      {/* Header – centered title */}
      <header className="send-header">
        <h1>Send</h1>
      </header>

      {/* Token preview */}
      <div className="token-preview">
        <div className="token-circle">
          <span className="token-letter">S</span>
          <span className="token-subletter">s</span>
        </div>
        <div className="token-main-name">SepoliaETH</div>
      </div>

      {/* To input */}
      <div className="form-group">
        <label className="input-label">To</label>
        <div className="input-field-wrapper">
          <input
            type="text"
            className="input-field"
            placeholder="Enter or paste address or name"
          />
          <button className="paste-action" aria-label="Paste">
            <i className="fa-solid fa-copy"></i>
          </button>
        </div>
      </div>

      {/* Amount input – only accepts float/decimal numbers */}
      <div className="form-group">
        <label className="input-label">Amount</label>
        <div className="amount-field-wrapper">
          <input
            type="text"                    // using text instead of number to allow better control
            className="amount-input"
            placeholder="0"
            value={amount}                 // controlled value
            onChange={handleAmountChange}  // only allow valid float input
          />
          <div className="amount-token">SepoliaETH</div>
        </div>

        <div className="balance-row">
          <span className="balance-text">
            {availableBalance.toFixed(5)} SepoliaETH available
          </span>
        </div>
      </div>

      {/* Bottom buttons */}
      <div className="bottom-actions">
        <button onClick={handleGoBack} className="back-button">
          Back
        </button>
        <button className="continue-button">
          Continue
        </button>
      </div>
    </div>
  );
};

export default Send;
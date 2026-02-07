import { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // ← added for redirection
import { QRCodeSVG } from 'qrcode.react';
import './Receive.css';

const Receive = () => {
  const navigate = useNavigate();

  // Fixed wallet address (you can make it dynamic later)
  const walletAddress = '0x3ce287Ee471bdAAB5De65ACc2c76880679A485DD';

  // Copy feedback
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(walletAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClose = () => {
    navigate('/'); // Redirect to home/dashboard
  };

  return (
    <div className="receive-container">
      {/* Header with account info and close button */}
      <div className="receive-header">
        <div className="account-info">
          <h2>Sepolia</h2> {/* ← Updated to Sepolia */}
        </div>
        <button className="close-btn" onClick={handleClose}>
          ×
        </button>
      </div>

      {/* QR Code */}
      <div className="qr-section">
        <div className="qr-wrapper">
          <QRCodeSVG
            value={walletAddress}
            size={220}
            bgColor="#ffffff"
            fgColor="#000000"
            level="Q"
            includeMargin={true}
          />
        </div>
      </div>

      {/* Sepolia Address section */}
      <div className="address-section">
        <h3>Sepolia Address</h3> {/* ← Updated to Sepolia */}
        <p>Use this address to receive tokens and collectibles on Sepolia</p>

        <div className="address-block">
          <div className="address-text">
            {walletAddress.slice(0, 6)}xxxx{walletAddress.slice(-4)}
          </div>
          <button onClick={handleCopy} className="copy-btn">
            {copied ? 'Copied!' : 'Copy address'} <span className="copy-icon">📋</span>
          </button>
        </div>

        {/* View on Sepolia Etherscan */}   
      </div>
    </div>
  );
};

export default Receive;
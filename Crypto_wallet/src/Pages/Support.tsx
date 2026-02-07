import { useNavigate } from 'react-router-dom';
import './Support.css'; // keep if you have / want styling

export default function Support() {
  const navigate = useNavigate();

  return (
    <div className="Support-page">
      <div className="account-header">
        <button
          className="close-btn"
          onClick={() => navigate('/')}
          aria-label="Close and return to home"
        >
          ← Back
          {/* Alternative: close icon */}
          {/* <i className="fa-solid fa-xmark"></i> */}
        </button>
      </div>

      {/* Intentionally almost empty – add content later if needed */}
      <div className="Support-content">
        {/* You can leave this empty for now */}
      </div>
    </div>
  );
}
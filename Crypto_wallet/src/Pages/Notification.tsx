import { useNavigate } from 'react-router-dom';
import './Notification.css'; // optional - you can skip styling if you want it minimal

export default function Notification() {
  const navigate = useNavigate();

  return (
    <div className="notification-page">
      <div className="notification-header">
        <button 
          className="close-btn"
          onClick={() => navigate('/')}
          aria-label="Close and return to home"
        >
          ← Back
          {/* or use × icon: */}
          {/* <i className="fa-solid fa-xmark"></i> */}
        </button>
      </div>

      {/* Intentionally empty content */}
      <div className="notification-empty">
        {/* You can leave this completely empty */}
      </div>
    </div>
  );
}
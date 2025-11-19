import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/landing.css";

const Landing = () => {
  const navigate = useNavigate();
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowContent(true);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  if (!showContent) {
    return (
      <div className="splash-screen">
        <div className="splash-content">
          <div className="splash-icon">
            <svg viewBox="0 0 24 24" fill="white" width="80" height="80">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>
            </svg>
          </div>
          <h1 className="splash-title">Let's Chat</h1>
          <p className="splash-subtitle">Private Group Chat</p>
        </div>
      </div>
    );
  }

  return (
    <div className="landing-container">
      <div className="landing-content">
        <div className="landing-hero">
          <div className="hero-icon">
            <svg viewBox="0 0 24 24" fill="white" width="100" height="100">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>
            </svg>
          </div>
          <h1 className="hero-title">Welcome to Private Chat</h1>
          <p className="hero-description">
            Connect anonymously with groups. Chat freely without revealing your identity.
          </p>
        </div>

        <div className="landing-features">
          <div className="feature-card">
            <div className="feature-icon">🔒</div>
            <h3>Anonymous Chatting</h3>
            <p>Your identity stays hidden while you chat</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">👥</div>
            <h3>Group Chat</h3>
            <p>Join multiple groups and stay connected</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">⚡</div>
            <h3>Real-time Messages</h3>
            <p>Instant messaging with live updates</p>
          </div>
        </div>

        <div className="landing-actions">
          <button className="btn-primary-landing" onClick={() => navigate("/login")}>
            Sign In
          </button>
          <button className="btn-secondary-landing" onClick={() => navigate("/signup")}>
            Create Account
          </button>
        </div>

        <div className="landing-footer">
          <p>Secure • Private • Anonymous</p>
        </div>
      </div>
    </div>
  );
};

export default Landing;

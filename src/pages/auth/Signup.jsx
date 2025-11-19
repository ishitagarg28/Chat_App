import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../../firebase/firebaseConfig";
import { doc, setDoc } from "firebase/firestore";
import "../../styles/auth/auth.css";

const Signup = () => {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("user");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

     
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        name,
        email,
        role,
        createdAt: new Date(),
      });

    
      if (role === "admin") {
        navigate("/admin/dashboard");
      } else {
        navigate("/user/dashboard");
      }

    } catch (err) {
      console.error(err);
      if (err.code === "auth/email-already-in-use") {
        setError("Email already in use");
      } else if (err.code === "auth/weak-password") {
        setError("Password must be at least 6 characters");
      } else {
        setError("Signup failed. Try again.");
      }
    }

    setLoading(false);
  };

  return (
    <div className="auth-container">
      <form className="auth-box" onSubmit={handleSignup}>
        <div className="auth-header">
          <div className="auth-icon">
            <svg viewBox="0 0 24 24" fill="white">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" />
            </svg>
          </div>
          <h2>Create Your Account</h2>
          <p className="auth-subtitle">
            Already have an account? <a href="/login">Sign In</a>
          </p>
        </div>

        {error && <div className="error-msg">{error}</div>}

        <div className="input-group">
          <label>Full Name</label>
          <div className="input-wrapper">
            <input
              type="text"
              placeholder="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
        </div>

        <div className="input-group">
          <label>Email</label>
          <div className="input-wrapper">
            <input
              type="email"
              placeholder="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
        </div>

        <div className="input-group">
          <label>Password</label>
          <div className="input-wrapper">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowPassword((s) => !s)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              title={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M3 3l18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M10.58 10.58A3 3 0 0113.42 13.42" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </button>
          </div>
        </div>

        <div className="input-group">
  <label>Role</label>
  <div className="input-wrapper role-wrapper">
    <select
      className="role-select"
      value={role}
      onChange={(e) => setRole(e.target.value)}
      required
    >
      <option value="user">User</option>
      <option value="admin">Admin</option>
    </select>

    {/* Dropdown Arrow Button */}
    <button type="button" className="dropdown-btn" tabIndex={-1}>
      ▼
    </button>
  </div>
</div>
        <button type="submit" className="auth-btn" disabled={loading}>
          {loading ? "Creating Account..." : "Sign Up"}
        </button>
      </form>
    </div>
  );
};

export default Signup;

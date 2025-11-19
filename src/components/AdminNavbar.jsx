import { useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../firebase/firebaseConfig";
import "../styles/admin/adminNavbar.css";

const AdminNavbar = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <nav className="admin-navbar">
      <div className="navbar-container">
        <div className="navbar-logo" onClick={() => navigate("/admin/dashboard")}>
          <div className="navbar-logo-vertical">
            <svg viewBox="0 0 24 24" fill="white" width="32" height="32">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>
            </svg>
            <span className="navbar-user-role">Admin</span>
          </div>
        </div>

        <div className="navbar-links">
          <button 
            className="navbar-link" 
            onClick={() => navigate("/admin/create-group")}
          >
            ➕ Create Group
          </button>
          <button 
            className="navbar-link" 
            onClick={() => navigate("/admin/dashboard")}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="#4B3F72" style={{verticalAlign: 'middle', marginRight: '6px'}}>
              <path d="M16 11c1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3 1.34 3 3 3zm-8 0c1.66 0 3-1.34 3-3S9.66 5 8 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5C15 14.17 10.33 13 8 13zm8 0c-.29 0-.62.02-.97.05C16.16 13.36 18 14.28 18 15.5V19h6v-2.5c0-2.33-4.67-3.5-6-3.5z"/>
            </svg>
            View Groups
          </button>
        </div>

        <div className="navbar-right">
          <button className="logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
};

export default AdminNavbar;

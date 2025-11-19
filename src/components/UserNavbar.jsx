import { useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth, db } from "../firebase/firebaseConfig";
import { useAuth } from "../hooks/useAuth";
import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import "../styles/user/userNavbar.css";

const UserNavbar = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [userRole, setUserRole] = useState("");

  useEffect(() => {
    const fetchUserRole = async () => {
      if (currentUser) {
        try {
          const userDoc = await getDoc(doc(db, "users", currentUser.uid));
          if (userDoc.exists()) {
            setUserRole(userDoc.data().role);
          }
        } catch (error) {
          console.error("Error fetching user role:", error);
        }
      }
    };
    fetchUserRole();
  }, [currentUser]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <nav className="user-navbar">
      <div className="navbar-container">
        <div className="navbar-left">
          <div className="navbar-logo" onClick={() => navigate("/user/dashboard")}>
            <div className="navbar-logo-vertical">
              <svg viewBox="0 0 24 24" fill="white" width="32" height="32">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>
              </svg>
              {userRole && <span className="navbar-user-role">{userRole}</span>}
            </div>
          </div>

          <div className="navbar-links">
            <button 
              className="navbar-link" 
              onClick={() => navigate("/user/groups")}
            >
              👥 My Groups
            </button>
            <button 
              className="navbar-link" 
              onClick={() => navigate("/join-group")}
            >
              ➕ Join Group
            </button>
          </div>
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

export default UserNavbar;

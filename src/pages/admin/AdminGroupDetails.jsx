import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { db } from "../../firebase/firebaseConfig";
import { doc, getDoc, deleteDoc } from "firebase/firestore";
import { QRCodeSVG } from "qrcode.react";
import AdminNavbar from "../../components/AdminNavbar";

import "../../styles/admin/adminGroupDetails.css";

const AdminGroupDetails = () => {
  const { id } = useParams(); 
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const [group, setGroup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [accessDenied, setAccessDenied] = useState(false);

  
  useEffect(() => {
    const fetchGroup = async () => {
      if (!currentUser) {
        navigate("/login");
        return;
      }

      try {
        const ref = doc(db, "groups", id);
        const snap = await getDoc(ref);

        if (snap.exists()) {
          const groupData = snap.data();
          
        
          if (groupData.adminId !== currentUser.uid) {
            setAccessDenied(true);
            setLoading(false);
            return;
          }

          setGroup(groupData);
        } else {
          console.log("Group not found");
        }
      } catch (error) {
        console.error("Error fetching group:", error);
      }
      setLoading(false);
    };

    fetchGroup();
  }, [id, currentUser, navigate]);

  
  const handleDelete = async () => {
    const confirmDelete = window.confirm(
      `Are you sure you want to permanently delete "${group.name}"? All messages will be lost.`
    );

    if (!confirmDelete) return;

    try {
      await deleteDoc(doc(db, "groups", id));
      alert("Group deleted successfully!");
      navigate("/admin/dashboard");
    } catch (error) {
      console.error("Error deleting group:", error);
      alert("Failed to delete group. Please try again.");
    }
  };

  if (loading) return (
    <>
      <AdminNavbar />
      <div className="group-details-container">
        <div className="group-details-box">
          <h2>Loading...</h2>
        </div>
      </div>
    </>
  );

  if (accessDenied) return (
    <>
      <AdminNavbar />
      <div className="group-details-container">
        <div className="group-details-box">
          <h2>🚫 Access Denied</h2>
          <p>You can only view and manage groups you created.</p>
          <button className="btn-back" onClick={() => navigate("/admin/dashboard")}>
            ← Back to My Groups
          </button>
        </div>
      </div>
    </>
  );

  if (!group) return (
    <>
      <AdminNavbar />
      <div className="group-details-container">
        <div className="group-details-box">
          <h2>Group Not Found</h2>
          <button className="btn-back" onClick={() => navigate("/admin/dashboard")}>
            ← Back to My Groups
          </button>
        </div>
      </div>
    </>
  );

  const joinURL = `${window.location.origin}/join-group?code=${group.groupCode}`;

  return (
    <>
      <AdminNavbar />
      <div className="group-details-container">
        <div className="group-details-box">

          <h1>Group Details</h1>

          <p><strong>Group Name:</strong> {group.name}</p>
        <p><strong>Group Code:</strong> {group.groupCode}</p>
        <p><strong>Members:</strong> {group.members?.length || 0}</p>

        <p><strong>Join URL:</strong></p>
        <div className="url-display">
          <input 
            type="text" 
            className="url-input" 
            value={joinURL} 
            readOnly 
          />
          <button 
            className="copy-icon-btn" 
            onClick={() => {
              navigator.clipboard.writeText(joinURL);
              alert("URL copied to clipboard!");
            }}
            title="Copy URL"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
            </svg>
          </button>
        </div>

        <div className="qr-section">
          <h2>QR Code</h2>
          <QRCodeSVG value={joinURL} size={200} />
        </div>

        {/* BUTTON ROW */}
        <div className="action-buttons">
          <button className="btn-back" onClick={() => navigate("/admin/dashboard")}>
            ← Back
          </button>

          <button className="btn-delete-group" onClick={handleDelete}>
            Delete Group
          </button>
        </div>

      </div>
    </div>
    </>
  );
};

export default AdminGroupDetails;

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { db } from "../../firebase/firebaseConfig";
import {
  doc,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";

import { QRCodeCanvas } from "qrcode.react";
import AdminNavbar from "../../components/AdminNavbar";
import { getGroupTheme } from "../../utils/groupThemes";
import "../../styles/admin/createGroup.css";

const CreateGroup = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const [groupName, setGroupName] = useState("");
  const [created, setCreated] = useState(null);
  const [error, setError] = useState("");

  const generateGroupCode = () =>
    Math.random().toString(36).substring(2, 8).toUpperCase();

  const handleCreate = async (e) => {
    e.preventDefault();
    setError("");

    if (!groupName.trim()) {
      setError("Group name is required.");
      return;
    }

    try {
      const groupId = Date.now().toString(); 
      const groupCode = generateGroupCode();

      // Create join URL with code parameter
      const joinURL = `${window.location.origin}/join-group?code=${groupCode}`;

      const groupData = {
        name: groupName,
        groupCode,
        joinURL,
        createdAt: serverTimestamp(),
        adminId: currentUser.uid,
        members: [], 
      };

      await setDoc(doc(db, "groups", groupId), groupData);

      setCreated({ ...groupData, id: groupId });
      setGroupName("");
    } catch (error) {
      console.error("Failed to create group:", error);
      setError("Failed to create group.");
    }
  };

  const downloadQRCode = () => {
    const canvas = document.querySelector("canvas");
    if (canvas) {
      const url = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.download = `${created.name}_QRCode.png`;
      link.href = url;
      link.click();
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert("Copied to clipboard!");
  };

  return (
    <>
      <AdminNavbar />
      <div className="create-container">
        <div className="create-box">

          <h1>Create New Group</h1>

          {!created && (
            <form onSubmit={handleCreate} className="create-form">

              <input
                type="text"
                placeholder="Enter group name"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                className="group-input"
              />

              {error && <p className="error-msg">{error}</p>}

              <button type="submit" className="create-btn">
                Create Group
              </button>

              <button
                className="back-btn"
                type="button"
              onClick={() => navigate("/admin/dashboard")}
            >
              ← Back to Dashboard
            </button>
          </form>
        )}

        {created && (
          <div className="result-box">
            <h2>Group Created Successfully 🎉</h2>

            {/* Theme Preview */}
            <div className="theme-preview" style={{ background: getGroupTheme(created.id).gradient }}>
              <p className="theme-label">🎨 Group Theme: {getGroupTheme(created.id).name}</p>
              <p className="theme-desc">This group will have a unique color theme!</p>
            </div>

            <p><b>Group Name:</b> {created.name}</p>
            <p><b>Group Code:</b> {created.groupCode}</p>

            <div className="url-section">
              <p><b>Shareable Join URL:</b></p>
              <div className="url-display">
                <input 
                  type="text" 
                  className="url-input" 
                  value={created.joinURL} 
                  readOnly 
                />
                <button 
                  className="copy-icon-btn" 
                  onClick={() => copyToClipboard(created.joinURL)}
                  title="Copy URL"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                  </svg>
                </button>
              </div>
            </div>

            <div className="qr-section">
              <h3>QR Code</h3>
              <div className="qr-code-wrapper">
                <QRCodeCanvas
                  value={created.joinURL}
                  size={200}
                  bgColor="#ffffff"
                  fgColor="#000000"
                  level="H"
                />
              </div>
              <button className="download-qr-btn" onClick={downloadQRCode}>
                Download QR Code
              </button>
            </div>

            <div className="instructions">
              <h4>How users can join:</h4>
              <ul>
                <li>📝 Enter the group code: <strong>{created.groupCode}</strong></li>
                <li>🔗 Click the join URL link</li>
                <li>📷 Scan the QR code with camera</li>
                <li>🖼️ Upload a screenshot of the QR code</li>
              </ul>
            </div>

            <button
              className="back-btn"
              onClick={() => navigate("/admin/dashboard")}
            >
              Done ✔
            </button>
          </div>
        )}

      </div>
    </div>
    </>
  );
};

export default CreateGroup;

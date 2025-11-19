import { useState, useEffect, useRef } from "react";
import { db } from "../../firebase/firebaseConfig";
import { doc, getDoc, updateDoc, arrayUnion, collection, query, where, getDocs } from "firebase/firestore";
import { useAuth } from "../../hooks/useAuth";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Html5Qrcode } from "html5-qrcode";
import UserNavbar from "../../components/UserNavbar";
import "../../styles/user/joinGroup.css";

const JoinGroup = () => {
  const [code, setCode] = useState("");
  const [urlInput, setUrlInput] = useState("");
  const [group, setGroup] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [joinMethod, setJoinMethod] = useState("code"); 
  const [scanning, setScanning] = useState(false);
  
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const scannerRef = useRef(null);
  const html5QrCodeRef = useRef(null);

  
  useEffect(() => {
    const codeFromURL = searchParams.get("code");
    if (codeFromURL) {
      setCode(codeFromURL.toUpperCase());
     
      findGroupByCode(codeFromURL.toUpperCase());
    }
  }, [searchParams]);


  useEffect(() => {
    return () => {
      if (html5QrCodeRef.current) {
        html5QrCodeRef.current.stop().catch((err) => console.log("Scanner stop error:", err));
      }
    };
  }, []);

  const findGroupByCode = async (groupCode) => {
    if (!groupCode.trim()) {
      setError("Please enter a group code");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const groupsRef = collection(db, "groups");
      const q = query(groupsRef, where("groupCode", "==", groupCode.toUpperCase()));
      const snap = await getDocs(q);

      if (snap.empty) {
        setError("Invalid group code");
        setGroup(null);
      } else {
        const groupDoc = snap.docs[0];
        setGroup({ id: groupDoc.id, ...groupDoc.data() });
      }
    } catch (err) {
      console.error("Error finding group:", err);
      setError("Failed to search for group");
    }

    setLoading(false);
  };

  const findGroup = async () => {
    await findGroupByCode(code);
  };

  const findGroupByURL = async () => {
    if (!urlInput.trim()) {
      setError("Please enter a join URL");
      return;
    }

    setError("");
    
   
    const extractedCode = extractCodeFromURL(urlInput);
    
    if (extractedCode) {
      setCode(extractedCode.toUpperCase());
      await findGroupByCode(extractedCode);
    } else {
      setError("Invalid join URL. Please enter a valid group URL.");
    }
  };

  const extractCodeFromURL = (url) => {
    try {
      const urlObj = new URL(url);
      return urlObj.searchParams.get("code");
    } catch {
      return null;
    }
  };

  const handleQRResult = async (decodedText) => {
    console.log("QR Code detected:", decodedText);

    const extractedCode = extractCodeFromURL(decodedText);
    
    if (extractedCode) {
      setCode(extractedCode.toUpperCase());
      await findGroupByCode(extractedCode);
      stopScanner();
    } else {
      setError("Invalid QR code. Please scan a valid group QR code.");
    }
  };

  const startCameraScanner = async () => {
    setError("");
    setScanning(true);
    setJoinMethod("camera");

    try {
      const html5QrCode = new Html5Qrcode("qr-reader");
      html5QrCodeRef.current = html5QrCode;

      await html5QrCode.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 }
        },
        (decodedText) => {
          handleQRResult(decodedText);
        },
        () => {
          
        }
      );
    } catch (err) {
      console.error("Camera error:", err);
      setError("Failed to access camera. Please check permissions.");
      setScanning(false);
    }
  };

  const stopScanner = async () => {
    if (html5QrCodeRef.current) {
      try {
        await html5QrCodeRef.current.stop();
        html5QrCodeRef.current = null;
      } catch (err) {
        console.log("Error stopping scanner:", err);
      }
    }
    setScanning(false);
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setError("");
    setLoading(true);
    setJoinMethod("upload");

    try {
      const html5QrCode = new Html5Qrcode("qr-reader-hidden");
      const result = await html5QrCode.scanFile(file, false);
      
      await handleQRResult(result);
    } catch (err) {
      console.error("QR scan error:", err);
      setError("No valid QR code found in image");
    } finally {
      setLoading(false);
    }
  };

  const joinGroup = async () => {
    if (!currentUser || !group) return;

    setLoading(true);

    try {
      const groupRef = doc(db, "groups", group.id);
      const groupSnap = await getDoc(groupRef);
      const members = groupSnap.data().members || [];

      const already = members.includes(currentUser.uid);
      if (already) {
        setError("You already joined this group");
        setLoading(false);
        return;
      }

      await updateDoc(groupRef, {
        members: arrayUnion(currentUser.uid)
      });

      navigate(`/chat/${group.id}`);
    } catch (err) {
      console.error("Error joining group:", err);
      setError("Failed to join group");
    }

    setLoading(false);
  };

  return (
    <>
      <UserNavbar />
      <div className="join-container">
        <div className="join-box">
          <h1>Join Group</h1>
          <p>Choose a method to join a chat group</p>

          {/* Tab Buttons */}
          <div className="join-method-tabs">
            <button 
              className={`tab-btn ${joinMethod === "code" ? "active" : ""}`}
              onClick={() => { setJoinMethod("code"); stopScanner(); setError(""); }}
            >
              📝 Enter Code
            </button>
            <button 
              className={`tab-btn ${joinMethod === "url" ? "active" : ""}`}
              onClick={() => { setJoinMethod("url"); stopScanner(); setError(""); }}
            >
              🔗 Paste URL
            </button>
            <button 
              className={`tab-btn ${joinMethod === "camera" ? "active" : ""}`}
              onClick={startCameraScanner}
            >
              📷 Scan QR
            </button>
            <button 
              className={`tab-btn ${joinMethod === "upload" ? "active" : ""}`}
              onClick={() => { setJoinMethod("upload"); stopScanner(); setError(""); }}
            >
              🖼️ Upload Image
            </button>
          </div>

          {/* Code Input Method */}
          {joinMethod === "code" && (
            <div className="input-section">
              <input
                type="text"
                className="join-input"
                placeholder="Enter group code"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                disabled={loading}
              />
              <button className="join-btn" onClick={findGroup} disabled={loading}>
                {loading ? "Searching..." : "Search Group"}
              </button>
            </div>
          )}

          {/* URL Input Method */}
          {joinMethod === "url" && (
            <div className="input-section">
              <input
                type="text"
                className="join-input url-input"
                placeholder="Paste join URL here"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                disabled={loading}
              />
              <button className="join-btn" onClick={findGroupByURL} disabled={loading}>
                {loading ? "Searching..." : "Join Group"}
              </button>
            </div>
          )}

          {/* Camera Scanner */}
          {joinMethod === "camera" && (
            <div className="scanner-section">
              <div id="qr-reader" ref={scannerRef} className="qr-scanner"></div>
              {scanning && (
                <div className="scanner-info">
                  <p>📷 Position QR code within the frame</p>
                  <button className="stop-scan-btn" onClick={stopScanner}>
                    Stop Scanner
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Image Upload Method */}
          {joinMethod === "upload" && (
            <div className="upload-section">
              <div className="upload-box">
                <label htmlFor="qr-upload" className="upload-label">
                  <div className="upload-icon">📁</div>
                  <p>Click to upload QR code image</p>
                  <small>Supports: JPG, PNG, etc.</small>
                </label>
                <input
                  id="qr-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="file-input"
                  disabled={loading}
                />
              </div>
            </div>
          )}

          {/* Hidden div for image scanning */}
          <div id="qr-reader-hidden" style={{ display: "none" }}></div>

          {error && <p className="error-msg">{error}</p>}

        {group && (
          <div className="group-found">
            <h3>Group Found!</h3>
            <p className="group-name-display">{group.name}</p>
            <p className="member-count">Members: {group.members?.length || 0}</p>

            <button className="join-confirm-btn" onClick={joinGroup} disabled={loading}>
              {loading ? "Joining..." : "Join This Group"}
            </button>
          </div>
        )}

        <button className="back-btn" onClick={() => navigate("/user/dashboard")}>
          ← Back to Dashboard
        </button>
      </div>
    </div>
    </>
  );
};

export default JoinGroup;

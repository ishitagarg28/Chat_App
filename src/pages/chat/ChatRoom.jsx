import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { db } from "../../firebase/firebaseConfig";
import {
  doc,
  getDoc,
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
  setDoc,
  updateDoc,
  arrayUnion,
} from "firebase/firestore";
import { useAuth } from "../../hooks/useAuth";
import { getGroupTheme } from "../../utils/groupThemes";
import "../../styles/chat/chatRoom.css";

const ChatRoom = () => {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const [group, setGroup] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [anonymousId, setAnonymousId] = useState("");
  const [userAlias, setUserAlias] = useState("");
  const [blockedUsers, setBlockedUsers] = useState([]);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [groupTheme, setGroupTheme] = useState(null);

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (!currentUser) {
      navigate("/login");
      return;
    }

    const loadGroupData = async () => {
      try {
        const groupRef = doc(db, "groups", groupId);
        const groupSnap = await getDoc(groupRef);

        if (!groupSnap.exists()) {
          console.error("Group not found");
          navigate("/user/dashboard");
          return;
        }

        const groupData = groupSnap.data();
        setGroup({ id: groupId, ...groupData });

        
        const theme = getGroupTheme(groupId);
        setGroupTheme(theme);

       
        localStorage.setItem(`lastSeen_group_${groupId}`, Date.now().toString());

        const members = groupData.members || [];
        const memberIndex = members.indexOf(currentUser.uid);
        
        if (memberIndex === -1) {
          console.error("You are not a member of this group");
          navigate("/user/dashboard");
          return;
        }

        setAnonymousId(`User ${memberIndex + 1}`);

        // Load current user alias
        const currentUserRef = doc(db, "users", currentUser.uid);
        const currentUserSnap = await getDoc(currentUserRef);
        if (currentUserSnap.exists()) {
          setUserAlias(currentUserSnap.data().alias || "");
          setBlockedUsers(currentUserSnap.data().blockedUsers || []);
        }

        setLoading(false);
      } catch (error) {
        console.error("Error loading group:", error);
        setLoading(false);
      }
    };

    loadGroupData();
  }, [groupId, currentUser, navigate]);

  useEffect(() => {
    if (!groupId) return;

    const messagesRef = collection(db, "groups", groupId, "messages");
    const q = query(messagesRef, orderBy("timestamp", "asc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = [];
      snapshot.forEach((doc) => {
        msgs.push({ id: doc.id, ...doc.data() });
      });
      setMessages(msgs);
      setTimeout(scrollToBottom, 100);
    });

    return () => unsubscribe();
  }, [groupId]);

  const handleSendMessage = async (e) => {
    e.preventDefault();

    if (!newMessage.trim() || sending) return;

    setSending(true);

    try {
      const displayName = userAlias 
        ? `${anonymousId}(${userAlias})` 
        : anonymousId;

      const messagesRef = collection(db, "groups", groupId, "messages");
      await addDoc(messagesRef, {
        text: newMessage.trim(),
        senderId: currentUser.uid,
        senderName: displayName,
        timestamp: serverTimestamp(),
      });

      setNewMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
    }

    setSending(false);
  };

  const handleMessageUser = (userId) => {
    if (userId === currentUser.uid) {
      alert("You cannot message yourself");
      return;
    }
    navigate(`/dm/${userId}`);
    setOpenMenuId(null);
  };

  const handleBlockUser = async (userId, userName) => {
    if (userId === currentUser.uid) {
      alert("You cannot block yourself");
      return;
    }

    if (!confirm(`Block ${userName}? They won't be able to message you.`)) return;

    try {
      const userRef = doc(db, "users", currentUser.uid);
      await updateDoc(userRef, {
        blockedUsers: arrayUnion(userId)
      });

      setBlockedUsers((prev) => [...prev, userId]);
      alert("User blocked successfully");
      setOpenMenuId(null);
    } catch (error) {
      console.error("Error blocking user:", error);
      alert("Failed to block user");
    }
  };

  const handleReportUser = async (userId, userName, messageText) => {
    if (userId === currentUser.uid) {
      alert("You cannot report yourself");
      return;
    }

    const reason = prompt(`Report ${userName}?\nPlease provide a reason:`);
    if (!reason || !reason.trim()) return;

    try {
      const reportsRef = collection(db, "reports");
      await addDoc(reportsRef, {
        type: "user",
        reportedUserId: userId,
        reportedUserName: userName,
        reportedBy: currentUser.uid,
        reason: reason.trim(),
        messageContent: messageText,
        groupId: groupId,
        groupName: group.name,
        timestamp: serverTimestamp(),
      });

      alert("User reported successfully. Admin will review.");
      setOpenMenuId(null);
    } catch (error) {
      console.error("Error reporting user:", error);
      alert("Failed to report user");
    }
  };

  const handleBlockGroup = async () => {
    if (!confirm(`Block this group "${group.name}"? It will be hidden from your dashboard.`)) return;

    try {
      const userRef = doc(db, "users", currentUser.uid);
      const userSnap = await getDoc(userRef);
      const blockedGroups = userSnap.data()?.blockedGroups || [];

      if (!blockedGroups.includes(groupId)) {
        await setDoc(userRef, { blockedGroups: [...blockedGroups, groupId] }, { merge: true });
      }

      alert("Group blocked successfully");
      navigate("/user/dashboard");
    } catch (error) {
      console.error("Error blocking group:", error);
      alert("Failed to block group");
    }
  };

  const handleReportGroup = async () => {
    const reason = prompt(`Report group "${group.name}"?\nPlease provide a reason:`);
    if (!reason || !reason.trim()) return;

    try {
      const reportsRef = collection(db, "reports");
      await addDoc(reportsRef, {
        type: "group",
        groupId: groupId,
        groupName: group.name,
        reportedBy: currentUser.uid,
        reason: reason.trim(),
        timestamp: serverTimestamp(),
      });

      alert("Group reported successfully. Admin will review.");
    } catch (error) {
      console.error("Error reporting group:", error);
      alert("Failed to report group");
    }
  };

  if (loading) {
    return <div className="loading-screen">Loading chat...</div>;
  }

  if (!group) {
    return <div className="loading-screen">Group not found</div>;
  }

  // Filter out messages from blocked users
  const filteredMessages = messages.filter(msg => !blockedUsers.includes(msg.senderId));

  return (
    <div className="chat-container" style={{ background: groupTheme?.gradient || 'var(--primary-gradient)' }}>
      <div className="chat-header">
        <button className="back-button" onClick={() => navigate("/user/dashboard")}>
          ← Back
        </button>
        <div className="chat-header-info">
          <h2>{group.name}</h2>
          <p className="anonymous-label">
            You are: {userAlias ? `${anonymousId}(${userAlias})` : anonymousId}
          </p>
        </div>
        <div className="header-actions">
          <button className="header-action-btn" onClick={handleBlockGroup} title="Block Group">
            🚫
          </button>
          <button className="header-action-btn" onClick={handleReportGroup} title="Report Group">
            🚩
          </button>
          <span className="member-count">{group.members?.length || 0} members</span>
        </div>
      </div>

      <div className="messages-container">
        {filteredMessages.length === 0 ? (
          <div className="empty-chat">
            <p>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          filteredMessages.map((msg) => (
            <div
              key={msg.id}
              className={`message ${msg.senderId === currentUser.uid ? "own-message" : "other-message"}`}
            >
              <div className="message-header">
                <span className="message-sender">{msg.senderName}</span>
                <span className="message-time">
                  {msg.timestamp?.toDate().toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
                {msg.senderId !== currentUser.uid && (
                  <div className="message-menu">
                    <button
                      className="menu-toggle"
                      onClick={() => setOpenMenuId(openMenuId === msg.id ? null : msg.id)}
                    >
                      ⋮
                    </button>
                    {openMenuId === msg.id && (
                      <div className="menu-dropdown">
                        <button onClick={() => handleMessageUser(msg.senderId)}>
                          💬 Message User
                        </button>
                        <button onClick={() => handleBlockUser(msg.senderId, msg.senderName)}>
                          🚫 Block User
                        </button>
                        <button onClick={() => handleReportUser(msg.senderId, msg.senderName, msg.text)}>
                          🚩 Report User
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
              <div className="message-content">{msg.text}</div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <form className="message-input-form" onSubmit={handleSendMessage}>
        <input
          type="text"
          className="message-input"
          placeholder="Type your message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          disabled={sending}
        />
        <button type="submit" className="send-button" disabled={sending || !newMessage.trim()}>
          {sending ? "..." : "Send"}
        </button>
      </form>
    </div>
  );
};

export default ChatRoom;

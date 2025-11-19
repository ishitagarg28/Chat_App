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
  where,
  getDocs,
} from "firebase/firestore";
import { useAuth } from "../../hooks/useAuth";
import "../../styles/chat/directMessage.css";

const DirectMessage = () => {
  const { userId } = useParams(); 
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const [otherUser, setOtherUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [chatId, setChatId] = useState("");
  const [sharedGroupName, setSharedGroupName] = useState("");
  const [otherUserAnonId, setOtherUserAnonId] = useState("");

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);
  const getChatId = (uid1, uid2) => {
    return uid1 < uid2 ? `${uid1}_${uid2}` : `${uid2}_${uid1}`;
  };

  useEffect(() => {
    if (!currentUser || !userId) {
      navigate("/user/dashboard");
      return;
    }

    const loadUserData = async () => {
      try {
       
        const userRef = doc(db, "users", userId);
        const userSnap = await getDoc(userRef);

        if (!userSnap.exists()) {
          console.error("User not found");
          navigate("/user/dashboard");
          return;
        }

        setOtherUser(userSnap.data());

        const currentUserRef = doc(db, "users", currentUser.uid);
        const currentUserSnap = await getDoc(currentUserRef);
        const blockedUsers = currentUserSnap.data()?.blockedUsers || [];

        if (blockedUsers.includes(userId)) {
          alert("You have blocked this user");
          navigate("/user/dashboard");
          return;
        }

       
        const groupsRef = collection(db, "groups");
        const q = query(groupsRef, where("members", "array-contains", currentUser.uid));
        const groupSnap = await getDocs(q);

        let foundGroup = null;
        groupSnap.forEach((doc) => {
          const groupData = doc.data();
          if (groupData.members && groupData.members.includes(userId)) {
            foundGroup = { id: doc.id, ...groupData };
          }
        });

        if (foundGroup) {
          setSharedGroupName(foundGroup.name);
          
         
          const members = foundGroup.members || [];
          const otherUserIndex = members.indexOf(userId);
          
          setOtherUserAnonId(`User ${otherUserIndex + 1}`);
        }

        const generatedChatId = getChatId(currentUser.uid, userId);
        setChatId(generatedChatId);

       
        localStorage.setItem(`lastSeen_dm_${generatedChatId}`, Date.now().toString());
        const dmRef = doc(db, "directChats", generatedChatId);
        const dmSnap = await getDoc(dmRef);

        if (!dmSnap.exists()) {
          await setDoc(dmRef, {
            participants: [currentUser.uid, userId],
            createdAt: serverTimestamp(),
          });
        }

        setLoading(false);
      } catch (error) {
        console.error("Error loading DM:", error);
        setLoading(false);
      }
    };

    loadUserData();
  }, [userId, currentUser, navigate]);
  useEffect(() => {
    if (!chatId) return;

    const messagesRef = collection(db, "directChats", chatId, "messages");
    const q = query(messagesRef, orderBy("timestamp", "asc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = [];
      snapshot.forEach((doc) => {
        msgs.push({ id: doc.id, ...doc.data() });
      });
      setMessages(msgs);
    });

    return () => unsubscribe();
  }, [chatId]);

  const handleSendMessage = async (e) => {
    e.preventDefault();

    if (!newMessage.trim() || sending) return;

    setSending(true);

    try {
      const messagesRef = collection(db, "directChats", chatId, "messages");
      await addDoc(messagesRef, {
        text: newMessage.trim(),
        senderId: currentUser.uid,
        timestamp: serverTimestamp(),
      });

      setNewMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
      alert("Failed to send message");
    } finally {
      setSending(false);
    }
  };

  const handleBlockUser = async () => {
    if (!confirm(`Block ${otherUserAnonId || "this user"}? They won't be able to message you.`)) return;

    try {
      const userRef = doc(db, "users", currentUser.uid);
      const userSnap = await getDoc(userRef);
      const blockedUsers = userSnap.data()?.blockedUsers || [];

      if (!blockedUsers.includes(userId)) {
        blockedUsers.push(userId);
        await setDoc(userRef, { blockedUsers }, { merge: true });
      }

      alert("User blocked successfully");
      navigate("/user/dashboard");
    } catch (error) {
      console.error("Error blocking user:", error);
      alert("Failed to block user");
    }
  };

  if (loading) {
    return <div className="dm-loading">Loading chat...</div>;
  }

  if (!otherUser) {
    return <div className="dm-loading">User not found</div>;
  }

  return (
    <div className="dm-container">
      <div className="dm-header">
        <button className="back-button" onClick={() => navigate(-1)}>
          ← Back
        </button>
        <div className="dm-header-info">
          <h2>{otherUserAnonId || "User"}</h2>
          {sharedGroupName && <p className="alias-text">from {sharedGroupName}</p>}
        </div>
        <button className="block-button" onClick={handleBlockUser}>
          🚫 Block
        </button>
      </div>

      <div className="dm-messages-container">
        {messages.length === 0 ? (
          <div className="empty-chat">
            <p>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`dm-message ${
                msg.senderId === currentUser.uid ? "dm-own-message" : "dm-other-message"
              }`}
            >
              <div className="dm-message-content">{msg.text}</div>
              <div className="dm-message-time">
                {msg.timestamp?.toDate().toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <form className="dm-input-form" onSubmit={handleSendMessage}>
        <input
          type="text"
          className="dm-input"
          placeholder="Type your message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          disabled={sending}
        />
        <button type="submit" className="dm-send-button" disabled={sending || !newMessage.trim()}>
          {sending ? "..." : "Send"}
        </button>
      </form>
    </div>
  );
};

export default DirectMessage;

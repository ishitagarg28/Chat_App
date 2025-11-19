import { useEffect, useState } from "react";
function AnonymousEmojiBall() {
  
  const expressions = [
    "👻",
    "🥸", 
    "😺", 
    "😼", 
    "😸", 
    "😹", 
    "😻", 
    "😽", 
    "🙈", 
    "🙉", 
    "🙊", 
    "👽", 
    "🎭", 
    "🫥", 
    "🫠", 
    "🫶", 
    "✨", 
    "🌀", 
    "😶",
    "😶‍🌫️",
    "😐",
    "🙂",
    "🙃",
    "😏",
    "😒",
    "😑",
    "😬",
    "😮",
    "😳",
    "🤨",
    "😕",
    "😦",
    "😯",
    "😲",

    "😂",
    "🤭",
    "🤐",
    "🤫",
    "🤔",
    "🤥",
    "🤡",
    "🥸",
    "👻",
    "😎",
    "🤖"

  ];
  const [emoji, setEmoji] = useState(expressions[0]);
  useEffect(() => {
    const interval = setInterval(() => {
      const random = Math.floor(Math.random() * expressions.length);
      setEmoji(expressions[random]);
    }, 1500);
    return () => clearInterval(interval);
  }, [expressions]);
  return (
    <span className="emoji-bounce" role="img" aria-label="anonymous emoji">{emoji}</span>
  );
}
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { db } from "../../firebase/firebaseConfig";
import { getGroupTheme } from "../../utils/groupThemes";
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
  onSnapshot,
  orderBy,
  limit,
} from "firebase/firestore";
import UserNavbar from "../../components/UserNavbar";

// Correct CSS path
import "../../styles/user/userDashboard.css";

const UserDashboard = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const [userData, setUserData] = useState(null);
  const [allChats, setAllChats] = useState([]); 
  const [searchQuery, setSearchQuery] = useState("");
  const [unreadCounts, setUnreadCounts] = useState({}); 
  
  useEffect(() => {
    if (!currentUser || allChats.length === 0) return;

    const unsubscribers = [];

    allChats.forEach((chat) => {
      if (chat.type === "group") {
      
        const messagesRef = collection(db, "groups", chat.id, "messages");
        const q = query(messagesRef, orderBy("timestamp", "desc"), limit(50));
        
        const unsubscribe = onSnapshot(q, (snapshot) => {
          let unreadCount = 0;
          const lastSeenKey = `lastSeen_group_${chat.id}`;
          const lastSeenTime = localStorage.getItem(lastSeenKey);
          
          snapshot.forEach((doc) => {
            const msgData = doc.data();
            
            if (msgData.senderId !== currentUser.uid) {
              if (!lastSeenTime || (msgData.timestamp && msgData.timestamp.toMillis() > parseInt(lastSeenTime))) {
                unreadCount++;
              }
            }
          });

          setUnreadCounts(prev => ({
            ...prev,
            [`group-${chat.id}`]: unreadCount
          }));
        });

        unsubscribers.push(unsubscribe);
      } else if (chat.type === "dm") {
        const chatId = [currentUser.uid, chat.id].sort().join("_");
        const messagesRef = collection(db, "directChats", chatId, "messages");
        const q = query(messagesRef, orderBy("timestamp", "desc"), limit(50));
        
        const unsubscribe = onSnapshot(q, (snapshot) => {
          let unreadCount = 0;
          const lastSeenKey = `lastSeen_dm_${chatId}`;
          const lastSeenTime = localStorage.getItem(lastSeenKey);
          
          snapshot.forEach((doc) => {
            const msgData = doc.data();
           
            if (msgData.senderId !== currentUser.uid) {
              if (!lastSeenTime || (msgData.timestamp && msgData.timestamp.toMillis() > parseInt(lastSeenTime))) {
                unreadCount++;
              }
            }
          });

          setUnreadCounts(prev => ({
            ...prev,
            [`dm-${chat.id}`]: unreadCount
          }));
        });

        unsubscribers.push(unsubscribe);
      }
    });

   
    return () => {
      unsubscribers.forEach(unsub => unsub());
    };
  }, [currentUser, allChats]);

  useEffect(() => {
    const loadData = async () => {
      if (!currentUser) {
        navigate("/login"); 
        return;
      }

      try {
       
        const userRef = doc(db, "users", currentUser.uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          setUserData(userSnap.data());
        }

        const blockedGroups = userSnap.data()?.blockedGroups || [];
        const blockedUsers = userSnap.data()?.blockedUsers || [];
        const userAlias = userSnap.data()?.alias || "";

      
        const groupRef = collection(db, "groups");
        const groupQuery = query(groupRef, where("members", "array-contains", currentUser.uid));
        const groupSnap = await getDocs(groupQuery);

        const groupChats = [];
        groupSnap.forEach((docSnap) => {
          const groupData = { id: docSnap.id, ...docSnap.data() };
         
          if (!blockedGroups.includes(docSnap.id)) {
            const members = groupData.members || [];
            const memberIndex = members.indexOf(currentUser.uid);
            const anonId = `User ${memberIndex + 1}`;
            const displayName = userAlias ? `${anonId}(${userAlias})` : anonId;
            
            groupChats.push({
              id: docSnap.id,
              type: "group",
              name: groupData.name,
              displayName: displayName,
              theme: getGroupTheme(docSnap.id),
              icon: "👥"
            });
          }
        });


        const dmRef = collection(db, "directChats");
        const dmQuery = query(dmRef, where("participants", "array-contains", currentUser.uid));
        const dmSnap = await getDocs(dmQuery);

        const dmChats = [];
        for (const docSnap of dmSnap.docs) {
          const dmData = docSnap.data();
          const otherUserId = dmData.participants.find(uid => uid !== currentUser.uid);
          
         
          if (!blockedUsers.includes(otherUserId)) {
            const otherUserRef = doc(db, "users", otherUserId);
            const otherUserSnap = await getDoc(otherUserRef);
            
            if (otherUserSnap.exists()) {
              let sharedGroupName = "";
              let otherUserAnonId = "User";
              
              for (const group of groupSnap.docs) {
                const groupMembers = group.data().members || [];
                if (groupMembers.includes(otherUserId)) {
                  sharedGroupName = group.data().name;
                  const otherUserIndex = groupMembers.indexOf(otherUserId);
                  otherUserAnonId = `User ${otherUserIndex + 1}`;
                  break;
                }
              }
              
              dmChats.push({
                id: otherUserId,
                type: "dm",
                name: otherUserAnonId,
                groupContext: sharedGroupName,
                displayName: otherUserAnonId,
                theme: null, 
                icon: "👤"
              });
            }
          }
        }
        const chatWithTimestamps = [];
       
        for (const group of groupChats) {
          const messagesRef = collection(db, "groups", group.id, "messages");
          const qMsg = query(messagesRef, orderBy("timestamp", "desc"), limit(1));
          const msgSnap = await getDocs(qMsg);
          let lastMessageTimestamp = 0;
          msgSnap.forEach(doc => {
            const data = doc.data();
            if (data.timestamp) lastMessageTimestamp = data.timestamp.toMillis();
          });
          chatWithTimestamps.push({ ...group, lastMessageTimestamp });
        }
        for (const dm of dmChats) {
          const chatId = [currentUser.uid, dm.id].sort().join("_");
          const messagesRef = collection(db, "directChats", chatId, "messages");
          const qMsg = query(messagesRef, orderBy("timestamp", "desc"), limit(1));
          const msgSnap = await getDocs(qMsg);
          let lastMessageTimestamp = 0;
          msgSnap.forEach(doc => {
            const data = doc.data();
            if (data.timestamp) lastMessageTimestamp = data.timestamp.toMillis();
          });
          chatWithTimestamps.push({ ...dm, lastMessageTimestamp });
        }

       
        chatWithTimestamps.sort((a, b) => b.lastMessageTimestamp - a.lastMessageTimestamp);
        setAllChats(chatWithTimestamps);

      } catch (error) {
        console.error("Error loading chats:", error);
      }
    };

    loadData();
  }, [currentUser, navigate]);

 
  const filteredChats = allChats.filter(chat => 
    chat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (chat.groupContext && chat.groupContext.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleChatClick = (chat) => {
    
    if (chat.type === "group") {
      localStorage.setItem(`lastSeen_group_${chat.id}`, Date.now().toString());
      navigate(`/chat/${chat.id}`);
    } else {
      const chatId = [currentUser.uid, chat.id].sort().join("_");
      localStorage.setItem(`lastSeen_dm_${chatId}`, Date.now().toString());
      navigate(`/dm/${chat.id}`);
    }
  };

  if (!userData) {
    return <p className="loadingText">Loading dashboard...</p>;
  }

  return (
    <>
      <UserNavbar />
      <div className="userDash-container">
        <h1 className="welcome-title">
          Welcome, {userData.name} <AnonymousEmojiBall />
        </h1>

        <div className="userDash-box">
          <h2>💬 My Chats</h2>

        
          <div className="search-container">
            <input
              type="text"
              className="search-input"
              placeholder="Search chats, groups, or users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button 
                className="clear-search-btn" 
                onClick={() => setSearchQuery("")}
                title="Clear search"
              >
                ✕
              </button>
            )}
          </div>

          {filteredChats.length === 0 ? (
            <p className="empty-msg">
              {searchQuery 
                ? `No chats found matching "${searchQuery}"`
                : "You have no chats yet. Join a group or message someone to start chatting!"}
            </p>
          ) : (
            <ul className="group-list">
              {filteredChats.map((chat) => {
                const unreadCount = unreadCounts[`${chat.type}-${chat.id}`] || 0;
                
                return (
                  <li
                    key={`${chat.type}-${chat.id}`}
                    className={`group-item ${chat.type === "dm" ? "dm-item" : ""}`}
                    onClick={() => handleChatClick(chat)}
                  >
                    <div className="chat-content">
                      <span className="chat-icon">{chat.icon}</span>
                      <div className="chat-info">
                        <span className="group-name">{chat.name}</span>
                        {chat.type === "group" && (
                          <span className="user-display">({chat.displayName})</span>
                        )}
                        {chat.type === "dm" && chat.groupContext && (
                          <span className="dm-context">from {chat.groupContext}</span>
                        )}
                      </div>
                    </div>
                    {unreadCount > 0 && (
                      <div 
                        className="unread-badge"
                        style={{ display: 'flex' }}
                      >
                        {unreadCount > 99 ? '99+' : unreadCount}
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </>
  );
};

export default UserDashboard;
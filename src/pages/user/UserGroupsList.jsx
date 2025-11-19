import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { db } from "../../firebase/firebaseConfig";
import { collection, query, where, getDocs } from "firebase/firestore";
import UserNavbar from "../../components/UserNavbar";
import "../../styles/user/userGroupsList.css";

const UserGroupsList = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadGroups = async () => {
      if (!currentUser) return navigate("/login");

      try {
        const groupRef = collection(db, "groups");
        const q = query(groupRef, where("members", "array-contains", currentUser.uid));
        const snap = await getDocs(q);

        const list = [];
        snap.forEach((doc) => list.push({ id: doc.id, ...doc.data() }));
        setGroups(list);
      } catch (err) {
        console.error("Error loading groups:", err);
      }

      setLoading(false);
    };

    loadGroups();
  }, [currentUser, navigate]);

  if (loading) {
    return <div className="loading-text">Loading groups...</div>;
  }

  return (
    <>
      <UserNavbar />
      <div className="dashboard-container">
        <div className="dashboard-box">
          <h1>My Groups</h1>

        {groups.length === 0 ? (
          <p className="empty-text">You are not part of any groups yet.</p>
        ) : (
          <ul className="group-list">
            {groups.map((group) => {
              return (
                <li
                  key={group.id}
                  className="group-item"
                  onClick={() => navigate(`/chat/${group.id}`)}
                >
                  {group.name}
                </li>
              );
            })}
          </ul>
        )}

        <button
          className="secondary-btn"
          onClick={() => navigate("/user/dashboard")}
        >
          ← Back to Dashboard
        </button>
      </div>
    </div>
    </>
  );
};

export default UserGroupsList;


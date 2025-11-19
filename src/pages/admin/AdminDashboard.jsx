import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { db } from "../../firebase/firebaseConfig";
import { collection, query, where, getDocs, deleteDoc, doc } from "firebase/firestore";
import AdminNavbar from "../../components/AdminNavbar";

import "../../styles/admin/adminDashboard.css";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);

 
  const fetchGroups = async () => {
    if (!currentUser) return;

    try {
      const groupRef = collection(db, "groups");
    
      const q = query(groupRef, where("adminId", "==", currentUser.uid));
      const snapshot = await getDocs(q);

      const list = [];
      snapshot.forEach((docItem) =>
        list.push({ id: docItem.id, ...docItem.data() })
      );

      setGroups(list);
    } catch (error) {
      console.error("Error fetching groups:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!currentUser) {
      navigate("/login");
      return;
    }
    fetchGroups();
   
  }, [currentUser]);

  
  const deleteGroup = async (id, groupName) => {
    const confirmDelete = window.confirm(
      `Are you sure you want to delete "${groupName}"? This action cannot be undone.`
    );

    if (!confirmDelete) return;

    try {
      await deleteDoc(doc(db, "groups", id));
      alert("Group deleted successfully!");
      fetchGroups();
    } catch (error) {
      console.error("Error deleting group:", error);
      alert("Failed to delete group. Please try again.");
    }
  };

  return (
    <>
      <AdminNavbar />
      <div className="admin-container">
        <div className="admin-box">

          {/* PAGE TITLE */}
          <h1 className="admin-title">My Groups</h1>
          <p className="subtitle">Groups you created and manage</p>

          {/* GROUP LIST */}
          <div className="group-list-container">
            {loading ? (
              <p className="empty-msg">Loading your groups...</p>
            ) : groups.length === 0 ? (
              <p className="empty-msg">You haven't created any groups yet. Create one to get started!</p>
            ) : (
              <ul className="group-list">
                {groups.map((group) => {
                  return (
                    <li
                      key={group.id}
                      className="group-item"
                      onClick={() => navigate(`/admin/group/${group.id}`)}
                    >
                      <span className="group-name">{group.name}</span>

                      <span className="group-members">
                        Members: {group.members?.length || 0}
                      </span>

                      <button
                        className="btn-delete"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteGroup(group.id, group.name);
                        }}
                        title="Delete this group"
                      >
                        Delete
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

        </div>
      </div>
    </>
  );
};

export default AdminDashboard;

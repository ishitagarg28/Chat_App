import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./hooks/useAuth";
import Landing from "./pages/Landing";
import Login from "./pages/auth/Login";
import Signup from "./pages/auth/Signup";
import UserDashboard from "./pages/user/UserDashboard";
import JoinGroup from "./pages/user/JoinGroup";
import UserGroupsList from "./pages/user/UserGroupsList";
import AdminDashboard from "./pages/admin/AdminDashboard";
import CreateGroup from "./pages/admin/CreateGroup";
import AdminGroupDetails from "./pages/admin/AdminGroupDetails";
import ChatRoom from "./pages/chat/ChatRoom";
import DirectMessage from "./pages/chat/DirectMessage";

function App() {
  const { authLoading, currentUser } = useAuth();

  if (authLoading) return <div className="loading-text">Loading...</div>;

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        <Route
          path="/user/dashboard"
          element={currentUser ? <UserDashboard /> : <Navigate to="/login" />}
        />

        <Route
          path="/join-group"
          element={currentUser ? <JoinGroup /> : <Navigate to="/login" />}
        />

        <Route
          path="/user/groups"
          element={currentUser ? <UserGroupsList /> : <Navigate to="/login" />}
        />

        <Route
          path="/chat/:groupId"
          element={currentUser ? <ChatRoom /> : <Navigate to="/login" />}
        />

        <Route
          path="/dm/:userId"
          element={currentUser ? <DirectMessage /> : <Navigate to="/login" />}
        />

        <Route
          path="/admin/dashboard"
          element={currentUser ? <AdminDashboard /> : <Navigate to="/login" />}
        />

        <Route
          path="/admin/create-group"
          element={currentUser ? <CreateGroup /> : <Navigate to="/login" />}
        />

        <Route
          path="/admin/group/:id"
          element={currentUser ? <AdminGroupDetails /> : <Navigate to="/login" />}
        />

        <Route path="*" element={<div className="loading-text">Page Not Found</div>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;


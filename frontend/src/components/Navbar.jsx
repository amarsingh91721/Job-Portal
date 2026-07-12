import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";

function Navbar() {
  const navigate = useNavigate();
  const [darkMode, setDarkMode] = useState(
  localStorage.getItem("theme") === "dark"
);

 useEffect(() => {
  if (darkMode) {
    document.body.classList.add("dark");
    localStorage.setItem("theme", "dark");
  } else {
    document.body.classList.remove("dark");
    localStorage.setItem("theme", "light");
  }
}, [darkMode]);

  const token = localStorage.getItem("token");
  const storedUser = localStorage.getItem("user");
  const user = storedUser ? JSON.parse(storedUser) : null;

  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!token) {
      return;
    }

    const fetchUnreadCount = async () => {
      try {
        const response = await api.get(
          "/notifications/unread-count",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setUnreadCount(response.data.unread_count);
      } catch (error) {
        console.log(
          "Notification count error:",
          error.response?.data
        );
      }
    };

    fetchUnreadCount();

    const interval = setInterval(fetchUnreadCount, 15000);

    return () => clearInterval(interval);
  }, [token]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    alert("Logged out successfully");

    navigate("/login");
  };

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-logo">
        JobPortal
      </Link>

      <div className="navbar-links">
        <Link to="/">Home</Link>
        <Link to="/jobs">Jobs</Link>

        {token && <Link to="/dashboard">Dashboard</Link>}

        {token && <Link to="/profile">Profile</Link>}

        {token && user?.role === "candidate" && (
          <Link
            to="/notifications"
            className="notification-navbar-link"
          >
            Notifications

            {unreadCount > 0 && (
              <span className="notification-badge">
                {unreadCount}
              </span>
            )}
          </Link>
        )}

        {token && user?.role === "recruiter" && (
          <Link to="/post-job">Post Job</Link>
        )}

        {token && user?.role === "candidate" && (
          <Link to="/saved-jobs">Saved Jobs</Link>
        )}

        {!token ? (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
          </>
        ) : (
          <>
  <button
    className="theme-btn"
    onClick={() => setDarkMode(!darkMode)}
  >
    {darkMode ? "☀️ Light" : "🌙 Dark"}
  </button>

  <button
    className="logout-btn"
    onClick={handleLogout}
  >
    Logout
  </button>
</>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
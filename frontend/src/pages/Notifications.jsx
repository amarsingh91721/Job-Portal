import { useEffect, useState } from "react";
import api from "../services/api";

function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");

  const fetchNotifications = async () => {
    try {
      const response = await api.get("/notifications", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setNotifications(response.data);
    } catch (error) {
      alert(
        error.response?.data?.message ||
          "Failed to load notifications"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const markAsRead = async (id) => {
    try {
      await api.put(
        `/notifications/${id}/read`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setNotifications((oldNotifications) =>
        oldNotifications.map((notification) =>
          notification.id === id
            ? { ...notification, is_read: true }
            : notification
        )
      );
    } catch (error) {
      alert(
        error.response?.data?.message ||
          "Failed to mark notification as read"
      );
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.put(
        "/notifications/mark/all-read",
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setNotifications((oldNotifications) =>
        oldNotifications.map((notification) => ({
          ...notification,
          is_read: true,
        }))
      );
    } catch (error) {
      alert(
        error.response?.data?.message ||
          "Failed to mark all notifications as read"
      );
    }
  };

  const deleteNotification = async (id) => {
    try {
      await api.delete(`/notifications/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setNotifications((oldNotifications) =>
        oldNotifications.filter(
          (notification) => notification.id !== id
        )
      );
    } catch (error) {
      alert(
        error.response?.data?.message ||
          "Failed to delete notification"
      );
    }
  };

  if (loading) {
    return (
      <div className="notifications-page">
        <h2>Loading notifications...</h2>
      </div>
    );
  }

  return (
    <div className="notifications-page">
      <div className="notifications-header">
        <h1>Notifications</h1>

        {notifications.length > 0 && (
          <button onClick={markAllAsRead}>
            Mark All as Read
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="empty-notification-box">
          <h2>No notifications yet.</h2>
          <p>
            Application updates will appear here.
          </p>
        </div>
      ) : (
        <div className="notifications-list">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className={`notification-card ${
                notification.is_read
                  ? "notification-read"
                  : "notification-unread"
              }`}
            >
              <div>
                <p>{notification.message}</p>

               <small>
  {new Date(notification.created_at).toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  })}
</small>
              </div>

              <div className="notification-actions">
                {!notification.is_read && (
                  <button
                    onClick={() =>
                      markAsRead(notification.id)
                    }
                  >
                    Mark Read
                  </button>
                )}

                <button
                  className="notification-delete-btn"
                  onClick={() =>
                    deleteNotification(notification.id)
                  }
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Notifications;
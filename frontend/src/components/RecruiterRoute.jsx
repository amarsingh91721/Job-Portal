import { Navigate } from "react-router-dom";

function RecruiterRoute({ children }) {
  const token = localStorage.getItem("token");
  const storedUser = localStorage.getItem("user");
  const user = storedUser ? JSON.parse(storedUser) : null;

  if (!token) {
    return <Navigate to="/login" />;
  }

  if (user?.role !== "recruiter") {
    return <Navigate to="/dashboard" />;
  }

  return children;
}

export default RecruiterRoute;
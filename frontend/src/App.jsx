import { Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import RecruiterRoute from "./components/RecruiterRoute";

import Home from "./pages/Home";
import Jobs from "./pages/Jobs";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import PostJob from "./pages/PostJob";
import EditJob from "./pages/EditJob";
import Applicants from "./pages/Applicants";
import SavedJobs from "./pages/SavedJobs";
import Profile from "./pages/Profile";

function App() {
  return (
    <>
      <Navbar />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/jobs" element={<Jobs />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />

        <Route
          path="/saved-jobs"
          element={
            <ProtectedRoute>
              <SavedJobs />
            </ProtectedRoute>
          }
        />

        <Route
          path="/post-job"
          element={
            <RecruiterRoute>
              <PostJob />
            </RecruiterRoute>
          }
        />

        <Route
          path="/edit-job/:id"
          element={
            <RecruiterRoute>
              <EditJob />
            </RecruiterRoute>
          }
        />

        <Route
          path="/applicants/:id"
          element={
            <RecruiterRoute>
              <Applicants />
            </RecruiterRoute>
          }
        />
      </Routes>
    </>
  );
}

export default App;
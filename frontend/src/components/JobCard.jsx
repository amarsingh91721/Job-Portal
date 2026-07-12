import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";

function JobCard({ job }) {
  const storedUser = localStorage.getItem("user");
  const user = storedUser ? JSON.parse(storedUser) : null;
  const token = localStorage.getItem("token");

  const [isSaved, setIsSaved] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);

  useEffect(() => {
    const checkSavedStatus = async () => {
      if (!token || user?.role !== "candidate") {
        return;
      }

      try {
        const response = await api.get(
          `/jobs/${job.id}/saved-status`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setIsSaved(response.data.isSaved);
      } catch (error) {
        console.log(
          "Saved status error:",
          error.response?.data || error.message
        );
      }
    };

    checkSavedStatus();
  }, [job.id, token, user?.role]);

  const handleApply = async () => {
    try {
      await api.post(
        `/jobs/${job.id}/apply`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert("Applied successfully!");
    } catch (error) {
      alert(
        error.response?.data?.message ||
          "Application failed."
      );
    }
  };

  const handleSaveToggle = async () => {
    try {
      setSaveLoading(true);

      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      if (isSaved) {
        await api.delete(`/jobs/${job.id}/save`, config);

        setIsSaved(false);
        alert("Job removed from saved jobs.");

        // Remove the card immediately when viewing Saved Jobs
        if (window.location.pathname === "/saved-jobs") {
          window.location.reload();
        }
      } else {
        await api.post(
          `/jobs/${job.id}/save`,
          {},
          config
        );

        setIsSaved(true);
        alert("Job saved successfully!");
      }
    } catch (error) {
      alert(
        error.response?.data?.message ||
          "Unable to update saved job."
      );
    } finally {
      setSaveLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/jobs/${job.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      alert("Job deleted successfully!");
      window.location.reload();
    } catch (error) {
      alert(
        error.response?.data?.message ||
          "Delete failed"
      );
    }
  };

  return (
    <div className="job-card">
      {job.company_logo && (
        <img
          src={`http://localhost:5000${job.company_logo}`}
          alt={`${job.company} logo`}
          style={{
            width: "70px",
            height: "70px",
            objectFit: "contain",
            border: "1px solid #ddd",
            borderRadius: "10px",
            padding: "5px",
            background: "#fff",
            marginBottom: "10px",
          }}
        />
      )}

      <h2>{job.title}</h2>

      <p>
        <strong>Company:</strong> {job.company}
      </p>

      <p>
        <strong>Location:</strong> {job.location}
      </p>

      <p>
        <strong>Salary:</strong>{" "}
        {job.salary || "Not specified"}
      </p>

      <p>{job.description}</p>

      <div
        style={{
          marginTop: "15px",
          display: "flex",
          gap: "10px",
          flexWrap: "wrap",
        }}
      >
        <Link
          to={`/jobs/${job.id}`}
          className="apply-btn"
          style={{
            textDecoration: "none",
            display: "inline-block",
          }}
        >
          View Details
        </Link>

        {user?.role === "candidate" && (
          <>
            <button
              className="apply-btn"
              onClick={handleApply}
            >
              Apply
            </button>

            <button
              className={
                isSaved ? "unsave-btn" : "save-btn"
              }
              onClick={handleSaveToggle}
              disabled={saveLoading}
            >
              {saveLoading
                ? "Please wait..."
                : isSaved
                ? "♥ Unsave"
                : "♡ Save"}
            </button>
          </>
        )}

        {user?.role === "recruiter" && (
          <>
            <Link
              to={`/edit-job/${job.id}`}
              state={{ job }}
              className="apply-btn"
              style={{
                textDecoration: "none",
                display: "inline-block",
              }}
            >
              Edit
            </Link>

            <button
              className="delete-btn"
              onClick={handleDelete}
            >
              Delete
            </button>

            <Link
              to={`/applicants/${job.id}`}
              className="apply-btn"
              style={{
                textDecoration: "none",
                display: "inline-block",
              }}
            >
              View Applicants
            </Link>
          </>
        )}
      </div>
    </div>
  );
}

export default JobCard;
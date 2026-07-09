import { Link } from "react-router-dom";
import api from "../services/api";

function JobCard({ job }) {
  const user = JSON.parse(localStorage.getItem("user"));
  const token = localStorage.getItem("token");

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
      alert(error.response?.data?.message || "Application failed.");
    }
  };



  const handleSave = async () => {
  try {
    await api.post(
      `/jobs/${job.id}/save`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    alert("Job saved successfully!");
  } catch (error) {
    alert(error.response?.data?.message || "Save failed");
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
      alert(error.response?.data?.message || "Delete failed");
    }
  };

  return (
    <div className="job-card">
      <h2>{job.title}</h2>

      <p><strong>Company:</strong> {job.company}</p>
      <p><strong>Location:</strong> {job.location}</p>
      <p><strong>Salary:</strong> {job.salary}</p>
      <p>{job.description}</p>

      <div style={{ marginTop: "15px", display: "flex", gap: "10px", flexWrap: "wrap" }}>
        {user?.role === "candidate" && (
  <>
    <button className="apply-btn" onClick={handleApply}>
      Apply
    </button>

    <button className="save-btn" onClick={handleSave}>
      Save
    </button>
  </>
   )}

        {user?.role === "recruiter" && (
          <>
            <Link
              to={`/edit-job/${job.id}`}
              state={{ job }}
              className="apply-btn"
              style={{ textDecoration: "none", display: "inline-block" }}
            >
              Edit
            </Link>

            <button className="delete-btn" onClick={handleDelete}>
              Delete
            </button>

            <Link
              to={`/applicants/${job.id}`}
              className="apply-btn"
              style={{ textDecoration: "none", display: "inline-block" }}
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
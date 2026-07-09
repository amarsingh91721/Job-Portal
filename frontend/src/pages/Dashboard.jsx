import { useEffect, useState } from "react";
import api from "../services/api";
import JobCard from "../components/JobCard";

function Dashboard() {
  const user = JSON.parse(localStorage.getItem("user"));
  const [myJobs, setMyJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [resume, setResume] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (user?.role === "recruiter") {
      api
        .get("/jobs/my/jobs", {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((res) => setMyJobs(res.data));
    }

    if (user?.role === "candidate") {
      api
        .get("/jobs/my/applications", {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((res) => setApplications(res.data));
    }
  }, []);

  const handleResumeUpload = async () => {
    try {
      if (!resume) {
        alert("Please select a resume PDF");
        return;
      }

      const token = localStorage.getItem("token");
      const formData = new FormData();

      formData.append("resume", resume);

      const response = await api.post("/auth/upload-resume", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      localStorage.setItem("user", JSON.stringify(response.data.user));
      alert("Resume uploaded successfully!");
      window.location.reload();
    } catch (error) {
      alert(error.response?.data?.message || "Resume upload failed");
      console.log(error.response?.data);
    }
  };

  return (
    <div className="dashboard-page">
      <h1>Dashboard</h1>

      <div className="dashboard-card">
        <h2>Welcome, {user?.name}</h2>
        <p>
          <b>Email:</b> {user?.email}
        </p>
        <p>
          <b>Role:</b> {user?.role}
        </p>

        {user?.role === "candidate" && (
          <div className="resume-box">
            <h3>Resume</h3>

            {user?.resume ? (
              <a
                href={`http://localhost:5000/${user.resume}`}
                target="_blank"
                rel="noreferrer"
              >
                View Uploaded Resume
              </a>
            ) : (
              <p>No resume uploaded yet.</p>
            )}

            <input
              type="file"
              accept=".pdf"
              onChange={(e) => setResume(e.target.files[0])}
            />

            <button className="apply-btn" onClick={handleResumeUpload}>
              Upload Resume
            </button>
          </div>
        )}
      </div>

      {user?.role === "recruiter" && (
        <>
          <h2 style={{ marginTop: "30px" }}>My Posted Jobs</h2>

          <div className="jobs-grid">
            {myJobs.length === 0 ? (
              <p>No jobs posted yet.</p>
            ) : (
              myJobs.map((job) => <JobCard key={job.id} job={job} />)
            )}
          </div>
        </>
      )}

      {user?.role === "candidate" && (
        <>
          <h2 style={{ marginTop: "30px" }}>My Applications</h2>

          {applications.length === 0 ? (
            <p>No applications yet.</p>
          ) : (
            <table className="applicant-table">
              <thead>
                <tr>
                  <th>Job</th>
                  <th>Company</th>
                  <th>Location</th>
                  <th>Salary</th>
                  <th>Status</th>
                  <th>Applied At</th>
                </tr>
              </thead>

              <tbody>
                {applications.map((app) => (
                  <tr key={app.application_id}>
                    <td>{app.title}</td>
                    <td>{app.company}</td>
                    <td>{app.location}</td>
                    <td>{app.salary}</td>
                    <td>{app.status}</td>
                    <td>{new Date(app.applied_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </>
      )}
    </div>
  );
}

export default Dashboard;
import { useEffect, useState } from "react";
import api from "../services/api";
import JobCard from "../components/JobCard";

function Dashboard() {
  const storedUser = localStorage.getItem("user");
  const user = storedUser ? JSON.parse(storedUser) : null;

  const [myJobs, setMyJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [resume, setResume] = useState(null);

  const [analytics, setAnalytics] = useState({
    summary: {
      total_jobs: 0,
      total_applications: 0,
      pending: 0,
      accepted: 0,
      rejected: 0,
    },
    jobs: [],
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const token = localStorage.getItem("token");

        const config = {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        };

        if (user?.role === "recruiter") {
          const [jobsResponse, analyticsResponse] = await Promise.all([
            api.get("/jobs/my/jobs", config),
            api.get("/jobs/analytics/recruiter", config),
          ]);

          setMyJobs(jobsResponse.data);
          setAnalytics(analyticsResponse.data);
        }

        if (user?.role === "candidate") {
          const response = await api.get(
            "/jobs/my/applications",
            config
          );

          setApplications(response.data);
        }
      } catch (error) {
        alert(
          error.response?.data?.message ||
            "Failed to load dashboard"
        );

        console.log(error.response?.data);
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
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

      const response = await api.post(
        "/auth/upload-resume",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      localStorage.setItem(
        "user",
        JSON.stringify(response.data.user)
      );

      alert("Resume uploaded successfully!");
      window.location.reload();
    } catch (error) {
      alert(
        error.response?.data?.message ||
          "Resume upload failed"
      );

      console.log(error.response?.data);
    }
  };

  const getFileUrl = (filePath) => {
    if (!filePath) {
      return "";
    }

    const normalizedPath = filePath.startsWith("/")
      ? filePath
      : `/${filePath}`;

    return `https://job-portal-backend-hnv4.onrender.com${normalizedPath}`;
  };

  const getStatusClass = (status) => {
    if (status === "accepted") {
      return "status-accepted";
    }

    if (status === "rejected") {
      return "status-rejected";
    }

    return "status-pending";
  };

  if (loading) {
    return (
      <div className="dashboard-page">
        <h2>Loading dashboard...</h2>
      </div>
    );
  }

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
                href={getFileUrl(user.resume)}
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
              onChange={(e) =>
                setResume(e.target.files[0])
              }
            />

            <button
              className="apply-btn"
              onClick={handleResumeUpload}
            >
              Upload Resume
            </button>
          </div>
        )}
      </div>

      {user?.role === "recruiter" && (
        <>
          <h2 className="dashboard-section-title">
            Recruitment Analytics
          </h2>

          <div className="analytics-grid">
            <div className="analytics-card">
              <p>Total Jobs</p>
              <h2>{analytics.summary.total_jobs}</h2>
            </div>

            <div className="analytics-card">
              <p>Total Applications</p>
              <h2>
                {analytics.summary.total_applications}
              </h2>
            </div>

            <div className="analytics-card pending-card">
              <p>Pending</p>
              <h2>{analytics.summary.pending}</h2>
            </div>

            <div className="analytics-card accepted-card">
              <p>Accepted</p>
              <h2>{analytics.summary.accepted}</h2>
            </div>

            <div className="analytics-card rejected-card">
              <p>Rejected</p>
              <h2>{analytics.summary.rejected}</h2>
            </div>
          </div>

          <div className="job-performance-card">
            <h2>Applications per Job</h2>

            {analytics.jobs.length === 0 ? (
              <p>No job analytics available yet.</p>
            ) : (
              <div className="job-performance-list">
                {analytics.jobs.map((job) => (
                  <div
                    className="job-performance-row"
                    key={job.id}
                  >
                    <div>
                      <h3>{job.title}</h3>
                      <p>{job.company}</p>
                    </div>

                    <span>
                      {job.application_count} application
                      {job.application_count !== 1
                        ? "s"
                        : ""}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <h2 className="dashboard-section-title">
            My Posted Jobs
          </h2>

          <div className="jobs-grid">
            {myJobs.length === 0 ? (
              <p>No jobs posted yet.</p>
            ) : (
              myJobs.map((job) => (
                <JobCard key={job.id} job={job} />
              ))
            )}
          </div>
        </>
      )}

      {user?.role === "candidate" && (
        <>
          <h2 className="dashboard-section-title">
            My Applications
          </h2>

          {applications.length === 0 ? (
            <p>No applications yet.</p>
          ) : (
            <div className="table-wrapper">
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

                      <td>
                        <span
                          className={`application-status ${getStatusClass(
                            app.status
                          )}`}
                        >
                          {app.status}
                        </span>
                      </td>

                      <td>
                        {new Date(
                          app.applied_at
                        ).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default Dashboard;
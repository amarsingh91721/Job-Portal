import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../services/api";
import JobCard from "../components/JobCard";

function JobDetails() {
  const { id } = useParams();

  const [job, setJob] = useState(null);
  const [similarJobs, setSimilarJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchJobDetails = async () => {
      try {
        setLoading(true);

        const [jobResponse, similarResponse] = await Promise.all([
          api.get(`/jobs/${id}`),
          api.get(`/jobs/${id}/similar`),
        ]);

        setJob(jobResponse.data);
        setSimilarJobs(similarResponse.data);
      } catch (error) {
        alert(
          error.response?.data?.message ||
            "Failed to load job details"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchJobDetails();
  }, [id]);

  if (loading) {
    return (
      <div className="jobs-page">
        <h2>Loading job details...</h2>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="jobs-page">
        <h2>Job not found.</h2>
      </div>
    );
  }

  return (
    <div className="job-details-page">
      <div className="job-details-card">
        {job.company_logo && (
          <img
            src={`http://localhost:5000${job.company_logo}`}
            alt={job.company}
            className="job-details-logo"
          />
        )}

        <h1>{job.title}</h1>
        <h2>{job.company}</h2>

        <div className="job-details-info">
          <p>
            <strong>Location:</strong> {job.location}
          </p>

          <p>
            <strong>Salary:</strong>{" "}
            {job.salary || "Not specified"}
          </p>

          <p>
            <strong>Category:</strong>{" "}
            {job.category || "Not specified"}
          </p>

          <p>
            <strong>Job Type:</strong>{" "}
            {job.job_type || "Not specified"}
          </p>

          <p>
            <strong>Work Mode:</strong>{" "}
            {job.work_mode || "Not specified"}
          </p>

          <p>
            <strong>Experience:</strong>{" "}
            {job.experience_level || "Not specified"}
          </p>
        </div>

        <div className="job-description-section">
          <h2>Job Description</h2>
          <p>{job.description}</p>
        </div>
      </div>

      <div className="similar-jobs-section">
        <h2>Similar Jobs</h2>

        {similarJobs.length === 0 ? (
          <p>No similar jobs found.</p>
        ) : (
          <div className="jobs-grid">
            {similarJobs.map((similarJob) => (
              <JobCard
                key={similarJob.id}
                job={similarJob}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default JobDetails;
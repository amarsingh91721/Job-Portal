import { useEffect, useState } from "react";
import api from "../services/api";
import JobCard from "../components/JobCard";

function SavedJobs() {
  const [savedJobs, setSavedJobs] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem("token");

    api
      .get("/jobs/my/saved", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => setSavedJobs(res.data))
      .catch((err) => console.log(err));
  }, []);

  return (
    <div className="jobs-page">
      <h1>Saved Jobs</h1>

      <div className="jobs-grid">
        {savedJobs.length === 0 ? (
          <p>No saved jobs yet.</p>
        ) : (
          savedJobs.map((job) => <JobCard key={job.id} job={job} />)
        )}
      </div>
    </div>
  );
}

export default SavedJobs;
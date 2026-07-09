import { useEffect, useState } from "react";
import JobCard from "../components/JobCard";

function Jobs() {
  const [jobs, setJobs] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("http://localhost:5000/api/jobs")
      .then((res) => res.json())
      .then((data) => setJobs(data));
  }, []);

  const filteredJobs = jobs.filter((job) => {
    return (
      job.title.toLowerCase().includes(search.toLowerCase()) ||
      job.company.toLowerCase().includes(search.toLowerCase()) ||
      job.location.toLowerCase().includes(search.toLowerCase())
    );
  });

  return (
    <div className="jobs-page">

      <h1>Available Jobs</h1>

      <input
        className="search-box"
        type="text"
        placeholder="Search by title, company or location..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {filteredJobs.length === 0 ? (
        <h2>No jobs found.</h2>
      ) : (
        <div className="jobs-grid">
          {filteredJobs.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>
      )}
    </div>
  );
}

export default Jobs;
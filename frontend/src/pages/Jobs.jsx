import { useEffect, useState } from "react";
import api from "../services/api";
import JobCard from "../components/JobCard";

function Jobs() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);

  const [filters, setFilters] = useState({
    search: "",
    category: "",
    job_type: "",
    work_mode: "",
    experience_level: "",
    location: "",
    sort: "newest",
  });

  const fetchJobs = async () => {
    try {
      setLoading(true);

      const params = {};

      Object.keys(filters).forEach((key) => {
        if (filters[key]) {
          params[key] = filters[key];
        }
      });

      const response = await api.get("/jobs", {
        params,
      });

      setJobs(response.data);
    } catch (error) {
      alert(
        error.response?.data?.message ||
          "Failed to load jobs"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchJobs();
    }, 300);

    return () => clearTimeout(timer);
  }, [filters]);

  const handleChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value,
    });
  };

  const clearFilters = () => {
    setFilters({
      search: "",
      category: "",
      job_type: "",
      work_mode: "",
      experience_level: "",
      location: "",
      sort: "newest",
    });
  };

  return (
    <div className="jobs-page">
      <h1>Available Jobs</h1>

      <div className="job-filter-panel">
        <input
          className="search-box"
          type="text"
          name="search"
          placeholder="Search title, company or description..."
          value={filters.search}
          onChange={handleChange}
        />

        <input
          type="text"
          name="location"
          placeholder="Search location..."
          value={filters.location}
          onChange={handleChange}
        />

        <select
          name="category"
          value={filters.category}
          onChange={handleChange}
        >
          <option value="">All Categories</option>
          <option value="Software Development">
            Software Development
          </option>
          <option value="Data Science">
            Data Science
          </option>
          <option value="Cyber Security">
            Cyber Security
          </option>
          <option value="Cloud Computing">
            Cloud Computing
          </option>
          <option value="DevOps">DevOps</option>
          <option value="Design">Design</option>
          <option value="Marketing">
            Marketing
          </option>
          <option value="Finance">Finance</option>
          <option value="Other">Other</option>
        </select>

        <select
          name="job_type"
          value={filters.job_type}
          onChange={handleChange}
        >
          <option value="">All Job Types</option>
          <option value="Full-time">Full-time</option>
          <option value="Part-time">Part-time</option>
          <option value="Internship">Internship</option>
          <option value="Contract">Contract</option>
        </select>

        <select
          name="work_mode"
          value={filters.work_mode}
          onChange={handleChange}
        >
          <option value="">All Work Modes</option>
          <option value="Remote">Remote</option>
          <option value="Hybrid">Hybrid</option>
          <option value="Onsite">Onsite</option>
        </select>

        <select
          name="experience_level"
          value={filters.experience_level}
          onChange={handleChange}
        >
          <option value="">
            All Experience Levels
          </option>
          <option value="Fresher">Fresher</option>
          <option value="0-1 Years">
            0-1 Years
          </option>
          <option value="1-3 Years">
            1-3 Years
          </option>
          <option value="3-5 Years">
            3-5 Years
          </option>
          <option value="5+ Years">
            5+ Years
          </option>
        </select>

        <select
          name="sort"
          value={filters.sort}
          onChange={handleChange}
        >
          <option value="newest">
            Newest First
          </option>
          <option value="oldest">
            Oldest First
          </option>
          <option value="salary_high">
            Salary: High to Low
          </option>
          <option value="salary_low">
            Salary: Low to High
          </option>
        </select>

        <button
          className="clear-filter-btn"
          onClick={clearFilters}
        >
          Clear Filters
        </button>
      </div>

      <p className="job-result-count">
        {jobs.length} job{jobs.length !== 1 ? "s" : ""} found
      </p>

      {loading ? (
        <h2>Loading jobs...</h2>
      ) : jobs.length === 0 ? (
        <h2>No jobs found.</h2>
      ) : (
        <div className="jobs-grid">
          {jobs.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>
      )}
    </div>
  );
}

export default Jobs;
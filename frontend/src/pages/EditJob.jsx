import { useState } from "react";
import {
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";

import api from "../services/api";

function EditJob() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const oldJob = location.state?.job;

  const [form, setForm] = useState({
    title: oldJob?.title || "",
    company: oldJob?.company || "",
    location: oldJob?.location || "",
    salary: oldJob?.salary || "",
    description: oldJob?.description || "",
    category: oldJob?.category || "",
    job_type: oldJob?.job_type || "",
    work_mode: oldJob?.work_mode || "",
    experience_level:
      oldJob?.experience_level || "",
  });

  const [companyLogo, setCompanyLogo] =
    useState(null);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleUpdate = async () => {
    try {
      const token = localStorage.getItem("token");

      const formData = new FormData();

      formData.append("title", form.title);
      formData.append("company", form.company);
      formData.append("location", form.location);
      formData.append("salary", form.salary);
      formData.append(
        "description",
        form.description
      );
      formData.append("category", form.category);
      formData.append("job_type", form.job_type);
      formData.append(
        "work_mode",
        form.work_mode
      );
      formData.append(
        "experience_level",
        form.experience_level
      );

      if (companyLogo) {
        formData.append(
          "company_logo",
          companyLogo
        );
      }

      await api.put(`/jobs/${id}`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      alert("Job updated successfully!");
      navigate("/dashboard");
    } catch (error) {
      alert(
        error.response?.data?.message ||
          "Update failed"
      );
    }
  };

  return (
    <div className="login-page">
      <div className="login-box">
        <h2>Edit Job</h2>

        <input
          name="title"
          value={form.title}
          onChange={handleChange}
          placeholder="Job Title"
        />

        <input
          name="company"
          value={form.company}
          onChange={handleChange}
          placeholder="Company"
        />

        <input
          name="location"
          value={form.location}
          onChange={handleChange}
          placeholder="Location"
        />

        <input
          name="salary"
          value={form.salary}
          onChange={handleChange}
          placeholder="Salary"
        />

        <select
          name="category"
          value={form.category}
          onChange={handleChange}
        >
          <option value="">Select Category</option>
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
          value={form.job_type}
          onChange={handleChange}
        >
          <option value="">Select Job Type</option>
          <option value="Full-time">Full-time</option>
          <option value="Part-time">Part-time</option>
          <option value="Internship">Internship</option>
          <option value="Contract">Contract</option>
        </select>

        <select
          name="work_mode"
          value={form.work_mode}
          onChange={handleChange}
        >
          <option value="">Select Work Mode</option>
          <option value="Remote">Remote</option>
          <option value="Hybrid">Hybrid</option>
          <option value="Onsite">Onsite</option>
        </select>

        <select
          name="experience_level"
          value={form.experience_level}
          onChange={handleChange}
        >
          <option value="">
            Select Experience Level
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

        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
          placeholder="Job Description"
          rows="5"
        />

        {oldJob?.company_logo && (
          <div style={{ marginBottom: "10px" }}>
            <p>Current Logo:</p>

            <img
              src={`http://localhost:5000${oldJob.company_logo}`}
              alt="Company Logo"
              style={{
                width: "80px",
                height: "80px",
                objectFit: "contain",
                borderRadius: "8px",
              }}
            />
          </div>
        )}

        <label>Update Company Logo</label>

        <input
          type="file"
          accept="image/*"
          onChange={(e) =>
            setCompanyLogo(e.target.files[0])
          }
        />

        <button onClick={handleUpdate}>
          Update Job
        </button>
      </div>
    </div>
  );
}

export default EditJob;
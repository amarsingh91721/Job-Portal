import { useState } from "react";
import api from "../services/api";

function PostJob() {
  const [form, setForm] = useState({
    title: "",
    company: "",
    location: "",
    salary: "",
    description: "",
    category: "",
    job_type: "",
    work_mode: "",
    experience_level: "",
  });

  const [companyLogo, setCompanyLogo] = useState(null);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handlePostJob = async () => {
    try {
      const token = localStorage.getItem("token");

      if (
        !form.title ||
        !form.company ||
        !form.location ||
        !form.description
      ) {
        alert("Please fill all required fields.");
        return;
      }

      const formData = new FormData();

      formData.append("title", form.title);
      formData.append("company", form.company);
      formData.append("location", form.location);
      formData.append("salary", form.salary);
      formData.append("description", form.description);
      formData.append("category", form.category);
      formData.append("job_type", form.job_type);
      formData.append("work_mode", form.work_mode);
      formData.append(
        "experience_level",
        form.experience_level
      );

      if (companyLogo) {
        formData.append("company_logo", companyLogo);
      }

      await api.post("/jobs", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      alert("Job Posted Successfully!");

      setForm({
        title: "",
        company: "",
        location: "",
        salary: "",
        description: "",
        category: "",
        job_type: "",
        work_mode: "",
        experience_level: "",
      });

      setCompanyLogo(null);
    } catch (error) {
      alert(
        error.response?.data?.message ||
          "Failed to post job."
      );

      console.log(error.response?.data);
    }
  };

  return (
    <div className="login-page">
      <div className="login-box">
        <h2>Post Job</h2>

        <input
          name="title"
          placeholder="Job Title"
          value={form.title}
          onChange={handleChange}
        />

        <input
          name="company"
          placeholder="Company"
          value={form.company}
          onChange={handleChange}
        />

        <input
          name="location"
          placeholder="Location"
          value={form.location}
          onChange={handleChange}
        />

        <input
          name="salary"
          placeholder="Salary"
          value={form.salary}
          onChange={handleChange}
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
          <option value="Data Science">Data Science</option>
          <option value="Cyber Security">
            Cyber Security
          </option>
          <option value="Cloud Computing">
            Cloud Computing
          </option>
          <option value="DevOps">DevOps</option>
          <option value="Design">Design</option>
          <option value="Marketing">Marketing</option>
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
          <option value="">Select Experience Level</option>
          <option value="Fresher">Fresher</option>
          <option value="0-1 Years">0-1 Years</option>
          <option value="1-3 Years">1-3 Years</option>
          <option value="3-5 Years">3-5 Years</option>
          <option value="5+ Years">5+ Years</option>
        </select>

        <textarea
          name="description"
          placeholder="Job Description"
          value={form.description}
          onChange={handleChange}
          rows="5"
        />

        <label>Company Logo</label>

        <input
          type="file"
          accept="image/*"
          onChange={(e) =>
            setCompanyLogo(e.target.files[0])
          }
        />

        {companyLogo && (
          <img
            src={URL.createObjectURL(companyLogo)}
            alt="Preview"
            style={{
              width: "80px",
              height: "80px",
              objectFit: "contain",
              borderRadius: "10px",
              marginTop: "10px",
              marginBottom: "15px",
            }}
          />
        )}

        <button onClick={handlePostJob}>
          Post Job
        </button>
      </div>
    </div>
  );
}

export default PostJob;
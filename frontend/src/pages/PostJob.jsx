import { useState } from "react";
import api from "../services/api";

function PostJob() {
  const [form, setForm] = useState({
    title: "",
    company: "",
    location: "",
    salary: "",
    description: "",
  });

  const [companyLogo, setCompanyLogo] = useState(null);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handlePostJob = async () => {
    try {
      const token = localStorage.getItem("token");

      const formData = new FormData();

      formData.append("title", form.title);
      formData.append("company", form.company);
      formData.append("location", form.location);
      formData.append("salary", form.salary);
      formData.append("description", form.description);

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
      });

      setCompanyLogo(null);
    } catch (error) {
      alert(error.response?.data?.message || "Failed to post job.");
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

        <input
          name="description"
          placeholder="Description"
          value={form.description}
          onChange={handleChange}
        />

        <label>Company Logo</label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setCompanyLogo(e.target.files[0])}
        />
    {companyLogo && (
  <img
    src={URL.createObjectURL(companyLogo)}
    alt="Preview"
    style={{
      width: "80px",
      height: "80px",
      objectFit: "cover",
      borderRadius: "10px",
      marginTop: "10px",
    }}
  />
)}

        <button onClick={handlePostJob}>Post Job</button>
      </div>
    </div>
  );
}

export default PostJob;
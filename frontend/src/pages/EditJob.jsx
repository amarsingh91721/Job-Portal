import { useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
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
  });

  const [companyLogo, setCompanyLogo] = useState(null);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleUpdate = async () => {
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

      await api.put(`/jobs/${id}`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      alert("Job updated successfully!");
      navigate("/dashboard");
    } catch (error) {
      alert(error.response?.data?.message || "Update failed");
    }
  };

  return (
    <div className="login-page">
      <div className="login-box">
        <h2>Edit Job</h2>

        <input name="title" value={form.title} onChange={handleChange} />
        <input name="company" value={form.company} onChange={handleChange} />
        <input name="location" value={form.location} onChange={handleChange} />
        <input name="salary" value={form.salary} onChange={handleChange} />

        <input
          name="description"
          value={form.description}
          onChange={handleChange}
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
                objectFit: "cover",
                borderRadius: "8px",
              }}
            />
          </div>
        )}

        <label>Update Company Logo</label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setCompanyLogo(e.target.files[0])}
        />

        <button onClick={handleUpdate}>Update Job</button>
      </div>
    </div>
  );
}

export default EditJob;
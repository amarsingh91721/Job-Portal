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

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleUpdate = async () => {
    try {
      const token = localStorage.getItem("token");

      await api.put(`/jobs/${id}`, form, {
        headers: {
          Authorization: `Bearer ${token}`,
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

        <button onClick={handleUpdate}>Update Job</button>
      </div>
    </div>
  );
}

export default EditJob;
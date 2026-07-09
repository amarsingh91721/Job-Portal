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

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handlePostJob = async () => {
    try {
      const token = localStorage.getItem("token");

      await api.post("/jobs", form, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      alert("Job Posted Successfully!");
    } catch (error) {
      alert("Failed to post job. Please login first.");
      console.log(error.response?.data);
    }
  };

  return (
    <div className="login-page">
      <div className="login-box">
        <h2>Post Job</h2>

        <input name="title" placeholder="Job Title" onChange={handleChange} />
        <input name="company" placeholder="Company" onChange={handleChange} />
        <input name="location" placeholder="Location" onChange={handleChange} />
        <input name="salary" placeholder="Salary" onChange={handleChange} />
        <input name="description" placeholder="Description" onChange={handleChange} />

        <button onClick={handlePostJob}>Post Job</button>
      </div>
    </div>
  );
}

export default PostJob;
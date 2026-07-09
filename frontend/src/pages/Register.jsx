import { useState } from "react";
import api from "../services/api";

function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("candidate");

  const handleRegister = async () => {
    try {
      await api.post("/auth/register", {
        name,
        email,
        password,
        role,
      });

      alert("Registration Successful!");
    } catch (error) {
  console.log(error.response?.data);
  alert(error.response?.data?.message || "Registration Failed");
}
  };

  return (
    <div className="login-page">
      <div className="login-box">
        <h2>Register</h2>

        <input
          type="text"
          placeholder="Enter Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <input
          type="email"
          placeholder="Enter Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Enter Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
        >
          <option value="candidate">Candidate</option>
          <option value="recruiter">Recruiter</option>
        </select>

        <button onClick={handleRegister}>
          Register
        </button>
      </div>
    </div>
  );
}

export default Register;
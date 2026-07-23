import { useState } from "react";
import api from "../services/api";
import { GoogleLogin } from "@react-oauth/google";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    try {
      const response = await api.post("/auth/login", {
        email,
        password,
      });

      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.user));

      alert("Login Successful!");
    } catch (error) {
      alert("Invalid Email or Password");
      console.log(error.response?.data);
    }
  };


  const handleGoogleLogin = async (credentialResponse) => {
    try {

      console.log("Google credential response:", credentialResponse);

      if (!credentialResponse || !credentialResponse.credential) {
        alert("Google credential missing. Check popup or browser console for errors.");
        return;
      }

      const response = await api.post("/auth/google", {
        token: credentialResponse.credential,
      });


      localStorage.setItem(
        "token",
        response.data.token
      );

      localStorage.setItem(
        "user",
        JSON.stringify(response.data.user)
      );


      alert("Google Login Successful!");

    } catch(error){

      console.log("Google login error response:", error.response?.data || error.message);

      alert("Google Login Failed: " + (error.response?.data?.message || error.message));

    }
  };


  return (
    <div className="login-page">
      <div className="login-box">

        <h2>Login</h2>


        <input
          type="email"
          placeholder="Enter Email"
          value={email}
          onChange={(e)=>setEmail(e.target.value)}
        />


        <input
          type="password"
          placeholder="Enter Password"
          value={password}
          onChange={(e)=>setPassword(e.target.value)}
        />


        <button onClick={handleLogin}>
          Login
        </button>


        <br />
        <br />


        <GoogleLogin
          onSuccess={handleGoogleLogin}
          onError={()=>{
            console.log("Google Login Failed");
          }}
        />


      </div>
    </div>
  );
}

export default Login;
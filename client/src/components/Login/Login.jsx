import { useState } from "react"; import { useNavigate } from "react-router-dom"; import { useAuth } from "../../context/AuthContext";
const Login = () => { const [email, setEmail] = useState(""); const [password, setPassword] = useState("");
const { login } = useAuth(); const navigate = useNavigate();
const handleSubmit = (e) => { e.preventDefault();
// Temporary frontend authentication
login({
  email,
});

navigate("/");
};
return ( <div style={{ maxWidth: "400px", margin: "50px auto" }}> <h2>Login</h2>
  <form onSubmit={handleSubmit}>
    <input
      type="email"
      placeholder="Enter your email"
      value={email}
      onChange={(e) => setEmail(e.target.value)}
      required
    />

    <br />
    <br />

    <input
      type="password"
      placeholder="Enter your password"
      value={password}
      onChange={(e) => setPassword(e.target.value)}
      required
    />

    <br />
    <br />

    <button type="submit">Login</button>
  </form>
</div>
); };
export default Login;
import { useState } from "react";
const Register = () => { const [name, setName] = useState(""); const [email, setEmail] = useState(""); const [password, setPassword] = useState(""); const [confirmPassword, setConfirmPassword] = useState("");
const handleSubmit = (e) => { e.preventDefault(); alert("Registration form submitted!"); };
return ( <div className="max-w-md mx-auto p-6"> <h1 className="text-2xl font-bold mb-6"> Create Account </h1>
  <form onSubmit={handleSubmit}>
    <input
      type="text"
      placeholder="Full Name"
      value={name}
      onChange={(e) => setName(e.target.value)}
      required
      className="w-full border p-3 mb-4 rounded"
    />

    <input
      type="email"
      placeholder="Email Address"
      value={email}
      onChange={(e) => setEmail(e.target.value)}
      required
      className="w-full border p-3 mb-4 rounded"
    />

    <input
      type="password"
      placeholder="Password"
      value={password}
      onChange={(e) => setPassword(e.target.value)}
      required
      className="w-full border p-3 mb-4 rounded"
    />

    <input
      type="password"
      placeholder="Confirm Password"
      value={confirmPassword}
      onChange={(e) => setConfirmPassword(e.target.value)}
      required
      className="w-full border p-3 mb-4 rounded"
    />

    <button
      type="submit"
      className="w-full bg-blue-600 text-white p-3 rounded"
    >
      Register
    </button>
  </form>
</div>
); };
export default Register;
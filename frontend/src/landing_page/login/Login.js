import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./Login.css";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:3002";
const DASHBOARD_URL = process.env.REACT_APP_DASHBOARD_URL || "http://localhost:3001";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogin = async (event) => {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);
    try {
      const response = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase(), password }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Unable to log in.");

      localStorage.setItem("zerodhaUser", JSON.stringify(data.user));
      window.location.assign(DASHBOARD_URL);
    } catch (requestError) {
      setError(requestError.message || "Unable to connect to the server.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="login-page">
      <section className="login-card">
        <p className="login-eyebrow">ZERODHA</p>
        <h1>Welcome back</h1>
        <p className="login-subtitle">Log in to access your dashboard.</p>
        <form onSubmit={handleLogin}>
          <label htmlFor="email">Email address</label>
          <input id="email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" required />
          <label htmlFor="password">Password</label>
          <input id="password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="current-password" required />
          {error && <p className="login-error" role="alert">{error}</p>}
          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Logging in..." : "Log in"}
          </button>
        </form>
        <p className="login-signup">
          New to Zerodha? <Link to="/signup">Create an account</Link>
        </p>
      </section>
    </main>
  );
};

export default Login;

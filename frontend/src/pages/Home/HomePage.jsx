import { Link } from "react-router-dom";
import { HivemindLogo } from "../../components/HivemindLogo";
import { useState, useEffect } from "react";
import "./HomePage.css";
import images from "../../images";

export function HomePage() {
  return (
    <div className="home-container">
      <nav className="navbar">
        <HivemindLogo />
        <div className="auth-links">
          <Link to="/login" className="login-btn">
            Log In
          </Link>
        </div>
      </nav>

      <div className="main-section">
        <h1>Welcome to HiveMind!</h1>
        <p>Connect with friends and the world around you</p>
        <div className="cta-buttons">
          <Link to="/signup" className="signup-btn">
            Sign Up
          </Link>
        </div>
      </div>
    </div>
  );
}

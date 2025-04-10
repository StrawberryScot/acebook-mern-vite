import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { HivemindLogo } from "../../components/HivemindLogo";
import "./Navbar.css";
import images from "../../images";
import { useSelector } from "react-redux";
import LogoutButton from "../LogoutButton";

export function Navbar() {
  const navigate = useNavigate();
  const handleViewProfile = () => {
    navigate("/profile");
  };

  const user = useSelector((state) => state.user.user);
  return (
    <nav className="navbar">
      <HivemindLogo />
      <div className="auth-links">
        {user ? (
          <div className="loggedin-navbar-buttons">
            <div className="profile-pic-container">
              <img
                src={user?.profilePicPath || images.default_avatar}
                onClick={handleViewProfile}
                alt="Profile"
                className="profile-pic"
              />
            </div>
            <div>
              <LogoutButton />
            </div>
          </div>
        ) : (
          <Link to="/login" className="button">
            Log In
          </Link>
        )}
      </div>
    </nav>
  );
}

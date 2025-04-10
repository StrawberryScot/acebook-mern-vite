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
  const [isMinimized, setIsMinimized] = useState(false);

  const handleViewProfile = () => {
    navigate("/profile");
  };

  // Add scroll event listener to minimize navbar on scroll
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsMinimized(true);
        // Update body padding when navbar is minimized
        document.body.style.paddingTop = "var(--navbar-minimized-height)";
      } else {
        setIsMinimized(false);
        // Reset body padding when navbar is at full height
        document.body.style.paddingTop = "var(--navbar-height)";
      }
    };

    window.addEventListener("scroll", handleScroll);

    // Clean up event listener on component unmount
    return () => {
      window.removeEventListener("scroll", handleScroll);
      // Reset body padding when component unmounts
      document.body.style.paddingTop = "var(--navbar-height)";
    };
  }, []);

  const user = useSelector((state) => state.user.user);

  const getStatusClass = () => {
    if (!user) return "status-offline";

    switch (user.status) {
      case "online":
        return "status-online";
      case "busy":
        return "status-busy";
      default:
        return "status-offline";
    }
  };

  return (
    <nav className={`navbar ${isMinimized ? "minimized" : ""}`}>
      <div className="hivemind-logo-navbar">
        <HivemindLogo />
      </div>
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
              <div className={`status-indicator ${getStatusClass()}`}></div>
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

import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { HivemindLogo } from "../../components/HivemindLogo";
import "./Navbar.css";
import "../../App.css";
import images from "../../images";
import { useSelector } from "react-redux";

export function Navbar() {
    const user = useSelector((state) => state.user.user);
    return (
        <nav className="navbar">
            <HivemindLogo />
            <div className="auth-links">
                {user ? (
                    <div className="profile-pic-container">
                        <Link to="/profile">
                            <img
                                src={
                                    user?.profilePicPath ||
                                    images.default_avatar
                                }
                                alt="Profile"
                                className="profile-pic"
                            />
                        </Link>
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

import { Link } from "react-router-dom";
import { HivemindLogo } from "../../components/HivemindLogo";
import "./Navbar.css";
import "../../App.css";

export function Navbar() {
    return (
        <nav className="navbar">
            <HivemindLogo />
            <div className="auth-links">
                <Link to="/login" className="button">
                    Log In
                </Link>
            </div>
        </nav>
    );
}

import { Link } from "react-router-dom";
import { HivemindLogo } from "../../components/HivemindLogo";
import "./Navbar.css";
import "../../App.css";

export function Navbar(props) {
    const { isLoggedIn } = props;
    return (
        <nav className="navbar">
            <HivemindLogo />
            <div className="auth-links">
                {isLoggedIn ? (
                    ""
                ) : (
                    <Link to="/login" className="button">
                        Log In
                    </Link>
                )}
            </div>
        </nav>
    );
}

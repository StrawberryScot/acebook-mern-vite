import { Link } from "react-router-dom";
import "./HomePage.css";
import { Navbar } from "../../components/navbar/Navbar";

export function HomePage() {
    // TODO: update this when user is logged in
    const isLoggedIn = false;
    return (
        <div className="home-container">
            <Navbar isLoggedIn={isLoggedIn} />
            <div className="main-section">
                <h1>Welcome to HiveMind!</h1>
                <p>Connect with friends and the world around you</p>
                <div className="cta-buttons">
                    <Link to="/signup" className="button">
                        Sign Up
                    </Link>
                </div>
            </div>
        </div>
    );
}

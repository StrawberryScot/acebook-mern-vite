import { Link } from "react-router-dom";
import "./HomePage.css";
import { Navbar } from "../../components/navbar/Navbar";

export function HomePage() {
    return (
        <div className="home-container">
            <Navbar />
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

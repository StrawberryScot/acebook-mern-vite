import { Link } from "react-router-dom";
import "./HomePage.css";
import images from "../../images";
import HexagonBackground from "../../components/HexagonBackground";
import { HivemindLogo } from "../../components/HivemindLogo";
import HiveIcon from "../../components/HiveIcon";
import ThemeToggle from "../../components/ThemeToggle";

export function HomePage() {
  window.addEventListener(
    "scroll",
    () => {
      document
        .getElementById("home-container")
        .style.setProperty(
          "--scroll",
          window.pageYOffset / (document.body.offsetHeight - window.innerHeight)
        );
      console.log(
        window.pageYOffset / (document.body.offsetHeight - window.innerHeight)
      );
    },
    false
  );

  return (
    <div className="home-container" id="home-container">
      <ThemeToggle />
      <div className="scroll-indicator si-light">
        <p>SCROLL &#8595;</p>
      </div>
      <div className="main-section">
        <HiveIcon />
        <div className="cube-wrap">
          <div className="cube">
            <div className="side back">
                <Link to="/signup" className="signup-btn">
                  Sign Up
                </Link>
            </div>
            <div className="side bottom">
                <Link to="/login" className="login-btn">
                  Log In
                </Link>
            </div>
            <div className="side front"><HivemindLogo /></div>
          </div>
        </div>
      </div>
      <div className="filler"></div>
    </div>
  );
}

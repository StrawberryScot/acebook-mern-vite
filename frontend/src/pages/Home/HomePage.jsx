import { Link } from "react-router-dom";
import { HivemindLogo } from "../../components/HivemindLogo";
import { useState, useEffect } from "react";
import "./HomePage.css";
import images from "../../images";
import HexagonBackground from "../../components/HexagonBackground";
import HiveIcon from "../../components/HiveIcon"

export function HomePage() {

  window.addEventListener('scroll', () => {
    document.getElementById("home-container").style.setProperty('--scroll', window.pageYOffset / (document.body.offsetHeight - window.innerHeight));
    console.log(window.pageYOffset / (document.body.offsetHeight - window.innerHeight));
  }, false);

  return (
    <div className="home-container" id="home-container">
      <div className="background-pattern"></div>
      <HexagonBackground />
      <HiveIcon />
      <div className="scroll-indicator">
        <p>SCROLL &#8595;</p>
      </div>
      <div className="main-section">
        <div class="cube-wrap">
          <div class="cube">
            <div class="side back">
                <Link to="/signup" className="signup-btn">
                  Sign Up
                </Link>
            </div>
            <div class="side bottom">
                <Link to="/login" className="login-btn">
                  Log In
                </Link>
            </div>
            <div class="side front"><HivemindLogo /></div>
          </div>
        </div>
      </div>
      <div className="filler"></div>
    </div>
  );
}

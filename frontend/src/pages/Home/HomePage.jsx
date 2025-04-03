import { Link } from "react-router-dom";
import { HivemindLogo } from "../../components/HivemindLogo";
import { useState, useEffect } from "react";
import "./HomePage.css";
import "./Hexagons.css";
import images from "../../images";

export function HomePage() {
  const hexagons = [];
  let i = 0;
  for(let x = -1; x < 14; x++) {
    for(let y =-1; y < 16; y++) {
      const hexagon = <div className="hexagon-filled" style={{left: x * 9.4 + 'rem', top: y * 5.5 + 'rem'}} key={i}></div>;
      i++;
      const hexagon2 = <div className="hexagon-filled" style={{left: x * 9.4 + 4.7 + 'rem', top: y * 5.5 + 2.75 + 'rem'}} key={i}></div>;
      i++;
      hexagons.push(hexagon);
      hexagons.push(hexagon2);
    };
  };

  window.addEventListener('scroll', () => {
    document.getElementById("home-container").style.setProperty('--scroll', window.pageYOffset / (document.body.offsetHeight - window.innerHeight));
    console.log(window.pageYOffset / (document.body.offsetHeight - window.innerHeight));
  }, false);

  return (
    <div className="home-container" id="home-container">
      <div className="background-pattern"></div>
      <div>{hexagons}</div>
      <div className="hive-icon">
        <div className="hive-bar-small brown"></div>
        <div className="hive-bar-large yellow"></div>
        <div className="hive-bar-large brown"></div>
        <div className="hive-bar-small yellow"></div>
      </div>
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

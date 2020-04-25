import React from "react";
import Navbar from "../general/Navbar";

const HomePage = () => {
  return (
    <React.Fragment>
      <Navbar />
      <div className="main-container">
        <div className="home-container">
          <div className="home">Discard Humanity</div>
          <div>
            <i className="home-quote">
              Lasciate ogne humanitate, o voi ch&apos;intrate
            </i>
            <footer className="home-attribution">
              — Dante Alighieri, <cite>sort of.</cite>
            </footer>
          </div>
        </div>
      </div>
    </React.Fragment>
  );
};
export default HomePage;

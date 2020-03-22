import React from "react";

const HomePage = props => {
  return (
    <React.Fragment>
      <div className="home-container">
        <div className="home">Discard Humanity</div>
        <div>
          <i className="home-quote">
            Lasciate ogne humanitate, o voi ch'intrate
          </i>
          <footer className="home-attribution">
            — Dante Alighieri, <cite>sort of.</cite>
          </footer>
        </div>
      </div>
    </React.Fragment>
  );
};
export default HomePage;

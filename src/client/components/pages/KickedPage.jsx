import React from "react";
import Navbar from "../general/Navbar";

const KickedPage = () =>
  (<React.Fragment>
    <Navbar />
    <div className="main-container">
      <div className="title info-message">You were kicked from the lobby.</div>
    </div>
  </React.Fragment>);

export default KickedPage;

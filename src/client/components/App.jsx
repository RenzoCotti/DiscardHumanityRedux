import React, { Component } from "react";
import { Route, HashRouter } from "react-router-dom";

import io from "socket.io-client";

// import { connect } from "react-redux";
// import {
//   getUsername,
//   getLobbyName,
//   cleanupStore
// } from "../redux/actions";

//styles
import "../../../public/style/lobby.css";
import "../../../public/style/general.css";
import "../../../public/style/input.css";
import "../../../public/style/layout.css";
import "../../../public/style/main.css";
import "../../../public/style/text.css";
import "../../../public/style/cards.css";
import "../../../public/style/deckselection.css";
import "../../../public/style/chat.css";
import "../../../public/style/game.css";
import "../../../public/style/responsive.css";

import "../../../public/images/icon192.png";

//component pages
import Navbar from "./general/Navbar";
import Footbar from "./general/Footbar";

import Home from "./pages/HomePage";
import Lobby from "./pages/LobbyPage";
import Lounge from "./pages/Lounge/LoungePage";
import Game from "./pages/Game/GamePage";

import Login from "./pages/LoginPage";
import Deck from "./pages/DeckCreationPage";
import Rules from "./pages/RulesPage";
import About from "./pages/AboutPage";
import DeckSelection from "./pages/Lounge/DeckSelectionPage";
import LobbyCreationPage from "./pages/LobbyCreationPage";

// function requireAll(r) {
//   r.keys().forEach(r);
// }

class App extends Component {
  constructor(props) {
    super(props);

    let config;
    try {
      // eslint-disable-next-line no-undef
      config = require("../../server/config/config");
    } catch (e) {
      console.log(e);
    }

    // eslint-disable-next-line no-undef
    let socketName = process.env.socket;
    if (config) socketName = config.socket;

    var socket = io(socketName, {
      transports: ["websocket"],
    });

    this.socket = socket;

    // requireAll(require.context("../../../public/images/", true, /\.png$/));

    // sync backend and frontend for login status
    // fetch("/api/admin/status")
    //   .then(req => {
    //     return req.json();
    //   })
    //   .then(res => {
    //     this.props.updateLogin(res.login);
    //   });
  }

  render() {
    if (!this.socket) return <div>Initialising...</div>;
    return (
      <HashRouter>
        <React.Fragment>
          <Navbar />

          <div className="main-container">
            <Route exact path="/" component={Home} />
            <Route
              path="/deck-selection"
              component={() => <DeckSelection socket={this.socket} />}
            />
            <Route
              path="/lobby"
              component={() => <Lobby socket={this.socket} />}
            />
            <Route
              path="/create-lobby"
              component={() => <LobbyCreationPage socket={this.socket} />}
            />
            <Route
              path="/lounge"
              component={() => <Lounge socket={this.socket} />}
            />
            <Route
              path="/game"
              component={() => <Game socket={this.socket} />}
            />

            <Route path="/rules" component={Rules} />
            <Route
              path="/deck-creation"
              component={() => <Deck socket={this.socket} />}
            />
            <Route path="/login" component={Login} />
            <Route path="/about" component={About} />
          </div>

          <Footbar />
        </React.Fragment>
      </HashRouter>
    );
  }
}

export default App;

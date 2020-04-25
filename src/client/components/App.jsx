import React, { Component } from "react";
import { Route, HashRouter } from "react-router-dom";

import io from "socket.io-client";

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
import "../../../public/style/rules.css";
import "../../../public/style/responsive.css";

//import image
import "../../../public/images/icon192.png";

//component pages
import Footbar from "./general/Footbar";

import Home from "./pages/HomePage";
import Lobby from "./pages/Lobby/LobbyPage";
import Lounge from "./pages/Lounge/LoungePage";
import Rules from "./pages/RulesPage";
import About from "./pages/AboutPage";
import LobbyCreationPage from "./pages/Lobby/LobbyCreationPage";
import KickedPage from "./pages/KickedPage";

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
  }

  render() {
    if (!this.socket) return <div>Initialising...</div>;
    return (
      <HashRouter>
        <React.Fragment>

          <Route exact path="/" component={Home} />
          <Route
            path="/lobby"
            component={() => <Lobby socket={this.socket} />}
          />
          <Route
            path="/create-lobby"
            component={() => <LobbyCreationPage socket={this.socket} />}
          />
          <Route path="/rules" component={Rules} />
          <Route path="/about" component={About} />
          <Route path="/kicked" component={KickedPage} />

          <Route
            path="/lounge"
            component={() => <Lounge socket={this.socket} />}
          />

          <Footbar />
        </React.Fragment>
      </HashRouter>
    );
  }
}

export default App;

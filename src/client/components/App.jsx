import React, { Component } from "react";
import { Route, HashRouter } from "react-router-dom";

import io from "socket.io-client";
import config from "../../server/config/config";

import { connect } from "react-redux";
import { updateSocket, getSocket } from "../redux/actions";

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
import Lounge from "./pages/LoungePage";
import Game from "./pages/GamePage";

import Login from "./pages/LoginPage";
import Deck from "./pages/DeckCreationPage";
import Rules from "./pages/RulesPage";
import About from "./pages/AboutPage";
import DeckSelection from "./pages/DeckSelectionPage";

function requireAll(r) {
  r.keys().forEach(r);
}

class App extends Component {
  constructor(props) {
    super(props);

    let socketName = process.env.socket;
    if (config) socketName = config.socket;

    var socket = io(socketName, {
      transports: ["websocket"]
      // rejectUnauthorized: false
    });

    this.props.updateSocket(socket);

    // this.socket.on("lobby-created", info => {
    //   console.log("lobby created!");
    //   this.setState({ joined: info });
    //   // this.socket.emit("lobby-get-list");
    // });

    requireAll(require.context("../../../public/images/", true, /\.png$/));

    // sync backend and frontend for login status
    // fetch("/api/admin/status")
    //   .then(req => {
    //     return req.json();
    //   })
    //   .then(res => {
    //     this.props.updateLogin(res.login);
    //   });
  }

  // componentWillUnmount() {
  //   this.socket.close();
  // }

  render() {
    if (!this.props.socket) return <div>Initialising...</div>;
    return (
      <HashRouter>
        <React.Fragment>
          <Navbar />

          <div className="main-container">
            <Route exact path="/" component={Home} />
            <Route path="/deck-selection" component={DeckSelection} />
            <Route path="/lobby" component={Lobby} />
            <Route path="/lounge" component={Lounge} />
            <Route path="/game" component={Game} />

            <Route path="/rules" component={Rules} />
            <Route path="/deck-creation" component={Deck} />
            <Route path="/login" component={Login} />
            <Route path="/about" component={About} />
          </div>

          <Footbar />
        </React.Fragment>
      </HashRouter>
    );
  }
}

const mapStateToProps = state => ({
  socket: getSocket(state)
});

const mapDispatchToProps = dispatch => ({
  updateSocket: value => dispatch(updateSocket(value))
});

export default connect(mapStateToProps, mapDispatchToProps)(App);

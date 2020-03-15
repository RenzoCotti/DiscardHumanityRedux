import React, { Component } from "react";
import { Route, HashRouter } from "react-router-dom";
import { connect } from "react-redux";
import { updateLogin } from "../redux/actions";

//styles
import "../../../public/style/categories.css";
import "../../../public/style/description.css";
import "../../../public/style/general.css";
import "../../../public/style/input.css";
import "../../../public/style/layout.css";
import "../../../public/style/media.css";
import "../../../public/style/main.css";
import "../../../public/style/table.css";
import "../../../public/style/text.css";
import "../../../public/style/list.css";
import "../../../public/style/responsive.css";

import "../../../public/images/icon192.png";

//component pages
import Navbar from "./general/Navbar";
import Footbar from "./general/Footbar";

import Home from "./pages/HomePage";
import Lobby from "./pages/LobbyPage";
import Login from "./pages/LoginPage";
import Deck from "./pages/DeckPage";
import About from "./pages/AboutPage";

function requireAll(r) {
  r.keys().forEach(r);
}

class App extends Component {
  constructor(props) {
    super(props);

    requireAll(require.context("../../../public/images/", true, /\.png$/));

    //sync backend and frontend for login status
    fetch("/api/admin/status")
      .then(req => {
        return req.json();
      })
      .then(res => {
        this.props.updateLogin(res.login);
      });
  }

  render() {
    return (
      <HashRouter>
        <React.Fragment>
          <Navbar />

          <div className="main-container">
            <Route exact path="/" component={Home} />
            <Route path="/lobby" component={Lobby} />
            <Route path="/deck" component={Deck} />
            <Route path="/login" component={Login} />
            <Route path="/about" component={About} />
          </div>

          <Footbar />
        </React.Fragment>
      </HashRouter>
    );
  }
}

const mapDispatchToProps = dispatch => ({
  updateLogin: value => dispatch(updateLogin(value))
});

export default connect(null, mapDispatchToProps)(App);

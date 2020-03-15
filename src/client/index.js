import React from "react";
import ReactDOM from "react-dom";
import App from "./components/App";
import { Provider } from "react-redux";

import store from "./redux/store";
import "materialize-css"; // It installs the JS asset only
import "materialize-css/dist/css/materialize.min.css";
const root = document.getElementById("root");

if (root !== null) {
  ReactDOM.render(
    <Provider store={store}>
      <App />
    </Provider>,
    root
  );
}

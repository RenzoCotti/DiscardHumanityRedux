import React from "react";
import ReactDOM from "react-dom";
import App from "./components/App";
import { Provider } from "react-redux";
// import { PersistGate } from "redux-persist/integration/react";
// import configureStore from "./redux/store";
import store from "./redux/store";

// const { persistor, store } = configureStore();

// import store from "./redux/store";
import "materialize-css"; // It installs the JS asset only
import "materialize-css/dist/css/materialize.min.css";
const root = document.getElementById("root");

if (root !== null) {
  ReactDOM.render(
    <Provider store={store}>
      {/* <PersistGate loading={null} persistor={persistor}> */}
      <App />
      {/* </PersistGate> */}
    </Provider>,
    root
  );
}

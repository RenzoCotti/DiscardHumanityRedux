import React, { Component } from "react";
// import Card from "../../modules/Card";
// import Chat from "../../modules/Chat";
// import Hand from "./Views/Hand";
// import { Redirect } from "react-router";

// import { connect } from "react-redux";
// import {
//   getLobbyName,
//   getHand,
//   getUsername,
//   getSelectedCards,
//   updateHand,
//   updateBlackCard,
//   getBlackCard,
// } from "../../../redux/actions";
// import CardSelected from "./Views/CardSelected";
// import Button from "../../../modules/input/Button";

class TsarPhase extends Component {
  state = {};
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <React.Fragment>
        <div>Tsar</div>
      </React.Fragment>
    );
  }
}

// const mapStateToProps = (state) => ({
//   lobbyName: getLobbyName(state),
//   username: getUsername(state),
//   hand: getHand(state),
//   selectedCards: getSelectedCards(state),
//   blackCard: getBlackCard(state),
// });

// const mapDispatchToProps = (dispatch) => ({
//   updateHand: (value) => dispatch(updateHand(value)),
//   updateBlackCard: (value) => dispatch(updateBlackCard(value)),
// });

// export default connect(mapStateToProps, mapDispatchToProps)(SelectionPhase);

export default TsarPhase;

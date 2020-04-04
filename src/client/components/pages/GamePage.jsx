import React, { Component } from "react";
import Card from "../modules/Card";
import Chat from "../modules/Chat";
import Hand from "../modules/Hand";
import { Redirect } from "react-router";

import { connect } from "react-redux";
import {
  getLobbyName,
  getHand,
  getSelectedCards,
  updateHand,
  updateBlackCard,
  getBlackCard
} from "../../redux/actions";
import CardSelected from "../modules/CardSelected";

class GamePage extends Component {
  state = {};
  constructor(props) {
    super(props);

    this.props.socket.on("new-black-card", card => {
      this.props.updateBlackCard(card);
    });

    this.props.socket.on("new-hand", hand => {
      this.props.updateHand(hand);
    });

    this.props.socket.on("lobby-not-found", () => {
      this.setState({ home: true });
    });
  }

  componentDidMount() {
    // console.log(this.props.lobbyName);
    this.props.socket.emit("check-lobby", this.props.lobbyName);
    // this.props.socket.emit("get-game-state", this.props.lobbyName);
  }

  // componentDidMount() {
  //   this.socket.on("connect", () => {
  //     //check for data on server
  //     //if data, set uname & lobby, redirect
  //     //redirect?
  //     //join lobby as well
  //     //redirect to lounge
  //   });
  // }

  //this.props ALREADY contains username & lobby name, thanks to store in redux
  //no point in the router then?

  //all we have to do, is verify if user is in lobby.
  //if so, we log him in automatically

  //TODO card selection is broken, gets index+1

  render() {
    if (this.state.home) {
      return <Redirect push to={"/"} />;
    }

    if (!this.props.hand || !this.props.blackCard) {
      return <div>Initialising...</div>;
    }

    let hand = this.props.hand;
    let selectedCards = this.props.selectedCards;

    let first = hand[selectedCards[0]] ? hand[selectedCards[0]].content : [];
    let second = hand[selectedCards[1]] ? hand[selectedCards[1]].content : [];
    let third = hand[selectedCards[2]] ? hand[selectedCards[2]].content : [];

    let blackCard = (
      <Card
        content={this.props.blackCard.content}
        colour="card-black"
        size="card-big"
        fillGaps={[first, second, third]}
      />
    );

    return (
      <React.Fragment>
        <div className="flex-row">
          <div className="flex-column">
            <div className="flex-row">
              {blackCard}
              <CardSelected />
            </div>
            <Hand />
          </div>

          <Chat socket={this.props.socket} />
        </div>
      </React.Fragment>
    );
  }
}

const mapStateToProps = state => ({
  lobbyName: getLobbyName(state),
  hand: getHand(state),
  selectedCards: getSelectedCards(state),
  blackCard: getBlackCard(state)
});

const mapDispatchToProps = dispatch => ({
  updateHand: value => dispatch(updateHand(value)),
  updateBlackCard: value => dispatch(updateBlackCard(value))
});

export default connect(mapStateToProps, mapDispatchToProps)(GamePage);

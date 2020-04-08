import React, { Component } from "react";
import Button from "../../modules/input/Button";
import Card from "../../modules/Card";
import { Redirect } from "react-router";
import { connect } from "react-redux";
import { getLobbyName } from "../../../redux/actions";

class DeckSelectionPage extends Component {
  state = {
    addedDecks: [],
  };

  constructor(props) {
    super(props);

    this.setupSocket();

    this.selectDeck = this.selectDeck.bind(this);
    this.toggleDeck = this.toggleDeck.bind(this);
    this.goToLobby = this.goToLobby.bind(this);
  }

  setupSocket() {
    this.props.socket.on("game-start", () => {});
    this.props.socket.on("game-lounge", () => {
      this.setState({ waiting: true });
    });
  }

  componentDidMount() {
    this.getDecks();
  }

  async getDecks() {
    let req = await fetch("/api/deck/all", {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    });

    let code = req.status;
    if (code === 200) {
      let res = await req.json();
      this.setState({ decks: res });
    } else {
      // this.setState({ error: true });
    }
  }

  goToLobby() {
    let blackCards = [];
    let whiteCards = [];

    if (this.state.addedDecks.length > 0) {
      for (let e of this.state.addedDecks) {
        let deck = this.state.decks[e];
        blackCards = blackCards.concat(deck.blackCards);
        whiteCards = whiteCards.concat(deck.whiteCards);
      }

      this.props.socket.emit("lobby-set-decks", {
        name: this.props.lobbyName,
        blackCards: blackCards,
        whiteCards: whiteCards,
      });
    } else {
      // not enough decks selected.
    }
  }

  selectDeck(index) {
    this.setState({ selected: index });
  }

  toggleDeck(index) {
    let old = this.state.addedDecks;

    let toRemove = old.indexOf(index);

    if (toRemove == -1) old.push(index);
    else old.splice(toRemove, 1);

    this.setState({ addedDecks: old });
  }

  render() {
    if (this.state.waiting) {
      return <Redirect push to="/lounge" />;
    }

    // console.log(this.props);
    // console.log(this.props.location);
    let list = [];
    if (this.state.decks) {
      list = this.state.decks.map((el, index) => {
        return (
          <div
            className={
              this.state.addedDecks.indexOf(index) > -1
                ? "flex-row border-bottom padded deck-title deck-selected"
                : "flex-row border-bottom padded deck-title "
            }
            key={el.name}
            onMouseEnter={() => this.selectDeck(index)}
            onClick={() => this.toggleDeck(index)}
          >
            <div>{el.name}</div>
          </div>
        );
      });
    }

    let deckList;
    if (this.state.selected !== undefined) {
      let deck = this.state.decks[this.state.selected];

      let i = 0;
      let whiteCards = deck.whiteCards.map((card) => (
        <Card
          content={card.content}
          colour="card-white"
          size="card-small"
          key={i++}
        />
      ));

      let blackCards = deck.blackCards.map((card) => (
        <Card
          content={card.content}
          colour="card-black"
          size="card-small"
          key={i++}
        />
      ));

      deckList = whiteCards.concat(blackCards);
    }

    return (
      <React.Fragment>
        <div className="flex-column deck-container">
          <div className="title">{this.props.lobbyName}</div>
          <div className="sub-title padded-bottom">Select decks</div>
          <div className="flex-column deck-list margin-bottom">
            {list.length == 0 ? "Loading decks..." : list}
          </div>
          <Button value="Start game" fn={this.goToLobby} />
        </div>

        <div className="deck-preview">{deckList}</div>
      </React.Fragment>
    );
  }
}

const mapStateToProps = (state) => ({
  lobbyName: getLobbyName(state),
});

// const mapDispatchToProps = dispatch => ({
//   updateLogin: value => dispatch(updateLogin(value))
// });

export default connect(mapStateToProps, null)(DeckSelectionPage);

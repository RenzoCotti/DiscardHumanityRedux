import React, { Component } from "react";
import Button from "../modules/input/Button";
import Card from "../modules/Card";
import { Redirect } from "react-router";

class DeckSelectionPage extends Component {
  state = {
    addedDecks: []
  };

  constructor(props) {
    super(props);
    this.socket = this.props.socket;

    this.setupSocket();

    this.selectDeck = this.selectDeck.bind(this);
    this.toggleDeck = this.toggleDeck.bind(this);
    this.startGame = this.startGame.bind(this);
  }

  setupSocket() {
    this.socket.on("game-start", () => {});
    this.socket.on("game-lounge", () => {
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
        "Content-Type": "application/json"
      }
    });

    let code = req.status;
    if (code === 200) {
      let res = await req.json();
      this.setState({ decks: res });
      // console.log(res);
      // this.setState({ created: true });
    } else {
      // this.setState({ error: true });
    }
  }

  startGame() {
    let blackCards = [];
    let whiteCards = [];

    if (this.state.addedDecks.length > 0) {
      for (let e of this.state.addedDecks) {
        blackCards.concat(e.blackCards);
        whiteCards.concat(e.whiteCards);
      }

      this.socket.emit("set-decks", {
        name: this.props.name,
        blackCards: blackCards,
        whiteCards: whiteCards
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
      return <Redirect push to={"/lounge/"} />;
    }

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

      let whiteCards = deck.whiteCards.map(card => (
        <Card text={card.text} colour="white" small="true" key={card.text} />
      ));

      let blackCards = deck.blackCards.map(card => (
        <Card text={card.text} colour="black" small="true" key={card.text} />
      ));

      deckList = whiteCards.concat(blackCards);
    }

    return (
      <React.Fragment>
        <div className="flex-column deck-container">
          <div className="title">{this.props.name}</div>
          <div className="sub-title padded-bottom"> Select decks</div>
          <div className="flex-column deck-list margin-bottom">{list}</div>
          <Button value="Start game" fn={this.startGame} />
        </div>

        <div className="deck-preview">{deckList}</div>
      </React.Fragment>
    );
  }
}

export default DeckSelectionPage;

import React, { Component } from "react";
import Button from "../modules/input/Button";
import Card from "../modules/Card";

class LoungePage extends Component {
  state = {
    addedDecks: []
  };

  constructor(props) {
    super(props);
    this.socket = this.props.socket;

    this.socket.emit("lobby-get-list");
    this.setupSocket();

    this.selectDeck = this.selectDeck.bind(this);
    this.addDeck = this.addDeck.bind(this);
    this.removeDeck = this.removeDeck.bind(this);
  }

  setupSocket() {
    // this.socket.on("lobby-list", list => {
    //   this.setState({ lobbies: list });
    // });
    // this.socket.on("lobby-joined", () => {
    //   console.log("lobby joined!");
    //   this.socket.emit("lobby-get-list");
    // });
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

  selectDeck(index) {
    this.setState({ selected: index });
  }

  addDeck(index) {
    let old = this.state.addedDecks;

    let found = false;
    for (let el of old) {
      if (el === index) found = true;
    }

    if (!found) old.push(index);

    this.setState({ addedDecks: old });
  }

  removeDeck(index) {
    let old = this.state.addedDecks;

    let toRemove = old.indexOf(index);
    old.splice(toRemove, 1);

    this.setState({ addedDecks: old });
  }

  render() {
    let list = [];
    if (this.state.decks) {
      list = this.state.decks.map((el, index) => {
        return (
          <div className="flex-row border-bottom padded-top" key={el.name}>
            <div className="card-title">
              {el.name} {this.state.addedDecks.indexOf(index) > -1 ? "X" : ""}
            </div>
            <Button
              value="Show"
              fn={() => {
                this.selectDeck(index);
              }}
              short="true"
            />
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
        <div className="flex-row">
          <div className="flex-column">
            <div className="title padded-bottom">Waiting for host</div>
            <div className="flex-column">{list}</div>
          </div>

          <div className="flex-column">
            <div className="deck-list">{deckList}</div>
            <div className="deck-list-buttons">
              {this.state.addedDecks.indexOf(this.state.selected) == -1 ? (
                <Button
                  value="Add"
                  fn={() => {
                    this.addDeck(this.state.selected);
                  }}
                  short="true"
                />
              ) : (
                <Button
                  value="Remove"
                  fn={() => {
                    this.removeDeck(this.state.selected);
                  }}
                  short="true"
                />
              )}
            </div>
          </div>
        </div>
      </React.Fragment>
    );
  }
}

export default LoungePage;

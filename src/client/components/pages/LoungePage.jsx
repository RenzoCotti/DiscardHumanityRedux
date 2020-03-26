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
    this.toggleDeck = this.toggleDeck.bind(this);
    // this.removeDeck = this.removeDeck.bind(this);
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

  toggleDeck(index) {
    let old = this.state.addedDecks;

    let toRemove = old.indexOf(index);

    if (toRemove == -1) old.push(index);
    else old.splice(toRemove, 1);

    this.setState({ addedDecks: old });
  }

  render() {
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
        <div className="flex-row">
          <div className="flex-column">
            <div className="title padded-bottom">Waiting for host</div>
            <div className="flex-column">{list}</div>
          </div>

          <div className="flex-column">
            {/* <div className="deck-list-buttons" style={{ zIndex: 5 }}>
              {this.state.selected !== undefined ? (
                this.state.addedDecks.indexOf(this.state.selected) == -1 ? (
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
                )
              ) : (
                ""
              )}
            </div> */}
            <div className="deck-list" style={{ zIndex: 1 }}>
              {deckList}
            </div>
          </div>
        </div>
      </React.Fragment>
    );
  }
}

export default LoungePage;

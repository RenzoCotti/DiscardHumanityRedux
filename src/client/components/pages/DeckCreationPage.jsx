import React, { Component } from "react";
import Card from "../modules/Card";
import Chat from "../modules/Chat";

class DeckCreationPage extends Component {
  state = {};
  constructor(props) {
    super(props);
    this.selectCard = this.selectCard.bind(this);
    this.socket = this.props.socket;
    this.state.hand = [
      {
        content: [{ text: "The Rev. Dr. Martin Luther King, Jr.", tag: "text" }]
      },
      { content: [{ text: "My machete.", tag: "text" }] },
      { content: [{ text: "Ass to mouth.", tag: "text" }] },
      { content: [{ text: "Drinking responsibly.", tag: "text" }] },
      {
        content: [
          {
            text: "Aya Hirano being gang-banged by her entire band.",
            tag: "text"
          }
        ]
      },
      {
        content: [
          {
            text:
              "Glenn Beck convulsively puking as a brood of Daleks swarm in on him.",
            tag: "text"
          }
        ]
      },
      {
        content: [
          { text: "How hot Orlando Bloom was in ", tag: "text" },
          { text: "Lord of the Rings", tag: "i" },
          { text: ".", tag: "text" }
        ]
      },
      {
        content: [
          {
            text:
              "Clamping down on a gazelle's jugular and tasting its warm life waters.",
            tag: "text"
          }
        ]
      },
      { content: [{ text: "Lord Varys, the Spider.", tag: "text" }] },
      {
        content: [
          { text: "Taking a shit while running at full speed.", tag: "text" }
        ]
      },
      {
        content: [
          {
            text:
              "Pizza in the morning, pizza in the evening, pizza at supper time.",
            tag: "text"
          }
        ]
      },
      { content: [{ text: "Failing the Turing test.", tag: "text" }] }
    ];

    this.state.blackCard = {
      pick: 3,
      content: [
        { text: "Make a haiku.", tag: "text" },
        { text: "", tag: "br" },
        { text: "", tag: "_" },
        { text: ".", tag: "text" },
        { text: "", tag: "br" },
        { text: "", tag: "_" },
        { text: ".", tag: "text" },
        { text: "", tag: "br" },
        { text: "", tag: "_" },
        { text: ".", tag: "text" }
      ] // content: [
      //   {
      //     text: "2 AM in the city that never sleeps. The door swings open and ",
      //     tag: "text"
      //   },
      //   { text: "she", tag: "i" },
      //   {
      //     text:
      //       " walks in, legs up to here. Something in her eyes tells me she's looking for ",
      //     tag: "text"
      //   },
      //   { text: "", tag: "_" },
      //   { text: ".", tag: "text" }
      // ],
      // pick: 1
    };
  }

  selectCard(index) {
    let currentToSelect = this.state.blackCard.pick;

    let first = this.state.firstSelected;
    let second = this.state.secondSelected;
    let third = this.state.thirdSelected;

    //counting to see if can still add
    let selected = 0;
    if (first !== undefined) {
      selected++;
    }
    if (second !== undefined) {
      selected++;
    }
    if (third !== undefined) {
      selected++;
    }

    //selected same card
    if (first === index || second === index || third === index) {
      return;
    }

    if (selected < currentToSelect) {
      if (first === undefined) {
        this.setState({ firstSelected: index });
      } else if (second === undefined) {
        this.setState({ secondSelected: index });
      } else if (third === undefined) {
        this.setState({ thirdSelected: index });
      }
    }
  }

  deselectCard(index) {
    if (this.state.firstSelected !== undefined && index == 1) {
      this.setState({ firstSelected: undefined });
    } else if (this.state.secondSelected !== undefined && index == 2) {
      this.setState({ secondSelected: undefined });
    } else if (this.state.thirdSelected !== undefined && index == 3) {
      this.setState({ thirdSelected: undefined });
    }
  }

  render() {
    let first = this.state.hand[this.state.firstSelected]
      ? this.state.hand[this.state.firstSelected].content
      : [];
    let second = this.state.hand[this.state.secondSelected]
      ? this.state.hand[this.state.secondSelected].content
      : [];
    let third = this.state.hand[this.state.thirdSelected]
      ? this.state.hand[this.state.thirdSelected].content
      : [];

    let hand = this.state.hand.map((card, index) => (
      <Card
        selected={
          index === this.state.firstSelected ||
          index === this.state.secondSelected ||
          index === this.state.thirdSelected
        }
        content={card.content}
        colour="card-white"
        size="card-normal"
        key={index}
        onClick={() => this.selectCard(index)}
      />
    ));
    // let hand2 = hand.slice(5, 10);
    // hand = hand.slice(0, 5);

    let blackCard = (
      <Card
        content={this.state.blackCard.content}
        colour="card-black"
        size="card-big"
        fillGaps={[first, second, third]}
      />
    );

    //cards selected, clicking on those deselects
    let selectCards = [];
    let pick = this.state.blackCard.pick;

    selectCards.push(
      <Card
        content={first}
        colour="card-white"
        size="card-normal"
        key={1}
        onClick={() => this.deselectCard(1)}
      />
    );
    if (pick > 1) {
      selectCards.push(
        <Card
          content={second}
          colour="card-white"
          size="card-normal"
          key={2}
          onClick={() => this.deselectCard(2)}
        />
      );
      if (pick > 2) {
        selectCards.push(
          <Card
            content={third}
            colour="card-white"
            size="card-normal"
            key={3}
            onClick={() => this.deselectCard(3)}
          />
        );
      }
    }

    return (
      <React.Fragment>
        <div className="flex-row">
          <div className="flex-column">
            <div className="flex-row">
              {blackCard}
              {selectCards}
            </div>
            <div className="hand">
              <div className="flex-row">{hand}</div>
              {/* <div className="flex-row hand-bottom">{hand2}</div> */}
            </div>
          </div>

          <Chat
            username="dicc"
            lobbyName="general"
            socket={this.props.socket}
          />
        </div>
      </React.Fragment>
    );
  }
}

export default DeckCreationPage;

import React, { Component } from "react";
import Card from "../modules/Card";

class DeckCreationPage extends Component {
  state = {};
  constructor(props) {
    super(props);
    this.selectCard = this.selectCard.bind(this);
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
      // text: "What brought the orgy to a grinding halt?",
      content: [
        {
          text: "2 AM in the city that never sleeps. The door swings open and ",
          tag: "text"
        },
        { text: "she", tag: "i" },
        {
          text:
            " walks in, legs up to here. Something in her eyes tells me she's looking for ",
          tag: "text"
        },
        { text: "", tag: "_" },
        { text: ".", tag: "text" }
      ],
      pick: 1
    };
  }

  selectCard(index) {
    let currentToSelect = this.state.blackCard.pick;

    let selected = 0;
    if (this.state.firstSelected) {
      selected++;
    }
    if (this.state.secondSelected) {
      selected++;
    }
    if (this.state.thirdSelected) {
      selected++;
    }

    if (selected < currentToSelect) {
      if (!this.state.firstSelected) {
        this.setState({ firstSelected: this.state.hand[index].content });
      } else if (!this.state.secondSelected) {
        this.setState({ secondSelected: this.state.hand[index].content });
      } else if (!this.state.thirdSelected) {
        this.setState({ thirdSelected: this.state.hand[index].content });
      }
    } else {
      //all selected, need to remove before
    }
  }

  render() {
    let hand = this.state.hand.map((card, index) => (
      <Card
        content={card.content}
        colour="white"
        key={index}
        onClick={() => this.selectCard(index)}
      />
    ));
    let hand2 = hand.slice(5, 10);
    hand = hand.slice(0, 5);

    let blackCard = (
      <Card
        content={this.state.blackCard.content}
        colour="black"
        fillGaps={[
          this.state.firstSelected,
          this.state.secondSelected,
          this.state.thirdSelected
        ]}
      />
    );

    return (
      <React.Fragment>
        <div className="flex-column">
          {blackCard}
          <div className="hand">
            <div className="flex-row">{hand}</div>
            <div className="flex-row hand-bottom">{hand2}</div>
          </div>
        </div>
      </React.Fragment>
    );
  }
}

export default DeckCreationPage;

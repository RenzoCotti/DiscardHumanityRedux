import React, { Component } from "react";
import { connect } from "react-redux";
import Card from "../../../modules/Card";

import {
  getHand,
  getBlackCard,
  getSelectedCards,
  updateSelectedCards,
} from "../../../../redux/actions";

class CardSelected extends Component {
  constructor(props) {
    super(props);
    this.deselectCard = this.deselectCard.bind(this);
  }

  deselectCard(index) {
    this.props.updateSelectedCards(index, null);
  }

  render() {
    let divCards = [];

    for (let i = 0; i < this.props.blackCard.pick; i++) {
      let currentSelectedCard = this.props.selectedCards[i];
      console.log(currentSelectedCard);
      console.log(
        currentSelectedCard ? this.props.hand[currentSelectedCard].content : []
      );

      divCards.push(
        <Card
          content={
            currentSelectedCard !== null
              ? this.props.hand[currentSelectedCard].content
              : []
          }
          colour="card-white"
          size="card-normal"
          key={i}
          onClick={() => this.deselectCard(i)}
          remove={true}
        />
      );
    }

    return <div className="flex-row">{divCards}</div>;
  }
}

const mapStateToProps = (state) => ({
  hand: getHand(state),
  blackCard: getBlackCard(state),
  selectedCards: getSelectedCards(state),
});

const mapDispatchToProps = (dispatch) => ({
  updateSelectedCards: (index, value) =>
    dispatch(updateSelectedCards(index, value)),
});

export default connect(mapStateToProps, mapDispatchToProps)(CardSelected);

import React, { Component } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import Card from "../../../modules/Card";

import {
  getHand,
  getBlackCard,
  getSelectedCards,
  updateSelectedCards,
} from "../../../../redux/actions";

class Hand extends Component {
  constructor(props) {
    super(props);
    this.selectCard = this.selectCard.bind(this);
  }

  static get propTypes() {
    return {
      blackCard: PropTypes.object,
      selectedCards: PropTypes.array,
      hand: PropTypes.array,
      updateSelectedCards: PropTypes.func,
    };
  }

  selectCard(index) {
    // console.log("index");
    // console.log(index);

    let maximumPicks = this.props.blackCard.pick;
    let selectedCards = this.props.selectedCards;

    //total cards already selected
    let selected = 0;

    for (let i = 0; i < maximumPicks; i++) {
      let current = selectedCards[i];
      if (current === null) {
        //we found a spot, can we add another?
        if (current === index) {
          // console.log("same index");

          //same as selected card, dont want to add double
          return;
        } else if (selected + 1 <= maximumPicks) {
          // console.log("can add");

          //yes, add and exit
          this.props.updateSelectedCards(i, index);
          return;
        }
      } else {
        // console.log("spot taken");
        //spot is taken, see another
        selected++;
      }
    }
  }

  render() {
    if (!this.props.hand) return <div className="hand"></div>;

    let selectedCards = this.props.selectedCards;

    let hand = this.props.hand.map((card, index) => (
      <Card
        selected={
          index === selectedCards[0] ||
          index === selectedCards[1] ||
          index === selectedCards[2]
        }
        content={card.content}
        colour="card-white"
        size="card-normal"
        key={index}
        position={-index++ * 70 + "px"}
        onClick={() => this.selectCard(index - 1)}
        hover={true}
      />
    ));

    return (
      <div className="hand">
        <div className="flex-row">{hand}</div>
      </div>
    );
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

export default connect(mapStateToProps, mapDispatchToProps)(Hand);

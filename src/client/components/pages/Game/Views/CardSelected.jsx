import React, { Component } from "react";
import { connect } from "react-redux";
import Card from "../../../modules/Card";
import PropTypes from "prop-types";

import {
  getHand,
  getBlackCard,
  getSelectedCards,
  updateSelectedCards,
} from "../../../../redux/actions";
import Input from "../../../modules/input/Input";
import Button from "../../../modules/input/Button";

class CardSelected extends Component {
  constructor(props) {
    super(props);
    this.state = { errors: [], changed: "", jollyCard0: "", jollyCard1: "", jollyCard2: "" };
    this.deselectCard = this.deselectCard.bind(this);
    this.completeJolly = this.completeJolly.bind(this);
    this.handleChange = this.handleChange.bind(this);
  }

  static get propTypes() {
    return {
      blackCard: PropTypes.object,
      selectedCards: PropTypes.array,
      hand: PropTypes.array,
      updateSelectedCards: PropTypes.func,
    };
  }


  componentWillUnmount() {
    this.props.updateSelectedCards(0, null);
    this.props.updateSelectedCards(1, null);
    this.props.updateSelectedCards(2, null);
  }


  completeJolly(card, input) {
    card.content = [{ tag: "text", text: input }];
    card.jolly = false;
    this.setState({ changed: input });
  }


  deselectCard(index) {
    this.props.updateSelectedCards(index, null);
  }

  handleChange(e) {
    let name = e.target.name;
    this.setState({
      [name]: e.target.value,
    });
  }

  render() {
    let divCards = [];

    for (let i = 0; i < this.props.blackCard.pick; i++) {
      let currentSelectedCard = this.props.selectedCards[i];
      let currentCard = this.props.hand[currentSelectedCard];
      let cardContent = currentSelectedCard !== null ? this.props.hand[currentSelectedCard].content : [];
      divCards.push(
        <div className="flex-column">
          <Card
            content={cardContent}
            colour="card-white"
            size="card-normal"
            key={i}
            onClick={() => this.deselectCard(i)}
            remove={true}
          />
          {currentCard && currentCard.jolly ?
            <React.Fragment>
              <Input
                label="Complete the card"
                name={"jollyCard" + i}
                obj={this.state}
                fn={this.handleChange}
                errors={this.state.errors}
              />
              <Button value="Set card" fn={() => this.completeJolly(currentCard, this.state["jollyCard" + i])} />

            </React.Fragment> : ""}


        </div>

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

import React, { Component } from "react";
import { connect } from "react-redux";
import { updatePlant, getPlant } from "../../redux/actions";

class Deck extends Component {
  state = {};
  constructor(props) {
    super(props);
    this.test = this.test.bind(this);
    this.state.decks = [];
  }

  componentDidMount() {
    this.test();
  }

  async test() {
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
      this.state.decks = res;
      // console.log(res);
      // this.setState({ created: true });
    } else {
      // this.setState({ error: true });
    }
  }

  render() {
    console.log(this.state.decks);
    return (
      <React.Fragment>
        <div>Deck creation</div>
        <div>
          {this.state.decks && this.state.decks.length > 0
            ? this.state.decks[0].name
            : "hurr"}
        </div>
      </React.Fragment>
    );
  }
}

const mapStateToProps = state => ({
  plant: getPlant(state)
});

const mapDispatchToProps = dispatch => ({
  updatePlant: plant => dispatch(updatePlant(plant))
});

export default connect(mapStateToProps, mapDispatchToProps)(Deck);

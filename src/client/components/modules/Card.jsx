import React, { Component } from "react";

class Card extends Component {
  state = {};

  constructor(props) {
    super(props);
    this.formatText = this.formatText.bind(this);
  }

  formatText(text, key) {
    if (!text) return "";
    let splitForI = text.split(/<i>(.+)/);
    if (splitForI.length > 1) {
      //there is an <i>

      let splitForIEnd = splitForI[1].split(/<\/i>(.*)/);
      if (splitForIEnd.length == 1) {
        //string is at the end
        splitForIEnd[1] = "";
      }

      return (
        <div key={key}>
          {splitForI[0]}
          <i>{splitForIEnd[0]}</i>
          {this.formatText(splitForIEnd[1], key + 1)}
        </div>
      );
    } else {
      //no <i>
      return <div key={key + 1}>{text}</div>;
    }
  }

  render() {
    let newText = this.props.text.replace(/_/g, "____");
    let len = newText.length;

    let isSmall = this.props.small ? "smallcard " : "card ";
    let isBlack = this.props.colour === "black" ? "blackcard " : "whitecard ";
    let textClass;
    if (len <= 40) {
      textClass = "text-shortest";
    } else if (len <= 60) {
      textClass = "text-short";
    } else if (len <= 80) {
      textClass = "text-medium";
    } else if (len <= 120) {
      textClass = "text-long";
    } else {
      textClass = "text-longest";
    }

    let arr = newText.split("<br>");
    let itemsToAdd = [];
    let i = 0;

    if (arr.length > 1) {
      //theres a <br>
      for (let a of arr) {
        itemsToAdd.push(this.formatText(a, a + i));
        itemsToAdd.push(<br key={i} />);
        i++;
      }
    } else {
      //there isnt a br
      itemsToAdd.push(this.formatText(arr[0], arr[0] + i));
    }

    let res = isSmall + isBlack + textClass;

    return <div className={res}>{itemsToAdd}</div>;
  }
}

export default Card;

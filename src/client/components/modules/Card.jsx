import React, { Component } from "react";
import PropTypes from "prop-types";

class Card extends Component {

  /*
  a Card has the following props:
  - size : card-small, card-normal, card-big  -> card size, duh
  - colour: card-black, card-white -> colour of the card
  - selected: true/false -> background gray
  - remove: true/false -> shows X on hover
  
  */

  constructor(props) {
    super(props);
    this.state = {};
  }

  static get propTypes() {
    return {
      fillGaps: PropTypes.array,
      content: PropTypes.array,
      size: PropTypes.string,
      colour: PropTypes.string,
      selected: PropTypes.bool,
      hover: PropTypes.bool,
      position: PropTypes.string,
      remove: PropTypes.bool,
      onClick: PropTypes.func,
    };
  }


  //removes the end dot.
  removeDot(string) {
    return string.replace(/\.$/, "");
  }

  //
  formatFillGaps(item) {
    let temp = [];
    if (item) {
      for (let i = 0; i < item.length; i++) {
        let a = item[i];
        //last item, remove dot
        if (i == item.length - 1) {
          temp.push({ text: this.removeDot(a.text), tag: a.tag });
        } else {
          temp.push(a);
        }
      }
    }
    return temp;
  }

  //this adds to the list all the fill gaps in the right place, instead of the _
  addCompletions(text) {
    if (text.length === 0) return [];

    let newText = [];
    if (this.props.fillGaps) {
      let first = this.formatFillGaps(this.props.fillGaps[0]);
      let second = this.formatFillGaps(this.props.fillGaps[1]);
      let third = this.formatFillGaps(this.props.fillGaps[2]);

      let completions = 0;

      for (let el of text) {
        if (el.tag === "_") {
          completions++;
          if (completions === 1 && first.length > 0) {
            newText.push({ text: "", tag: "em" });
            for (let a of first) {
              newText.push(a);
            }
            newText.push({ text: "", tag: "/em" });
          } else if (completions === 2 && second.length > 0) {
            newText.push({ text: "", tag: "em" });
            for (let a of second) {
              newText.push(a);
            }
            newText.push({ text: "", tag: "/em" });
          } else if (completions === 3 && third.length > 0) {
            newText.push({ text: "", tag: "em" });
            for (let a of third) {
              newText.push(a);
            }
            newText.push({ text: "", tag: "/em" });
          } else {
            newText.push(el);
          }
        } else {
          newText.push(el);
        }
      }
    } else {
      return text;
    }

    return newText;
  }

  generateHTML(text) {
    if (text.length === 0) return "";

    let list = [];

    for (let i = 0; i < text.length; i++) {
      let s = text[i];

      if (s.tag === "i") {
        list.push(<i key={i}>{s.text}</i>);
      } else if (s.tag === "br") {
        list.push(<br key={i} />);
      } else if (s.tag === "text") {
        list.push(s.text);
      } else if (s.tag === "_") {
        list.push("_______");
      } else if (s.tag === "em") {
        //this card is a fill gap
        let toAdd = [];
        let j = i + 1;
        while (j < text.length) {
          let current = text[j];

          //we look for the end token, so that we can generate the list inbetween
          if (current.tag === "/em") {
            break;
          } else {
            toAdd.push(current);
          }
          j++;
        }

        list.push(<em key={i}>{this.generateHTML(toAdd)}</em>);
        i = j;
      }
    }

    return list;
  }

  generateText(text) {
    if (text.length === 0) return "";
    let string = "";

    for (let s of text) {
      if (s.tag === "i" || s.tag === "text") {
        string += s.text;
      }
    }
    return string;
  }

  render() {
    let textArray = this.addCompletions(this.props.content);
    let text = this.generateText(textArray);
    let len = text.length;

    let size = this.props.size + " ";
    let colour = this.props.colour + " ";
    let selected = this.props.selected
      ? this.props.colour === "card-white"
        ? "white-card-selected "
        : "black-card-selected "
      : " ";

    let hover =
      this.props.hover && !this.props.selected && !this.props.remove
        ? this.props.colour === "card-white"
          ? "hoverable hoverable-white "
          : "hoverable hoverable-black "
        : " ";

    let textClass = "card-text ";

    if (this.props.size !== "card-small") {
      if (len <= 60) {
        textClass += "text-shortest";
      } else if (len <= 80) {
        textClass += "text-short";
      } else if (len <= 100) {
        textClass += "text-medium";
      } else if (len <= 140) {
        textClass += "text-long";
      } else {
        textClass += "text-longest";
      }
    } else {
      textClass += "text-longester";
    }

    let position = this.props.position ? this.props.position + " " : " ";

    let res = "card-default " + size + colour + selected + hover + position;


    return (
      <div className={res} onClick={this.props.onClick}>
        {this.props.remove && textArray.length > 0 ? (
          <div className="giant-x card-normal">
            <div className="giant-x-content">X</div>
          </div>
        ) :
          ""
        }
        <div className={textClass}> {this.generateHTML(textArray)}</div>
      </div>
    );
  }
}

export default Card;

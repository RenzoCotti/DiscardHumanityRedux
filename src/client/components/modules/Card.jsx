import React, { Component } from "react";

class Card extends Component {
  state = {};

  constructor(props) {
    super(props);
  }

  lowercaseFirstLetter(string) {
    return string.charAt(0).toLowerCase() + string.slice(1);
  }

  removeDot(string) {
    console.log(string.replace(/\.$/, ""));
    return string.replace(/\.$/, "");
  }

  formatFillGaps(item) {
    let temp = [];
    if (item) {
      for (let i = 0; i < item.length; i++) {
        let a = item[i];
        console.log(a);

        if (i == 0 && i == item.length - 1) {
          temp.push({
            text: this.removeDot(a.text),
            tag: a.tag
          });
        } else if (i == 0) {
          temp.push({ text: a.text, tag: a.tag });
        } else if (i == item.length - 1) {
          temp.push({ text: this.removeDot(a.text), tag: a.tag });
        } else {
          temp.push(a);
        }
      }
    }
    return temp;
  }

  addCompletions(text) {
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
    let list = [];

    for (let s of text) {
      if (s.tag === "i") {
        list.push(<i>{s.text}</i>);
      } else if (s.tag === "br") {
        list.push(<br />);
      } else if (s.tag === "text") {
        list.push(s.text);
      } else if (s.tag === "_") {
        list.push("_______");
      }
    }

    return list;
  }

  generateText(text) {
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

    let isSmall = this.props.small ? "smallcard " : "bigcard ";
    let isBlack = this.props.colour === "black" ? "blackcard " : "whitecard ";
    let textClass;
    if (len <= 60) {
      textClass = "text-shortest";
    } else if (len <= 80) {
      textClass = "text-short";
    } else if (len <= 100) {
      textClass = "text-medium";
    } else if (len <= 140) {
      textClass = "text-long";
    } else {
      textClass = "text-longest";
    }

    let res = isSmall + isBlack + textClass;

    return (
      <div className={res} onClick={this.props.onClick}>
        {this.generateHTML(textArray)}
      </div>
    );
  }
}

export default Card;

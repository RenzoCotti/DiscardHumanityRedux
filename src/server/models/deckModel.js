const mongoose = require("mongoose");
// const whiteCard = require("./whiteCardModel");
// const blackCard = require("./blackCardModel");

const Deck = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  whiteCards: [{
    content: [{
      text: String,
      tag: String
    }]
  }],

  blackCards: [{
    content: [{
      text: String,
      tag: String
    }],
    pick: {
      type: Number,
      requred: true
    }
  }]
});

Deck.pre("save", function (next) {
  let that = this;

  if (that.name == "") that.name = "UNNAMED DECK";

  next();
});

module.exports = mongoose.model("Deck", Deck);
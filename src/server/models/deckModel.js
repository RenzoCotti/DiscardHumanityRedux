const mongoose = require("mongoose");
// const whiteCard = require("./whiteCardModel");
// const blackCard = require("./blackCardModel");

const Deck = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  whiteCards: [
    {
      text: {
        type: String,
        required: true
      },
      jolly: {
        type: Boolean
      }
    }
  ],

  blackCards: [
    {
      text: {
        type: String,
        required: true
      },
      pick: {
        type: Number,
        requred: true
      }
    }
  ]
});

Deck.pre("save", function(next) {
  let that = this;

  if (that.name == "") that.name = "UNNAMED DECK";

  next();
});

module.exports = mongoose.model("Deck", Deck);

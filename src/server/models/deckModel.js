const mongoose = require("mongoose");
const whiteCard = require("./whiteCardModel");
const blackCard = require("./blackCardModel");

const Deck = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  whiteCards: [whiteCard],
  blackCards: [blackCard]
});

Deck.pre("save", function(next) {
  let that = this;

  if (that.name == "") that.name = "UNNAMED DECK";

  next();
});

module.exports = mongoose.model("Plant", Plant);

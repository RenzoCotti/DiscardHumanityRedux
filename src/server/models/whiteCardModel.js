const mongoose = require("mongoose");

const WhiteCard = new mongoose.Schema({
  text: {
    type: String,
    required: true
  },
  jolly: {
    type: Boolean
  }
});

WhiteCard.pre("save", function(next) {
  let that = this;

  if (!that.jolly) that.jolly = false;
  if (that.text == "") that.text = "MISSING TEXT AYYY";
  next();
});

module.exports = mongoose.model("WhiteCard", WhiteCard);

const mongoose = require("mongoose");

const BlackCard = new mongoose.Schema({
  text: {
    type: String,
    required: true
  },
  pick: {
    type: Number,
    requred: true
  }
});

BlackCard.pre("save", function(next) {
  let that = this;

  if (that.pick < 0) that.pick = 0;
  else if (that.pick > 3) that.pick = 3;
  if (that.text == "") that.text = "MISSING TEXT AYYY";
  next();
});

module.exports = mongoose.model("BlackCard", BlackCard);

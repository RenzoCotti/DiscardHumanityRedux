const mongoose = require("mongoose");
const config = require("../config/config");
const Deck = require("./deckModel");

const CHEWBACCA = require("./seeds/seedBase.js");
const HANSOLO = require("./seeds/seed1to3.js");
const LEIA = require("./seeds/seed4to6.js");
const YODA = require("./seeds/totallynotcensoreddeck.js");
const OBIWAN = require("./seeds/seedAnime.js");
const JARJAR = require("./seeds/seedDoctorwho.js");
const PALPATINE = require("./seeds/seedFantasy.js");
const LUKE = require("./seeds/seedFood.js");
const R2D2 = require("./seeds/seedGoT.js");
const C3PO = require("./seeds/seedInternet.js");
const PADME = require("./seeds/seedNostalgia90.js");
const TRAITOR = require("./seeds/seedScience.js");

let decks = [
  CHEWBACCA,
  HANSOLO,
  LEIA,
  YODA,
  OBIWAN,
  JARJAR,
  PALPATINE,
  LUKE,
  R2D2,
  C3PO,
  PADME,
  TRAITOR
];

mongoose.connect(config.dbURL, {
  auth: {
    user: config.uname,
    password: config.pword
  },
  useNewUrlParser: true
});
Deck.collection.drop();

let arr = [];
for (let deck of decks) {
  let whitecards = [];
  for (let text of deck.whiteCards) {
    whitecards.push({ text: text, jolly: false });
  }
  arr.push({
    whiteCards: whitecards,
    blackCards: deck.blackCards,
    name: deck.name
  });
}

Deck.create(arr)
  .then(decks => {
    console.log(`${decks.length} decks created`);
  })
  .catch(err => {
    console.log(err);
  })
  .finally(() => {
    mongoose.connection.close();
  });

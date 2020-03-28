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
  // auth: {
  //   user: config.uname,
  //   password: config.pword
  // },
  useNewUrlParser: true,
  useUnifiedTopology: true
});
Deck.collection.drop();

function formatText(text) {
  if (!text) return { text: "", tag: "text" };
  let splitForI = text.split(/<i>(.+)/);
  if (splitForI.length > 1) {
    //there is an <i>

    let splitForIEnd = splitForI[1].split(/<\/i>(.*)/);
    if (splitForIEnd.length == 1) {
      //string is at the end
      splitForIEnd[1] = "";
    }

    return [
      { text: splitForI[0], tag: "text" },
      { text: splitForIEnd[0], tag: "i" },
      formatText(splitForIEnd[1])
    ];
  } else {
    //no <i>
    return { text: text, tag: "text" };
  }
}

let arr = [];

for (let deck of decks) {
  let whitecards = [];
  for (let text of deck.whiteCards) {
    let temp = [];

    let s = text.split("<br>");
    //can contain <br> or <i>

    if (s.length > 1) {
      //there's a <br>
      for (let a of s) {
        temp.push(formatText(a));
        temp.push({ text: "", tag: "br" });
      }
    } else {
      //there might be an i
      if (text) {
        temp.push(formatText(text));
      }
    }

    whitecards.push({ content: temp, jolly: false });
  }

  for (let card of deck.blackCards) {
    let temp = [];
    let arr = card.text.split("_");
    //case there's no _, meaning implied at the end.
    if (arr.length == 1) {
      // for (let i = 0; i < card.pick; i++) {
      arr.push("");
      // }
    }

    for (let i = 0; i < arr.length; i++) {
      let s = arr[i];

      if (s) {
        s = s.split("<br>");
        //can contain <br> or <i>

        if (s.length > 1) {
          //there's a <br>

          for (let a of s) {
            if (!a) {
              temp.push({ text: "", tag: "br" });
            } else {
              temp.push(formatText(a));
            }
          }
          temp.push({ text: "", tag: "_" });
        } else {
          s = arr[i];
          //there might be an i
          if (s) {
            temp.push(formatText(s));
          }
          if (i + 1 !== arr.length) {
            temp.push({ text: "", tag: "_" });
          }
        }
      } else {
        temp.push({ text: "", tag: "_" });
      }
    }
    card.content = temp;

    if (card.pick === 3) {
      console.log(card);
    }

    // console.log(temp);
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

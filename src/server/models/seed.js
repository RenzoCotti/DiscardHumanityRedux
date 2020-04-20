"use strict";

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

function formatText(text, arr) {
  if (!text) {
    return {
      text: "",
      tag: "text"
    };
  }
  let splitForI = text.split(/<i>(.+)/);
  if (splitForI.length > 1) {
    //there is an <i>

    let splitForIEnd = splitForI[1].split(/<\/i>(.*)/);
    if (splitForIEnd.length === 1) {
      //string is at the end
      splitForIEnd[1] = "";
    }

    arr.push({
      text: splitForI[0],
      tag: "text"
    });
    arr.push({
      text: splitForIEnd[0],
      tag: "i"
    });
    formatText(splitForIEnd[1], arr);
  } else {
    //no <i>

    arr.push({
      text: text,
      tag: "text"
    });
  }
}

let arr = [];
let toPrint = false;
for (let deck of decks) {
  let whitecards = [];
  for (let text of deck.whiteCards) {
    let temp = [];

    let splitForBr = text.split("<br>");
    //can contain <br> or <i>

    if (splitForBr.length > 1) {
      //there's a <br>
      for (let string of splitForBr) {
        formatText(string, temp);
        temp.push({
          text: "",
          tag: "br"
        });
      }
    } else {
      //there might be an i
      if (text) {
        //text is not null
        formatText(text, temp);
      }
    }

    whitecards.push({
      content: temp
    });

  }

  for (let card of deck.blackCards) {

    let textContent = [];

    let splitForUnderscore = card.text.split("_");

    //case there's no _, meaning implied at the end.
    if (splitForUnderscore.length === 1) {
      toPrint = true;
      splitForUnderscore.push("");
    }

    //we iterate over the resulting strings, looking for <br> or <i>
    for (let i = 0; i < splitForUnderscore.length; i++) {
      let string = splitForUnderscore[i];

      //string is non empty
      if (string) {
        let splitBr = string.split("<br>");
        //can contain <br> or <i>

        if (splitBr.length > 1) {
          //there's a <br>
          //we add all pieces of the string with the <br>
          for (let j = 0; j < splitBr.length; j++) {
            let brString = splitBr[j];

            formatText(brString, textContent);

            //we add a br except at the last element
            if (j + 1 !== splitBr.length) {
              textContent.push({
                text: "",
                tag: "br"
              });
            }
          }
        } else {
          //no br, a single string

          //there might be an i
          if (string) {
            formatText(string, textContent);
          }

          //if the next is not the last elem, add this

        }

        if (i + 1 !== splitForUnderscore.length && splitForUnderscore[i + 1]) {
          textContent.push({
            text: "",
            tag: "_"
          });
        }
      } else {
        //string is empty, indicates that there was a _
        textContent.push({
          text: "",
          tag: "_"
        });
      }
    }
    card.content = textContent;
    // if (card.pick === 2) console.log(card);
  }

  arr.push({
    whiteCards: whitecards,
    blackCards: deck.blackCards,
    name: deck.name
  });
}

mongoose.connect(config.dbURL, {
  auth: {
    user: config.uname,
    password: config.pword
  },
  useNewUrlParser: true,
  useUnifiedTopology: true
});
Deck.collection.drop((err) => {
  if (err) {
    console.log(err);
    mongoose.connection.close();
  } else {
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
  }
});
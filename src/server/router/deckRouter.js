const express = require("express");
const router = express.Router();
const Deck = require("../models/deckModel");

//creates a new deck
router.post("/new", (req, res) => {
  if (!req.session.login) {
    console.log("user tried to create, isn't logged in");
    //not logged in, can't create
    res.status(403);
    return;
  }

  let deck = new Deck(req.body);

  deck.save((err, saved) => {
    if (err) return console.log(err);
    // console.log(saved)
    console.log("Saved " + saved.name);
    return res.status(201).send(saved);
  });
});

//edits an existing deck
// router.put("/edit", (req, res) => {
//   if (!req.session.login) {
//     //not logged in, can't edit
//     console.log("user tried to edit, isn't logged in");
//     res.status(403);
//     return;
//   }

//   let deck = req.body;
//   let id = deck._id;

//   Deck.findOneAndUpdate({ _id: id }, deck, function(err, oldDeck) {
//     if (err) {
//       console.log(err);
//       return res.send("error");
//     }

//     console.log("Edited " + plant.name);
//     return res.send("ok");
//   });
// });

//deletes a specific deck
router.delete("/delete/:id", (req, res) => {
  if (!req.session.login) {
    //user isn't logged in
    console.log("Unauthorized delete");
    res.sendStatus(403);
    return;
  } else if (!req.params.id) {
    console.log("No id provided.");
    res.sendStatus(500);
    return;
  }

  Deck.findByIdAndRemove(req.params.id, (err, deleted) => {
    if (err || !deleted) {
      console.log(err);
      return res.sendStatus(500);
    }
    console.log("Deleted " + deleted.name);
    return res.send("deleted");
  });
});

// Retrieves all the decks in the database
router.get("/all", (req, res) => {
  Deck.find({}, (err, decks) => {
    if (err) return console.log(err);
    console.log("Fetching all decks");
    return res.json(decks);
  });
});

module.exports = router;

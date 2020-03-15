const express = require("express");
const bcrypt = require("bcrypt");
const router = express.Router();

const Admin = require("../models/adminModel");

// router.post("/new", (req, res) => {
//   let admin = new Admin(req.body);
//   console.log("Trying to create a new Admin...");

//   //we already have an admin
//   Admin.find({}, (err, list) => {
//     if (list.length > 1) {
//       console.log("Admin already exists.");
//       return res.sendStatus(403);
//     } else {
//       admin.save(admin, (err, saved) => {
//         console.log("Admin created successfully.");
//         return res.sendStatus(200);
//       });
//     }
//   });
// });

//deletes all instances of admin
// router.delete("/delete", (req, res) => {
//   Admin.deleteMany({}, (err, deleted) => {
//     console.log("Deleted Admin.");
//     return res.sendStatus(200);
//   });
// });

// router.get("/list", (req, res) => {
//   Admin.find({}, (err, list) => {
//     console.log("Retrived list of Admins.");
//     return res.send(list);
//   });
// });

//logins the admin
//to setup with tokens
router.post("/login", (req, res) => {
  console.log("Logging in...");
  if (req.session.login) {
    console.log("User tried logging in as they were already logged in.");
    //already logged in
    res.status(200).send("ok");
    return;
  }

  let uname = req.body.username;
  let pw = req.body.password;

  Admin.find({ username: uname }, (err, list) => {
    if (err) {
      console.log(err);
      return res.sendStatus(500);
    } else if (list.length === 0) {
      console.log("No admins found with that username.");
      return res.status(403).send("nope");
    } else {
      //impossible than there are more than 1 users
      bcrypt.compare(pw, list[0].password, function (err, cmp) {
        if (err) {
          console.log(err);
          return res.sendStatus(500);
        } else if (cmp) {
          console.log("Logged in.");
          //same password
          req.session.login = true;
          // req.session.uname = found[0].username;
          return res.status(200).send("ok");
        } else {
          console.log("Invalid credentials.");
          return res.status(403).send("nope");
        }
      });
    }
  });
});

router.get("/logout", (req, res) => {
  if (!req.session.login) {
    console.log("User tried logging out as they weren't logged in.");
    //already logged in
    res.sendStatus(403);
    return;
  }

  req.session.destroy();
  res.send("logout");
});

router.get("/status", (req, res) => {
  let str = req.session.login ? " logged in." : "logged off.";
  console.log("User is currently " + str);
  return res.send(req.session);
});

module.exports = router;

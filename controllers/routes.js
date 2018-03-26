var express = require("express");

var router = express.Router();

var request = require("request");

var cheerio = require("cheerio");

var mongoose = require("mongoose");

// Set mongoose to leverage built in JavaScript ES6 Promises
mongoose.Promise = Promise;

router.get("/", function (req, res) {
    res.render("index");
});



// Export routes for server.js to use.
module.exports = router;
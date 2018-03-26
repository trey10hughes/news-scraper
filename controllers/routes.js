var express = require("express");

var router = express.Router();

var request = require("request");

var cheerio = require("cheerio");

var mongoose = require("mongoose");

var Article = require("../models/article.js");

// Set mongoose to leverage built in JavaScript ES6 Promises
mongoose.Promise = Promise;

router.get("/", function (req, res) {
    res.render("index");
});


// A GET request to scrape the nytimes website
router.post("/scrape", function (req, res) {

    // First, we grab the body of the html with request
    request("http://www.nytimes.com/", function (error, response, html) {
        // Then, we load that into cheerio and save it to $ for a shorthand selector
        var $ = cheerio.load(html);

        // Make emptry array for temporarily saving and showing scraped Articles.
        var scrapedArticles = {};
        // Now, we grab every h2 within an article tag, and do the following:
        $("article h2").each(function (i, element) {

            // Save an empty result object
            var result = {};

            // Add the text and href of every link, and save them as properties of the result object
            result.title = $(this).children("a").text();

            console.log("title: " + result.title);

            result.link = $(this).children("a").attr("href");

            scrapedArticles[i] = result;

        });

        console.log("Scraped Articles object built nicely: " + scrapedArticles);

        var hbsArticleObject = {
            articles: scrapedArticles
        };

        res.render("index", hbsArticleObject);

    });
});

router.post("/save", function (req, res) {

    console.log("This is the title: " + req.body.title);

    var newArticleObject = {};

    newArticleObject.title = req.body.title;

    newArticleObject.link = req.body.link;

    var entry = new Article(newArticleObject);

    console.log("We can save the article: " + entry);

    // Now, save that entry to the db
    entry.save(function (err, doc) {
        // Log any errors
        if (err) {
            console.log(err);
        }
        // Or log the doc
        else {
            console.log(doc);
        }
    });

    res.redirect("/savedarticles");

});


// Export routes for server.js to use.
module.exports = router;
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
    //SHOULD ALSO RENDER ALL ARTICLES SAVED IN THE DB RIGHT AWAY
});


// A GET request to scrape the nytimes website
router.post("/scrape", function (req, res) {

    //******NEED TO ADD FUNCTIONALITY TO SAVE EVERY SINGLE SCRAPED ARTICLE TO THE DB*******/
    //******WE NEED THIS TO BE ABLE TO ADD COMMENTS TO EACH ARTICLE AND HAVE IT BE VISIBLE TO ALL USERS */

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

// This will get the articles scraped and saved in db and show them in list.
router.get("/savedarticles", function (req, res) {

    // Grab every doc in the Articles array
    Article.find({}, function (error, result) {
        // Log any errors
        if (error) {
            console.log(error);
        }
        // Or send the doc to the browser as a json object
        else {
            var hbsArticleObject = {
                articles: result
            };

            res.render("savedarticles", hbsArticleObject);
        }
    });
});

router.get("/delete/:id", function (req, res) {

    console.log("ID being deleted:" + req.params.id);

    console.log("Article Deleted from saved articles.");

    Article.findOneAndRemove({ "_id": req.params.id }, function (err, offer) {
        if (err) {
            console.log("error while deleting: " + err);
        } else {
            console.log("successfully deleted article");
        }
        res.redirect("/savedarticles");
    });
});

// Export routes for server.js to use.
module.exports = router;
const fs = require('fs');

exports.getHomePage = (req, res) => {
    let query = "SELECT * FROM `news_feed` ORDER BY id ASC"; // query database to get all the news_feed

    // execute query
    db.query(query, (err, result) => {
        if (err) {
            res.redirect('/');
        }

        res.render('index.ejs', {
            title: "View News",
            news_feed: result
        });
    });
};

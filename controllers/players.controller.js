const fs = require('fs');

exports.addPlayerPage = (req, res) => {
    res.render('add-player.ejs', {
        title: "Add News",
        message: ''
    });
};

exports.addPlayer = (req, res) => {
    if (!req.files) {
        return res.status(400).send("No files were uploaded.");
    }

    const date = new Date();
    const formattedDate = date.toISOString().split('T')[0]
    console.log(formattedDate);
    console.log('req.body',req.body);

    let message = '';
    let title = req.body.title;
    let description = req.body.description;
    let url = req.body.url;
    let datestamp = formattedDate;
    let username = req.body.username;
    let uploadedFile = req.files.imageUrl;
    let image_name = uploadedFile.name;
    let fileExtension = uploadedFile.mimetype.split('/')[1];
    image_name = username + '.' + fileExtension;

    let usernameQuery = "SELECT * FROM `news_feed` WHERE user_name = '" + username + "'";

    db.query(usernameQuery, (err, result) => {
        if (err) {
            console.log(err);
            return res.status(500).send(err);
        }

        if (result.length > 0) {
            message = 'Username already exists';
            res.render('add-player.ejs', {
                message,
                title: "Add a new Users"
            });
        } else {
            // check the filetype before uploading it
            if (uploadedFile.mimetype === 'image/png' || uploadedFile.mimetype === 'image/jpeg' || uploadedFile.mimetype === 'image/gif') {
                // upload the file to the /public/assets/img directory
                uploadedFile.mv(`public/assets/img/${image_name}`, (err ) => {
                    if (err) {
                        return res.status(500).send(err);
                    }
                    // send the player's details to the database
                    let query = "INSERT INTO `news_feed` (title, description, url, datestamp, imageUrl, user_name) VALUES ('" +
                    title + "', '" + description + "', '" + url + "', '" + datestamp + "', '" + image_name + "', '" + username + "')";
                    db.query(query, (err, result) => {
                        console.log(query);
                        if (err) {
                            return res.status(500).send(err);
                        }
                        res.redirect('/');
                    });
                });
            } else {
                message = "Invalid File format. Only 'gif', 'jpeg' and 'png' images are allowed.";
                res.render('add-player.ejs', {
                    message,
                    title: "Add a new Users"
                });
            }
        }
    });
}

exports.editPlayerPage = (req, res) => {
    let newsId = req.params.id;
    let query = "SELECT * FROM `news_feed` WHERE id = '" + newsId + "' ";
    db.query(query, (err, result) => {
        if (err) {
            return res.status(500).send(err);
        }
        res.render('edit-player.ejs', {
            title: "Edit  news",
            news: result[0],
            message: ''
        });
    });
}

exports.editPlayer = (req, res) => {
    let newsId = req.params.id;
    let title = req.body.title;
    let description = req.body.description;
    let url = req.body.url;
    let datestamp = req.body.datestamp;

    let query = "UPDATE `news_feed` SET `title` = '" + title + "', `description` = '" + description + "', `url` = '" + url + "', `datestamp` = '" + datestamp + "' WHERE `news_feed`.`id` = '" + newsId + "'";
    db.query(query, (err, result) => {
        if (err) {
            return res.status(500).send(err);
        }
        res.redirect('/');
    });
}

exports.deletePlayer = (req, res) => {
    let newsId = req.params.id;
    let getImageQuery = 'SELECT imageUrl from `news_feed` WHERE id = "' + newsId + '"';
    let deleteUserQuery = 'DELETE FROM news_feed WHERE id = "' + newsId + '"';

    db.query(getImageQuery, (err, result) => {
        if (err) {
            return res.status(500).send(err);
        }

        let imageUrl = result[0].imageUrl;

        fs.unlink(`public/assets/img/${imageUrl}`, (err) => {
            if (err) {
                return res.status(500).send(err);
            }
            db.query(deleteUserQuery, (err, result) => {
                if (err) {
                    return res.status(500).send(err);
                }
                res.redirect('/');
            });
        });
    });
}

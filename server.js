var express = require("express");
var app = express();

const {
    Pool
} = require("pg");

const connection_string = process.env.DATABASE_URL

app.set("port", (process.env.PORT || 5000));

// create web service endpoint for get game request
app.get("/getGame", get_game)

app.listen(app.get("port"), function () {
    console.log("Now listening for connections on port: ", app.get("port"));
});

function get_game(req, res) {
    var game = req.query.boardgame;
    get_game_from_db(game, function (error, result) {
        if (error || result == null || result.length != 1) {
            res.status(500).json({
                success: false,
                data: error
            })
        } else {
            console.log("Back from the get_game_from_db with result:", result);
            res.json(result[0]);
        }
    });
}

function get_game_from_db(game, callback) {

    var sql = "SELECT name, image_url, properties FROM board_game WHERE board_game = $1::int";
    var params = [game];

    pool.query(sql, params, function (err, result) {
        if (err) {
            console.log("An error with the DB occurred");
            console.log(err);
            callback(err, null);
        }

        console.log("Found DB result: " + JSON.stringify(result.rows));

        callback(null, result.rows);
    })
}

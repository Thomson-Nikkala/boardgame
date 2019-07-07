/******************************
Functions (should put in separate file later)
******************************/

function get_game(req, res) {
    var game = req.query.boardgame;
    get_game_from_db(game, function (error, result) {
        if (error || result == null) {
            res.status(500).json({
                success: false,
                data: error
            })
        } else {
            console.log("Back from the get_game_from_db with result:", result);
            const params = result[0];
            res.render('pages/display_game', params);
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

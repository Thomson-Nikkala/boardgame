var express = require('express');
const path = require('path');
var app = express();
const PORT = process.env.PORT || 3000;

// tell it to use the public directory as one where static files live
app.use(express.static(path.join(__dirname, 'public')))

// views is directory for all template files
app.set('views', path.join(__dirname, 'views'))

// using 'ejs' template engine and default extension is 'ejs'
app.set('view engine', 'ejs')
app.engine('html', require('ejs').renderFile);

const {
    Pool
} = require('pg');

const connection_string = process.env.DATABASE_URL;
const pool = new Pool({
    connectionString: connection_string
});

app.set('port', (process.env.PORT || 5000));

// create web service endpoint for get game request
app.get('/getGame', get_game);

app.listen(app.get('port'), function () {
    console.log('Now listening for connections on port: ', app.get('port'));
});

//error handler
app.use(function (err, req, res, next) {
    console.error(err.stack)
    res.status(500).send('Something broke!')
})

// 404 handler
app.use(function (req, res, next) {
    res.status(404).send("Sorry can't find that!")
})

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
            const param = res.json(result[0]);
        }
        res.render('pages/display_game', param);
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

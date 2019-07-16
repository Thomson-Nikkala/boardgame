const express = require('express');
const path = require('path');
const app = express();
var body_parser = require('body-parser');
const bcrypt = require('bcrypt');
const PORT = process.env.PORT || 3000;

// tell it to use the public directory as one where static files live
app.use(express.static(path.join(__dirname, 'public')));

// views is directory for all template files
app.set('views', path.join(__dirname, 'views'));

// using 'ejs' template engine and default extension is 'ejs'
app.set('view engine', 'ejs');
app.engine('html', require('ejs').renderFile);

// use body parser to make it easy to fetch post body
app.use(body_parser.urlencoded({
    extended: false
}));
app.use(body_parser.json());

// Postgres database connection module
const {
    Pool
} = require('pg');

// Establish a new connection to the data source
const connection_string = process.env.DATABASE_URL;
const pool = new Pool({
    connectionString: connection_string
});

app.set('port', (process.env.PORT || 5000));

// home
app.get('/', function (req, res, next) {
    res.sendfile('index.html');
});

// create web service endpoint for game preferences
app.get('/gamePrefs', game_prefs);

// go to page for registration
app.get('/register', go_register);

// go to page for game preferences
app.get('/games', go_preferences);

// get game recommendation web service endpoint
app.post('/games', function (req, res, next) {
    get_game(req.body, res);
});

// process form for registration
app.post('/register', function (req, res, next) {
    register(req.body, res);
});

//  login
app.get('/login', go_login);

// edit profile
app.get('/profile', edit_profile);


app.listen(app.get('port'), function () {
    console.log('Now listening for connections on port: ', app.get('port'));
});

//error handler
app.use(function (err, req, res, next) {
    console.error(err.stack)
    res.status(500).send('Something broke!')
});

// 404 handler
app.use(function (req, res, next) {
    res.status(404).send("Sorry can't find that!")
});

app.get('/usercheck', function (req, res) {
    User.findOne({
        username: req.query.username
    }, function (err, user) {
        if (err) {
            console.log(err);
        }
        var message;
        if (user) {
            console.log(user)
            message = "user exists";
            console.log(message)
        } else {
            message = "user doesn't exist";
            console.log(message)
        }
        res.json({
            message: message
        });
    });
});

/******************************
Functions (should put in separate file later)
******************************/

// Get board game recommendation section---------------------------

// main function to get the best board game for the user based on preferences
function get_game(req, res) {

    var min_players = req.min_players;
    var max_players = req.max_players;
    var min_playtime = req.min_playtime;
    var min_weight = req.min_weight;
    var max_weight = req.max_weight;
    var best_game_score = 0;
    var best_board_game = 1; // default is Azul
    var game = 0;
    var game_min_players = 0;
    var game_max_players = 0;
    var game_min_playtime = 0;
    var game_max_playtime = 0;
    var game_min_weight = 0;
    var game_max_weight = 0;
    var game_score = 0;

    // handler to get all board game information and provide a callback when its done
    get_all_games(function (err, res) {
        // this is the callback function to return the information
        if (err || res == null) {
            response.status(500).json({
                success: false,
                data: error
            });
        } else {
            const board_games = res; // Javascript object
            console.log("board_games is " + board_games);
            // calculate best board game

            const entries = Object.entries(board_games);
            for (const [board_game] of entries) {
                game = entries[board_game];
                console.log(board_game);
                game_score = 0;
                //       game_min_players = board_games[i].min_players;
                //       game_max_players = board_games[i].max_players;
                //      game_min_playtime = board_games[i].min_playtime;
                //      game_min_playtime = board_games[i].max_playtime;
                //     game_min_weight = board_games[i].min_weight;
                //     game_min_weight = board_games[i].max_weight;

                /* adjust game score for number of players
        if (!((game_max_players < min_players) OR(game_min_players > max_players))) {
            game_score = game_score + 20;
        }

        // adjust game score for playtime
        if (!((game_max_playtime < min_playtime) OR(game_min_playtime > max_playtime))) {
            game_score = game_score + 20;
        }

        // adjust game score for game weight
        if ((game_weight > $min_weight) AND(game_weight < max_weight)) {
            game_score = game_score + 20;
        } */

                if (game_score >= best_game_score) {
                    // check if this game has already been recommended to this gamer -- add later
                    best_game_score = game_score;
                    best_board_game = game;
                }
            } // end for loop

            console.log("Best board game is" + best_board_game);

            // retrieve best board game from database based on board_game id
            get_game_from_db(best_board_game, function (err, res) {
                if (err || res == null) {
                    response.status(500).json({
                        success: false,
                        data: error
                    })
                } else {
                    console.log("Back from the get_game_from_db with result:", res);
                    const params = res[0];
                    res.render('pages/display_game', params);
                }
            });

        }
    });

} // end of get_game


// get all of the games from the database   
function get_all_games(callback) {
    const sql = "SELECT * from board_game";

    pool.query(sql, function (err, result) {
        if (err) {
            console.log("An error with the DB occurred in get_all_games.");
            console.log(err);
            callback(err, null);
        } else {
            console.log("Found DB result: " + JSON.stringify(result.rows));
            callback(null, result.rows);
        }
    });
} // end of get_all_games





function get_game_from_db(game, callback) {

    var sql = "SELECT name, image_url, properties FROM board_game WHERE board_game = $1::int";
    var params = [game];

    pool.query(sql, params, function (err, result) {
        if (err) {
            console.log("An error with the DB occurred in get_game_from_db.");
            console.log(err);
            callback(err, null);
        }

        console.log("Found DB result: " + JSON.stringify(result.rows));

        callback(null, result.rows);
    })
}




// Registration section----------------------------------------------

function go_register(req, res) {
    res.render('pages/register.ejs');
}

function register(params, res, callback) {
    var username = params.username;
    var display_name = params.r_display_name;
    var email = params.r_email;
    var password = params.r_password;
    const salt_rounds = 12;
    //  create gamer
    bcrypt.hash(password, salt_rounds, function (err, hash) {
        var sql = "INSERT INTO gamer (username, display_name, email, hashed_password) VALUES ($1, $2, $3, $4);";
        pool.query(sql, [username, display_name, email, hash], function callback(err, result) {
            if (err) {
                console.log("An error with the DB occurred in register.");
                console.log(err);
                callback(err, null);
            }
        })
    });
    // get gamer's gamer id number
    console.log('HERE');
    var gamer_id = function (req, res) {
        get_gamer_id(username, function (err, rows) {
            if (err)
                return next(err);
            console.log(rows);
            res.json(rows);
            res.send(rows[0].gamer);
        });
    };

    console.log('Gamer id', gamer_id);
    default_prefs = '{"min_players":2, "max_players":4, "min_playtime":30, "max_playtime":120, "min_weight":1.5, "max_weight":2.5, "themes":[], "mechanisms":[]}';
    // create default game preferences for gamer
    var sql3 = "INSERT INTO preference(gamer, preferences) VALUES ($1, $2)";
    pool.query(sql3, [gamer_id, default_prefs], function callback(err, result) {
        if (err) {
            console.log("An error with the DB occurred in default prefs.");
            console.log(err);
            callback(err, null);
        }
    })

    res.redirect('/'); // gamePrefs later
}

//  Update gaming preferences section------------------------------

function go_preferences(req, res) {
    res.render('pages/games.ejs');
}

function game_prefs(req, res) {

}

// Login section----------------------------------------------------

function get_gamer_id(username, callback) {
    var sql = "SELECT gamer FROM gamer WHERE username = $1";
    var params = [username];
    pool.query(sql, params, function (err, result) {
        if (err) {
            console.log("An error with the DB occurred in get_gamer_id.");
            console.log(err);
            callback(err, null);
        }
        callback(null, result.rows);
    })
}

function go_login(req, res) {
    res.render('pages/login.ejs');
}

// Edit Profile section----------------------------------------------

function edit_profile(req, res) {
    res.render('pages/edit_profile.ejs');
}

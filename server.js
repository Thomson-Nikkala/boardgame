const express = require('express');
const path = require('path');
const app = express();
var body_parser = require('body-parser');
var cookie_parser = require('cookie-parser');
var session = require('express-session');
const bcrypt = require('bcrypt');
const PORT = process.env.PORT || 3000;

app.use(session({
    secret: 'ssshhhhh',
    saveUninitialized: true,
    resave: true
}));

var sess;

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
    sess = req.session;
    if (!(sess.gamer)) {
        sess.gamer = 1;
    }
    res.sendfile('index.html');
});

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

// connect 
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

// main function to get the best board game
function get_game(req, res) {

    var min_players = req.min_players;
    var max_players = req.max_players;
    var min_playtime = req.min_playtime;
    var max_playtime = req.max_playtime;
    var min_weight = req.min_weight;
    var max_weight = req.max_weight;
    var best_game_score = 0;
    var best_board_game = 1; // default is Azul
    var game = 0;
    var game_min_players = 0;
    var game_max_players = 0;
    var game_min_playtime = 0;
    var game_max_playtime = 0;
    var game_weight = 0;
    var game_score = 0;

    // handler
    get_all_games(function (err, res2) {
        // this is the callback function to return the information
        if (err || res2 == null) {
            response.status(500).json({
                success: false,
                data: error
            });
        } else {
            const board_games = res2; // Javascript object
            // calculate best board game

            const game_keys = Object.keys(board_games);
            const game_entries = Object.entries(board_games);

            for (const [key, game_data] of game_entries) {
                var game_data_values = Object.values(game_data);
                game = game_data_values[0];
                game_score = 0;
                var game_details = Object.values(game_data_values[3]);
                game_min_players = parseInt(game_details[0], 10);
                game_max_players = parseInt(game_details[1], 10);
                game_min_playtime = parseInt(game_details[2], 10);
                game_min_playtime = parseInt(game_details[3], 10);
                game_weight = parseInt(game_details[4], 10);

                // adjust game score for number of players
                if (game_max_players >= min_players) {
                    if (game_min_players <= max_players) {
                        game_score = game_score + 20;
                    }
                }

                // adjust game score for playtime
                if (game_max_playtime >= min_playtime) {
                    if (game_min_playtime <= max_playtime) {
                        game_score = game_score + 20;
                    }
                }

                // adjust game score for game weight
                if (game_weight > min_weight) {
                    if (game_weight < max_weight) {
                        game_score = game_score + 20;
                    }
                }

                if (game_score >= best_game_score) {
                    // check if this game has already been recommended to this gamer -- add later
                    best_game_score = game_score;
                    best_board_game = game;
                }

            } // end for loop

        }

        console.log("Best board game is " + best_board_game);

        // retrieve best board game from database based on board_game id
        get_game_from_db(best_board_game, function (err2, res3) {
            if (res3 == null) {
                response.status(500).json({
                    success: false,
                    data: error
                })
            } else {
                console.log("Back from the get_game_from_db with result:", res3);
                const params = res3[0];
                res.render("pages/display_game", params);
            }
        });

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
            //  console.log("Found DB result: " + JSON.stringify(result.rows));
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

        callback(null, result.rows);
    });
}




// Registration section----------------------------------------------

function go_register(req, res) {
    sess = req.session;
    if (!(sess.gamer)) {
        sess.gamer = 1;
    }
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
    sess = req.session;
    if (!(sess.gamer)) {
        sess.gamer = 1;
    }
    var param = sess.gamer;
    var sql = "SELECT * from gamer WHERE gamer = $1";
    pool.query(sql, param, function (err, result) {
                if (err) {
                    console.log("An error with the DB occurred in go_preferences.");
                    console.log(err);
                } else {
                    console.log(result);


                    res.render('pages/games.ejs');
                }

            }


            // Login section----------------------------------------------------

            function get_gamer_id(username, callback) {
                var sql = "SELECT gamer FROM gamer WHERE username = $1";
                var param = [username];
                pool.query(sql, param, function (err, result) {
                    if (err) {
                        console.log("An error with the DB occurred in get_gamer_id.");
                        console.log(err);
                        callback(err, null);
                    }
                    callback(null, result.rows);
                })
            }

            function go_login(req, res) {
                sess = req.session;
                if (!(sess.gamer)) {
                    sess.gamer = 1;
                }
                res.render('pages/login.ejs');
            }

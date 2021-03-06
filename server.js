const express = require('express');
const path = require('path');
const app = express();
var body_parser = require('body-parser');
var cookie_parser = require('cookie-parser');
var session = require('express-session');
const bcrypt = require('bcrypt');
const PORT = process.env.PORT || 3000;

app.use(session({
    store: new(require('connect-pg-simple')(session))(),
    secret: 'ssshhhhh',
    saveUninitialized: false,
    resave: true,
    cookie: {
        maxAge: 30 * 24 * 60 * 60 * 1000
    } // 30 days
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
    if (!(sess.username)) {
        sess.username = "Guest";
    }
    res.sendfile('index.html');
});

// go to page for registration
app.get('/register', go_register);

// go to page for game preferences
app.get('/games', go_preferences);

// get game recommendation web service endpoint
app.post('/games', function (req, res, next) {
    sess = req.session;
    if (!(sess.username)) {
        sess.username = "Guest";
    }
    get_game(req.body, res);
});

// process form for registration
app.post('/register', function (req, res, next) {
    sess = req.session;
    if (!(sess.username)) {
        sess.username = "Guest";
    }
    register(req.body, res);
});

//  login
app.get('/login', go_login);

app.get('/loginerr', go_login_err);

app.post('/login', function (req, res, next) {
    sess = req.session;
    if (!(sess.username)) {
        sess.username = "Guest";
    }
    login(req.body, res);
});

// logout
app.get('/logout', function (req, res) {
    sess = req.session;
    sess.username = "Guest";
    res.redirect('/');
});

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
    var best_board_game = 0;
    var game = 0;
    var game_min_players = 0;
    var game_max_players = 0;
    var game_min_playtime = 0;
    var game_max_playtime = 0;
    var game_weight = 0;
    var game_score = 0;
    var recommended = 0;
    console.log(min_players);
    // save user preferences 
    var prefs_json = '{"min_players":' + min_players + ',"max_players":' + max_players + ',"min_playtime":' + min_playtime + ', "max_playtime":' + max_playtime + ', "min_weight":' + min_weight + ', "max_weight":' +
        max_weight + ', "themes":[], "mechanisms":[]}';
    console.log(prefs_json);
    var sql = "UPDATE gamer SET preferences = $1 WHERE username = $2";
    pool.query(sql, [prefs_json, sess.username], function callback(err, result) {
        if (err) {
            console.log("An error with the DB occurred in get_game preference save.");
            console.log(err);
            callback(err, null);
        }
    });

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
                console.log('game_score is ', game_score, ' best_game_score is', best_game_score);
                if (game_score > best_game_score) {
                    /* this section does not work
                                        check_recommended(game, function (errC, resC) {
                                            // check if this game has already been recommended to this gamer             
                                            recommended = 0;
                                            console.log('in check_recommended');
                                            get_all_recommendations(function (errR, resR) {
                                                console.log('in get_all_recommendations');
                                                if (errR) {
                                                    console.log('Error in call of get_all_recommendations', errR);
                                                    response.status(500).json({
                                                        success: false,
                                                        data: error
                                                    });
                                                } else {
                                                    const recommendations = resR;
                                                    const recommend_entries = Object.entries(recommendations);
                                                    console.log('game ', game, 'game_score', game_score, 'before recommend_data');
                                                    for (const [key, recommend_data] of recommend_entries) {
                                                        var recommend_values = Object.values(recommend_data);
                                                        recommend_user = recommend_values[0];
                                                        recommend_game = parseInt(recommend_values[1], 10);
                                                        console.log('recommend_user', recommend_user);
                                                        console.log('recommend_game', recommend_game);
                                                        if ((recommend_user == sess.username) && (recommend_game == game)) {
                                                            recommended = 1;
                                                        } else {
                                                            // if not already recommended, update best board game
                                                            best_game_score = game_score;
                                                            best_board_game = game;
                                                            console.log("best_board_game" + best_board_game);
                                                        }
                                                    } // end for loop
                                                }

                                            });
                                        });  */
                    best_game_score = game_score;
                    best_board_game = game;
                    console.log("new best_board_game" + best_board_game);
                } // end if
            } // end for loop

            // retrieve best board game from database based on board_game id
            get_game_from_db(best_board_game, function (err2, res3) {
                if (res3 == null) {
                    response.status(500).json({
                        success: false,
                        data: error
                    })
                } else {
                    console.log("Back from the get_game_from_db with result:", res3);
                    const the_game = res3;
                    /* No longer necessary
                    if (sess.username !== "Guest") {
                            sql = "INSERT INTO recommendation (username, board_game) VALUES ($1, $2);";
                            pool.query(sql, [sess.username, best_board_game], function callback(err, result) {
                                if (err) {
                                    console.log("An error with the DB occurred in add game to recommendation.");
                                    console.log(err);
                                    callback(err, null);
                                }
                            });
                        }
                        */
                    res.render("pages/display_game", the_game);
                }
            });

        }
    });

} // end of get_game

//  check if game has already been recommended
function get_all_recommendations(callback) {
    sql2 = "SELECT * from recommendation";
    recommendation = 0;
    pool.query(sql2, function (err, result) {
        if (err) {
            console.log("An error with the DB occurred in get_all_recommendations.");
            console.log(err);
            callback(err, null);
        } else {
            callback(null, result.rows);
        }
    });
} // end of check_game_recommended


// get all of the games from the database   
function get_all_games(callback) {
    const sql = "SELECT * from board_game";

    pool.query(sql, function (err, result) {
        if (err) {
            console.log("An error with the DB occurred in get_all_games.");
            console.log(err);
            callback(err, null);
        } else {
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

        callback(null, result.rows[0]);
    });
}

function check_recommended(game, callback) {
    // this is kind of a dummy function to ensure proper order of processing
    callback(null, game);
}

// Registration section----------------------------------------------

function go_register(req, res) {
    sess = req.session;
    if (!(sess.username)) {
        sess.username = "Guest";
    }
    res.render('pages/register.ejs');
}

function register(params, res, callback) {
    var username = params.username;
    var display_name = params.r_display_name;
    var email = params.r_email;
    var password = params.r_password;
    const salt_rounds = 12;
    const default_prefs = '{"min_players":2, "max_players":4, "min_playtime":30, "max_playtime":120, "min_weight":1.5, "max_weight":2.5, "themes":[], "mechanisms":[]}';
    //  create gamer
    bcrypt.hash(password, salt_rounds, function (err, hash) {
        var sql = "INSERT INTO gamer (username, display_name, email, hashed_password, preferences) VALUES ($1, $2, $3, $4, $5);";
        pool.query(sql, [username, display_name, email, hash, default_prefs], function callback(err, result) {
            if (err) {
                console.log("An error with the DB occurred in register.");
                console.log(err);
                callback(err, null);
            } else {
                sess.username = username;
                res.redirect('/games');
            }
        });
    });

} // end of register


//  Update gaming preferences section------------------------------

function go_preferences(req, res) {
    sess = req.session;
    if (!(sess.username)) {
        sess.username = "Guest";
    }
    var param = [sess.username];
    console.log("session username is", sess.username);
    var sql = "SELECT preferences from gamer WHERE username = $1;";
    pool.query(sql, param, function (err, result) {
        if (err) {
            console.log("An error with the DB occurred in go_preferences.");
            console.log(err);
        } else {
            console.log(result.rows[0]);
            var min_players = result.rows[0].preferences.min_players;
            var max_players = result.rows[0].preferences.max_players;
            var min_playtime = result.rows[0].preferences.min_playtime;
            var max_playtime = result.rows[0].preferences.max_playtime;
            var min_weight = result.rows[0].preferences.min_weight;
            var max_weight = result.rows[0].preferences.max_weight;

            res.render('pages/games.ejs', {
                min_pl: min_players,
                max_pl: max_players,
                min_ply: min_playtime,
                max_ply: max_playtime,
                min_w: min_weight,
                max_w: max_weight
            });
        }

    });
}

// Login section----------------------------------------------------


function go_login(req, res) {
    sess = req.session;
    if (!(sess.username)) {
        sess.username = "Guest";
    }
    res.render('pages/login.ejs');
}

function go_login_err(req, res) {
    sess = req.session;
    if (!(sess.username)) {
        sess.username = "Guest";
    }
    res.render('pages/login_err.ejs');
}

function login(params, res, callback) {
    const username1 = params.username1;
    const password1 = params.password1;
    var hashed_password = '';
    const salt_rounds = 12;
    var sql = "SELECT * FROM gamer WHERE username=$1";
    pool.query(sql, [username1], function callback(err, result) {
        if (err) {
            console.log("An error with the DB occurred in login()");
            console.log(err);
            callback(err, null);
        } else {
            console.log('result' + result);
            hashed_password = result.rows[0].hashed_password;
            bcrypt.compare(password1, hashed_password, function (err, result) {
                if (result == true) {
                    sess.username = username1;
                    res.redirect('/games');
                } else {
                    res.redirect('/loginerr');
                }
            });
        }
    });
} // end login

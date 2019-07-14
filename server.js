var express = require('express');
const path = require('path');
var app = express();
var body_parser = require('body-parser');
const bcrypt = require('bcrypt');
const PORT = process.env.PORT || 3000;

// tell it to use the public directory as one where static files live
app.use(express.static(path.join(__dirname, 'public')))

// views is directory for all template files
app.set('views', path.join(__dirname, 'views'))

// using 'ejs' template engine and default extension is 'ejs'
app.set('view engine', 'ejs')
app.engine('html', require('ejs').renderFile);

// use body parser to easy fetch post body
app.use(body_parser.urlencoded({
    extended: false
}));
app.use(body_parser.json())

const {
    Pool
} = require('pg');

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

// create web service endpoint for get game request
app.get('/getGame', get_game);

// go to page for registration
app.get('/register', go_register);

// process form for registration
app.post('/register', function (req, res, next) {
    register(req.body, res);
});

//  login


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
            console.log("An error with the DB occurred in get_game_from_db.");
            console.log(err);
            callback(err, null);
        }

        console.log("Found DB result: " + JSON.stringify(result.rows));

        callback(null, result.rows);
    })
}

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
    var gamer_id = 0;
    gamer_id = function (req, res) {
        get_gamer_id(username, function (err, rows) {
            if (err)
                return next(err);
            console.log(rows);
            res.send(rows[0]);
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

function game_prefs(req, res) {

    /*  var game = req.query.boardgame;
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
      }); */

}

function use_prefs_to_get_game(game, callback) {

    /* change all this
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

    res.render('pages/games.ejs'); */
}

function get_gamer_id(username, callback) {
    var sql = "SELECT gamer FROM gamer WHERE username = $1";
    var params = [username];
    var gamer_id =
        pool.query(sql, params, function (err, result) {
            if (err) {
                console.log("An error with the DB occurred in get_gamer_id.");
                console.log(err);
                callback(err, null);
            }
            callback(null, result.rows[0]);
        })
}

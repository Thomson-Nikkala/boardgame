function login() {
    console.log("IN LOGIN");
    var username1 = $("#username").val();
    var password1 = $("#password").val();
    const salt_rounds = 12;
    var new_gamer = 0;
    bcrypt.hash(password1, salt_rounds, function (err, hash) {
        var sql = "SELECT gamer FROM gamer WHERE username=$1 AND hashed_password=$2";
        pool.query(sql, [username1, hash], function callback(err, result) {
            if (err) {
                console.log("An error with the DB occurred in login()");
                console.log(err);
                callback(err, null);
            } else {
                console.log(result);
                new_gamer = result.rows[0];

                console.log(new_gamer);
                if (new_gamer) {
                    sess.gamer = new_gamer;
                }
            }
        })


    });


    var params = {
        username: username,
        password: password
    };


}

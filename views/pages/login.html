<?php
// Start the session
session_start();
// Initialize session variables
if (!isset($_SESSION['gamer'])) {
    $_SESSION['gamer'] = 1;
}
if (!isset($_SESSION['error'])) {
    $_SESSION['error']='';
}
// Get the Heroku database
require_once "db_connect.php";
$db = get_db();
?>

<!DOCTYPE html>
<!--
This is the login page for the Board Game Whisperer
Author: Nikkala Thomson
-->

<html lang="en-us">

<head>
    <?php $ROOT = '../';
    include '../modules/head.php'; ?>
    <title>The Board Game Whisperer</title>
</head>

<body>
    <header>
        <div id="header-band"></div>
        <div id="header-text" class="center-block">
            <h1>The Board Game Whisperer</h1>
        </div>
    </header>
    <div class=center-block>
        <nav>
            <ul>
                <li><a href="index.php">Home</a></li>
                <li id="active-nav"><a href="login.php">Login<img src="../images/yellow-arrow.png" alt=""></a></li>
                <li><a href="register.php">Register</a></li>
                <li><a href="edit_profile.php">Profile</a></li>
                <li><a href="games.php">Get Games</a></li>
            </ul>
        </nav>
        <main>


            <section class="wide-section">
                <br>
                <p> You are logged in as <?php
                    $gamer = $_SESSION['gamer'];
                    $query = "SELECT display_name FROM gamer g WHERE g.gamer = $gamer";
                    $statement = $db->prepare($query);
                    $statement->execute();   
                    $gamer_data = $statement->fetch(PDO::FETCH_ASSOC);
                    echo $gamer_data['display_name'];
                ?>. Log in as a different user below.</p><br>
                <?php echo $_SESSION['error']; 
                $_SESSION['error'] = ''; ?>
                <form action="action_page.php" method="post">
                    <label for="username" class="label_long"><b>Username</b></label>
                    <input type="text" placeholder="Enter Username" name="l_username" required /><br>
                    <label for="password" class="label_long"><b>Password</b></label>
                    <input type="password" placeholder="Enter Password" name="l_password" required /><br>
                    <button type="submit" class="submit_btn">LOGIN</button>
                </form>
            </section>
        </main>
        <footer>
            <?php include("../modules/footer.php"); ?>
        </footer>
    </div>
</body>

</html>

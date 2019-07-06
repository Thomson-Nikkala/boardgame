<?php
// Start the session
session_start();
// Initialize session variables
if (!isset($_SESSION['gamer'])){
$_SESSION['gamer'] = 1;}
// Get the Heroku database
require_once "db_connect.php";
$db = get_db();
// Force display of all errors (for debugging)
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);
?>

<!DOCTYPE html>
<!--
This is the Games page for The Board Game Whisperer
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
            <h1>Get a Game Recommendation</h1>
        </div>
    </header>
    <div class=center-block>
        <nav>
            <ul>
                <li><a href="index.php">Home</a></li>
                <li><a href="login.php">Login</a></li>
                <li><a href="register.php">Register</a></li>
                <li><a href="edit_profile.php">Profile</a></li>
                <li id="active-nav"><a href="games.php">Games<img src="../images/yellow-arrow.png" alt=""></a></li>
            </ul>
        </nav>
        <main>
            <section class="wide-section">
                <br>
                <p> Welcome, <?php
                    $gamer = $_SESSION['gamer'];
                    $query = "SELECT display_name FROM gamer g WHERE g.gamer = $gamer";
                    $statement = $db->prepare($query);
                    $statement->execute();   
                    $gamer_data = $statement->fetch(PDO::FETCH_ASSOC);
                    $display_name_safe = htmlspecialchars($gamer_data['display_name']);
                    echo $display_name_safe;
                ?>!</p><br>

                <?php 
                // Save and update gamer preferences
                 $query = "SELECT preferences FROM preference p WHERE p.gamer = $gamer";
                 $statement = $db->prepare($query);
                 $statement->execute(); 
                 $player_prefs = $statement->fetch(PDO::FETCH_ASSOC);
                 $player_preferences = $player_prefs['preferences'];   // this ends up as a string
                 $player_prefs_json = json_decode($player_preferences);  // coerce to json object
                 $player_themes = $player_prefs_json->themes;
                 $player_mechanisms = $player_prefs_json->mechanisms;
                ?>
                <form action="action_page.php" method="post">

                    <?php 
                      $min_players = array('1', '2', '3', '4', '5', '6', '7', '8', '9', '10');
                      $max_players = array('1', '2', '3', '4', '5', '6', '7', '8', '9', '10');
                      $min_playtimes = array('1', '15', '30', '45', '60', '90', '120', '150', '180', '210', '240', '300');
                      $max_playtimes = array('15', '30', '45', '60', '90', '120', '150', '180', '210', '240', '300', '360');
                      $min_weights = array('1.0', '1.5', '2.0', '2.5', '3.0', '3.5', '4.0', '4.5');
                      $max_weights = array('1.5', '2.0', '2.5', '3.0', '3.5', '4.0', '4.5', '5.0');
                      $themes = array('Abstract', 'Old_West', 'Spies', 'Superhero', 'Martial_Arts', 'Pirates', 'Racing', 'Fantasy', 'Train', 'Sports', 'Economic', 'Detective', 'Aviation', 'Science_Fiction', 'Empire_Building', 'Medieval', 'Movie', 'Book', 'Television', 'Geography', 'Animals', 'Horror', 'Caveman', 'Archaeology', 'Mobster', 'Art', 'Renaissance', 'Food', 'Humor', 'Adventure', 'History', 'Ancient', 'Civilization', 'Medical', 'Prehistoric', 'Mythology', 'Nautical', 'Arabian', 'Farming', 'Transportation', 'Politics');
                      $mechanisms = array('Worker_Placement', 'Area_Control', 'Tile_Placement', 'Cooperative', 'Deck_Building', 'Drafting', 'Engine_Building', 'Take_That', 'Trick_Taking', 'Puzzle', 'Legacy', 'Set_Collection', 'Pattern_Building', 'Memory', 'Partnerships', 'Press_Your_Luck', 'Simultaneous_Action_Selection', 'Storytelling', 'Voting', 'Line_Drawing', 'Hidden_Traitor', 'Dexterity', 'Hand_Management', 'Dice_Rolling','Trading', 'Auction', 'Variable_Phase_Order', 'Variable_Player_Powers', 'Route_Building', 'Point_to_Point_Movement', 'Pickup_and_Deliver', 'Action_Programming');
                    ?>

                    <button type="submit" name="submit" class="submit_btn">Get a Game Recommendation Based on the Preferences Below</button><br>
                    <input id="go" name="go" type="hidden" value="Preferences Submitted"><br>
                    <p>Minimum number of players: <select name="min_players">
                            <?php foreach( $min_players as $min_player ): ?>
                            <option value="<?php echo $min_player ?>" <?php if( $min_player == ($player_prefs_json->min_players) ): ?> selected="selected" <?php endif; ?>><?php echo $min_player ?></option>
                            <?php endforeach; ?>
                        </select></p>

                    <p>Maximum number of players: <select name="max_players">
                            <?php foreach( $max_players as $max_player ): ?>
                            <option value="<?php echo $max_player ?>" <?php if( $max_player == ($player_prefs_json->max_players) ): ?> selected="selected" <?php endif; ?>><?php echo $max_player ?></option>
                            <?php endforeach; ?>
                        </select></p>

                    <p>Minimum playing time (in minutes): <select name="min_playtime">
                            <?php foreach( $min_playtimes as $min_playtime ): ?>
                            <option value="<?php echo $min_playtime ?>" <?php if( $min_playtime == ($player_prefs_json->min_playtime) ): ?> selected="selected" <?php endif; ?>><?php echo $min_playtime ?></option>
                            <?php endforeach; ?>
                        </select></p>

                    <p>Maximum playing time (in minutes): <select name="max_playtime">
                            <?php foreach( $max_playtimes as $max_playtime ): ?>
                            <option value="<?php echo $max_playtime ?>" <?php if( $max_playtime == ($player_prefs_json->max_playtime) ): ?> selected="selected" <?php endif; ?>><?php echo $max_playtime ?></option>
                            <?php endforeach; ?>
                        </select></p>

                    <p>Minimum game weight (complexity) on a 1.0 to 5.0 scale: <select name="min_weight">
                            <?php foreach( $min_weights as $min_weight ): ?>
                            <option value="<?php echo $min_weight ?>" <?php if( $min_weight == ($player_prefs_json->min_weight) ): ?> selected="selected" <?php endif; ?>><?php echo $min_weight ?></option>
                            <?php endforeach; ?>
                        </select></p>

                    <p>Maximum game weight (complexity) on a 1.0 to 5.0 scale: <select name="max_weight">
                            <?php foreach( $max_weights as $max_weight ): ?>
                            <option value="<?php echo $max_weight ?>" <?php if( $max_weight == ($player_prefs_json->max_weight) ): ?> selected="selected" <?php endif; ?>><?php echo $max_weight ?></option>
                            <?php endforeach; ?>
                        </select></p>
                    <br>

                    <p> Preferred themes:</p>
                    <?php foreach( $themes as $theme ): ?>
                    <input type="checkbox" name="themes[]" value=<?php echo $theme ?> <?php if( in_array($theme, $player_themes) ): ?> checked="checked" <?php endif; ?>><?php echo $theme ?><br>
                    <?php endforeach; ?>
                    <br>

                    <p> Preferred gameplay mechanisms:</p>
                    <?php foreach( $mechanisms as $mechanism ): ?>
                    <input type="checkbox" name="mechanisms[]" value=<?php echo $mechanism ?> <?php if( in_array($mechanism, $player_mechanisms) ): ?> checked="checked" <?php endif; ?>><?php echo $mechanism ?><br>
                    <?php endforeach; ?>
                    <br>
                </form>

            </section>
        </main>
        <footer>
            <?php include("../modules/footer.php"); ?>
        </footer>
    </div>
</body>

</html>

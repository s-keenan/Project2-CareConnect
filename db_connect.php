<?php
// db_connect.php
// Shared database connection for CareConnect
// Adjust these if your XAMPP MySQL uses different credentials

$db_host = "localhost";
$db_user = "root";
$db_pass = "";          // default XAMPP password is empty
$db_name = "careconnect";

$conn = new mysqli($db_host, $db_user, $db_pass, $db_name);

if ($conn->connect_error) {
    die("Database connection failed: " . $conn->connect_error);
}
?>

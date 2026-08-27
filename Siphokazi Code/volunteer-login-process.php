<?php
// volunteer-login-process.php
session_start();
require "db_connect.php";

$email    = trim($_POST['email'] ?? '');
$password = $_POST['password'] ?? '';

if ($email === '' || $password === '') {
    header("Location: volunteer_login.php?error=" . urlencode("Please enter your email and password."));
    exit;
}

$stmt = $conn->prepare("SELECT userID, password_hash, role, account_status FROM app_user WHERE email = ?");
$stmt->bind_param("s", $email);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 0) {
    $stmt->close();
    header("Location: volunteer_login.php?error=" . urlencode("Invalid email or password."));
    exit;
}

$user = $result->fetch_assoc();
$stmt->close();

// Confirm this account was registered as a volunteer, not an applicant
if ($user['role'] !== 'Volunteer') {
    header("Location: volunteer_login.php?error=" . urlencode("This account is not registered as a volunteer."));
    exit;
}

if (!password_verify($password, $user['password_hash'])) {
    header("Location: volunteer_login.php?error=" . urlencode("Invalid email or password."));
    exit;
}

// Block accounts that haven't been approved yet
if ($user['account_status'] !== 'Approved') {
    header("Location: volunteer_login.php?error=" . urlencode("Your account is still pending approval."));
    exit;
}

// --- Success: start session ---
$_SESSION['userID'] = $user['userID'];
$_SESSION['role']   = $user['role'];
$_SESSION['email']  = $email;

// Update last_login
$stmt = $conn->prepare("UPDATE app_user SET last_login = NOW() WHERE userID = ?");
$stmt->bind_param("i", $user['userID']);
$stmt->execute();
$stmt->close();
$conn->close();

// Redirect to the volunteer dashboard (create this page separately)
header("Location: volunteer_dashboard.php");
exit;
?>

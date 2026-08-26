<?php
// volunteer-register-process.php
require "db_connect.php";

// --- Collect and sanitize form input ---
$full_name       = trim($_POST['full_name'] ?? '');
$id_number       = trim($_POST['id_number'] ?? '');
$email           = trim($_POST['email'] ?? '');
$phone           = trim($_POST['phone'] ?? '');
$address         = trim($_POST['address'] ?? ''); // not stored - no address column on volunteer table
$availability    = trim($_POST['availability'] ?? '');
$preferred_time  = trim($_POST['preferred_time'] ?? '');
$password        = $_POST['password'] ?? '';
$confirm_password = $_POST['confirm_password'] ?? '';

// --- Basic validation ---
if ($full_name === '' || $id_number === '' || $email === '' || $phone === '' ||
    $address === '' || $availability === '' || $preferred_time === '' || $password === '') {
    header("Location: volunteer_register.php?error=" . urlencode("Please fill in all required fields."));
    exit;
}

if ($password !== $confirm_password) {
    header("Location: volunteer_register.php?error=" . urlencode("Passwords do not match."));
    exit;
}

if (strlen($password) < 8) {
    header("Location: volunteer_register.php?error=" . urlencode("Password must be at least 8 characters."));
    exit;
}

// Combine the two dropdowns into the single availability_schedule column
$availability_schedule = $availability . " - " . $preferred_time;

// --- Check if email already exists ---
$stmt = $conn->prepare("SELECT userID FROM app_user WHERE email = ?");
$stmt->bind_param("s", $email);
$stmt->execute();
$stmt->store_result();

if ($stmt->num_rows > 0) {
    $stmt->close();
    header("Location: volunteer_register.php?error=" . urlencode("An account with that email already exists."));
    exit;
}
$stmt->close();

// --- Hash the password ---
$password_hash = password_hash($password, PASSWORD_DEFAULT);

// --- Insert into app_user first ---
// NOTE: confirm the 'role' and 'account_status' enum values match your table
// (Structure tab in phpMyAdmin for app_user). Adjust the strings below if needed.
$role = "Volunteer";
$account_status = "Pending";

$stmt = $conn->prepare("INSERT INTO app_user (email, password_hash, role, account_status, created_at) VALUES (?, ?, ?, ?, NOW())");
$stmt->bind_param("ssss", $email, $password_hash, $role, $account_status);

if (!$stmt->execute()) {
    $stmt->close();
    header("Location: volunteer_register.php?error=" . urlencode("Could not create account. Please try again."));
    exit;
}

$userID = $stmt->insert_id;
$stmt->close();

// --- Insert into volunteer, linked by userID ---
$tasks_completed_count = 0;

$stmt = $conn->prepare("INSERT INTO volunteer (userID, full_name, id_number, contact_number, availability_schedule, tasks_completed_count) VALUES (?, ?, ?, ?, ?, ?)");
$stmt->bind_param(
    "issssi",
    $userID,
    $full_name,
    $id_number,
    $phone,
    $availability_schedule,
    $tasks_completed_count
);

if (!$stmt->execute()) {
    $stmt->close();
    // Roll back the app_user row if the volunteer insert fails, to avoid orphaned accounts
    $conn->query("DELETE FROM app_user WHERE userID = " . intval($userID));
    header("Location: volunteer_register.php?error=" . urlencode("Could not save volunteer details. Please try again."));
    exit;
}

$stmt->close();
$conn->close();

// --- Success: send them to login ---
header("Location: volunteer_login.php?registered=1");
exit;
?>

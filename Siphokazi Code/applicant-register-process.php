<?php
// applicant-register-process.php
require "db_connect.php";

// --- Collect and sanitize form input ---
$full_name       = trim($_POST['full_name'] ?? '');
$id_number       = trim($_POST['id_number'] ?? '');
$email           = trim($_POST['email'] ?? '');
$phone           = trim($_POST['phone'] ?? '');
$address         = trim($_POST['address'] ?? '');
$medical_details = trim($_POST['medical_details'] ?? '');
$kin_name        = trim($_POST['next_of_kin'] ?? '');
$kin_relationship = trim($_POST['kin_relationship'] ?? '');
$kin_phone       = trim($_POST['kin_phone'] ?? '');
$password        = $_POST['password'] ?? '';
$confirm_password = $_POST['confirm_password'] ?? '';

// --- Basic validation ---
if ($full_name === '' || $id_number === '' || $email === '' || $phone === '' ||
    $address === '' || $kin_name === '' || $kin_relationship === '' ||
    $kin_phone === '' || $password === '') {
    header("Location: applicant_register.php?error=" . urlencode("Please fill in all required fields."));
    exit;
}

if ($password !== $confirm_password) {
    header("Location: applicant_register.php?error=" . urlencode("Passwords do not match."));
    exit;
}

if (strlen($password) < 8) {
    header("Location: applicant_register.php?error=" . urlencode("Password must be at least 8 characters."));
    exit;
}

// --- Check if email already exists ---
$stmt = $conn->prepare("SELECT userID FROM app_user WHERE email = ?");
$stmt->bind_param("s", $email);
$stmt->execute();
$stmt->store_result();

if ($stmt->num_rows > 0) {
    $stmt->close();
    header("Location: applicant_register.php?error=" . urlencode("An account with that email already exists."));
    exit;
}
$stmt->close();

// --- Hash the password ---
$password_hash = password_hash($password, PASSWORD_DEFAULT);

// --- Insert into app_user first ---
// NOTE: confirm the 'role' and 'account_status' enum values match your table
// (Structure tab in phpMyAdmin for app_user). Adjust the strings below if needed.
$role = "Applicant";
$account_status = "Pending";

$stmt = $conn->prepare("INSERT INTO app_user (email, password_hash, role, account_status, created_at) VALUES (?, ?, ?, ?, NOW())");
$stmt->bind_param("ssss", $email, $password_hash, $role, $account_status);

if (!$stmt->execute()) {
    $stmt->close();
    header("Location: applicant_register.php?error=" . urlencode("Could not create account. Please try again."));
    exit;
}

$userID = $stmt->insert_id;
$stmt->close();

// --- Insert into applicant, linked by userID ---
$stmt = $conn->prepare("INSERT INTO applicant (userID, full_name, id_number, contact_number, residential_address, medical_details, next_of_kin_name, next_of_kin_contact) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
$stmt->bind_param(
    "issssss",
    $userID,
    $full_name,
    $id_number,
    $phone,
    $address,
    $medical_details,
    $kin_name,
    $kin_phone
);

if (!$stmt->execute()) {
    $stmt->close();
    // Roll back the app_user row if the applicant insert fails, to avoid orphaned accounts
    $conn->query("DELETE FROM app_user WHERE userID = " . intval($userID));
    header("Location: applicant_register.php?error=" . urlencode("Could not save applicant details. Please try again."));
    exit;
}

$stmt->close();
$conn->close();

// --- Success: send them to login ---
header("Location: applicant_login.php?registered=1");
exit;
?>

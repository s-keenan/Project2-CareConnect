<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>CareConnect - Create Account</title>
    <link rel="stylesheet" href="css/style.css">
</head>
<body>

<header>
    <div class="logo">CareConnect</div>

    <nav>
        <a href="index.php">Home</a>
        <a href="index.php#about">About</a>
        <a href="index.php#services">Services</a>
        <a href="index.php#contact">Contact</a>
        <a href="login.php">Login</a>
    </nav>
</header>

<main class="login-page">

    <div class="login-card account-type-card">

        <h1>Create Your Account</h1>

        <p class="login-intro">
            Choose your account type to get started.
        </p>

        <div class="account-options">

            <a href="applicant_register.php" class="account-option">
                <div class="account-icon">👤</div>
                <h2>Applicant</h2>
                <p>
                    I need assistance and want to submit requests.
                </p>
            </a>

            <a href="volunteer_register.php" class="account-option">
                <div class="account-icon">🤝</div>
                <h2>Volunteer</h2>
                <p>
                    I want to volunteer and help my community.
                </p>
            </a>

        </div>

        <p class="register-text">
            Already have an account?
            <a href="login.php">Login here</a>
        </p>

    </div>

</main>

<footer>
    <p>&copy; 2026 CareConnect. All rights reserved.</p>
</footer>

</body>
</html>

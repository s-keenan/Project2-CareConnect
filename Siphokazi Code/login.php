<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>CareConnect - Login</title>
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
    </nav>
</header>

<main class="login-page">

    <div class="login-card account-type-card">

        <h1>Welcome Back</h1>

        <p class="login-intro">
            Choose your account type to continue.
        </p>

        <div class="account-options">

            <a href="applicant_login.php" class="account-option">
                <div class="account-icon">👤</div>
                <h2>Applicant</h2>
                <p>
                    I am an applicant looking for assistance.
                </p>
            </a>

            <a href="volunteer_login.php" class="account-option">
                <div class="account-icon">🤝</div>
                <h2>Volunteer</h2>
                <p>
                    I am a volunteer ready to help.
                </p>
            </a>

        </div>

        <p class="register-text">
            Don't have an account?
            <a href="register.php">Create an account</a>
        </p>

    </div>

</main>

<footer>
    <p>&copy; 2026 CareConnect. All rights reserved.</p>
</footer>

</body>
</html>
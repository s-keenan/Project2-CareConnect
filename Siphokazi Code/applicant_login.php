<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>CareConnect - Applicant Login</title>
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
        <a href="register.php">Create Account</a>
    </nav>
</header>

<main class="login-page">

    <div class="login-card">

        <h1>Applicant Login</h1>

        <p class="login-intro">
            Login to manage your assistance requests.
        </p>

        <?php if (isset($_GET['registered'])): ?>
            <p style="color: #17796A; text-align: center; margin-bottom: 15px;">
                Account created successfully. Please log in.
            </p>
        <?php endif; ?>

        <?php if (isset($_GET['error'])): ?>
            <p style="color: #b00020; text-align: center; margin-bottom: 15px;">
                <?php echo htmlspecialchars($_GET['error']); ?>
            </p>
        <?php endif; ?>

        <form action="applicant-login-process.php" method="post">

            <div class="form-group">
                <label for="email">Email Address</label>
                <input
                    type="email"
                    id="email"
                    name="email"
                    placeholder="Enter your email address"
                    required
                >
            </div>

            <div class="form-group">
                <label for="password">Password</label>
                <input
                    type="password"
                    id="password"
                    name="password"
                    placeholder="Enter your password"
                    required
                >
            </div>

            <button type="submit" class="login-button">
                Login
            </button>

        </form>

        <p class="register-text">
            <a href="#">Forgot your password?</a>
        </p>

        <p class="register-text">
            Don't have an account?
            <a href="applicant_register.php">Create an account</a>
        </p>

    </div>

</main>

<footer>
    <p>&copy; 2026 CareConnect. All rights reserved.</p>
</footer>

</body>
</html>
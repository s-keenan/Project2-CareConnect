<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>CareConnect - Volunteer Registration</title>
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

    <div class="login-card registration-card">

        <h1>Volunteer Registration</h1>

        <p class="login-intro">
            Create your CareConnect account and start helping your community.
        </p>

        <?php if (isset($_GET['error'])): ?>
            <p style="color: #b00020; text-align: center; margin-bottom: 15px;">
                <?php echo htmlspecialchars($_GET['error']); ?>
            </p>
        <?php endif; ?>

        <form action="volunteer-register-process.php" method="post">

            <h2 class="form-section-title">Personal Information</h2>

            <div class="form-group">
                <label for="full_name">Full Name</label>
                <input
                    type="text"
                    id="full_name"
                    name="full_name"
                    placeholder="Enter your full name"
                    required
                >
            </div>

            <div class="form-group">
                <label for="id_number">ID Number</label>
                <input
                    type="text"
                    id="id_number"
                    name="id_number"
                    placeholder="Enter your ID number"
                    required
                >
            </div>

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
                <label for="phone">Phone Number</label>
                <input
                    type="tel"
                    id="phone"
                    name="phone"
                    placeholder="Enter your phone number"
                    required
                >
            </div>

            <div class="form-group">
                <label for="address">Address</label>
                <input
                    type="text"
                    id="address"
                    name="address"
                    placeholder="Enter your address"
                    required
                >
            </div>

            <h2 class="form-section-title">Availability</h2>

            <div class="form-group">
                <label for="availability">When are you available to volunteer?</label>
                <select id="availability" name="availability" required>
                    <option value="">Select availability</option>
                    <option value="Weekdays">Weekdays</option>
                    <option value="Weekends">Weekends</option>
                    <option value="Weekdays and Weekends">Weekdays and Weekends</option>
                </select>
            </div>

            <div class="form-group">
                <label for="preferred_time">Preferred Time</label>
                <select id="preferred_time" name="preferred_time" required>
                    <option value="">Select preferred time</option>
                    <option value="Morning">Morning</option>
                    <option value="Afternoon">Afternoon</option>
                    <option value="Evening">Evening</option>
                    <option value="Flexible">Flexible</option>
                </select>
            </div>

            <h2 class="form-section-title">Account Security</h2>

            <div class="form-group">
                <label for="password">Password</label>
                <input
                    type="password"
                    id="password"
                    name="password"
                    placeholder="Create a password"
                    required
                >
            </div>

            <div class="form-group">
                <label for="confirm_password">Confirm Password</label>
                <input
                    type="password"
                    id="confirm_password"
                    name="confirm_password"
                    placeholder="Confirm your password"
                    required
                >
            </div>

            <button type="submit" class="login-button">
                Create Volunteer Account
            </button>

        </form>

        <p class="register-text">
            Already have an account?
            <a href="volunteer_login.php">Login here</a>
        </p>

    </div>

</main>

<footer>
    <p>&copy; 2026 CareConnect. All rights reserved.</p>
</footer>

</body>
</html>

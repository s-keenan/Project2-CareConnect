<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>CareConnect - Applicant Registration</title>
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

        <h1>Applicant Registration</h1>

        <p class="login-intro">
            Create your CareConnect account to request assistance.
        </p>

        <?php if (isset($_GET['error'])): ?>
            <p style="color: #b00020; text-align: center; margin-bottom: 15px;">
                <?php echo htmlspecialchars($_GET['error']); ?>
            </p>
        <?php endif; ?>

        <form action="applicant-register-process.php" method="post">

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

            <div class="form-group">
                <label for="medical_details">Medical Details</label>
                <input
                    type="text"
                    id="medical_details"
                    name="medical_details"
                    placeholder="Any relevant medical details (optional)"
                >
            </div>

            <h2 class="form-section-title">Emergency Contact / Next of Kin</h2>

            <div class="form-group">
                <label for="next_of_kin">Full Name</label>
                <input
                    type="text"
                    id="next_of_kin"
                    name="next_of_kin"
                    placeholder="Enter next of kin full name"
                    required
                >
            </div>

            <div class="form-group">
                <label for="kin_relationship">Relationship</label>
                <input
                    type="text"
                    id="kin_relationship"
                    name="kin_relationship"
                    placeholder="e.g. Daughter, Son, Sister"
                    required
                >
            </div>

            <div class="form-group">
                <label for="kin_phone">Contact Number</label>
                <input
                    type="tel"
                    id="kin_phone"
                    name="kin_phone"
                    placeholder="Enter contact number"
                    required
                >
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
                Create Applicant Account
            </button>

        </form>

        <p class="register-text">
            Already have an account?
            <a href="applicant_login.php">Login here</a>
        </p>

    </div>

</main>

<footer>
    <p>&copy; 2026 CareConnect. All rights reserved.</p>
</footer>

</body>
</html>
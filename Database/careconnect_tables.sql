CREATE TABLE APP_USER (
    userID INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('Applicant', 'Volunteer', 'Admin') NOT NULL,
    account_status ENUM('Pending', 'Approved', 'Rejected') DEFAULT 'Pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP NULL
);

CREATE TABLE APPLICANT (
    applicantID INT AUTO_INCREMENT PRIMARY KEY,
    userID INT NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    id_number VARCHAR(20) NOT NULL,
    contact_number VARCHAR(20) NOT NULL,
    residential_address VARCHAR(255) NOT NULL,
    next_of_kin_name VARCHAR(100),
    next_of_kin_contact VARCHAR(20),
    medical_details TEXT,
    FOREIGN KEY (userID) REFERENCES APP_USER(userID)
);

CREATE TABLE VOLUNTEER (
    volunteerID INT AUTO_INCREMENT PRIMARY KEY,
    userID INT NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    id_number VARCHAR(20) NOT NULL,
    contact_number VARCHAR(20) NOT NULL,
    availability_schedule VARCHAR(255),
    tasks_completed_count INT DEFAULT 0,
    FOREIGN KEY (userID) REFERENCES APP_USER(userID)
);

CREATE TABLE ADMIN (
    adminID INT AUTO_INCREMENT PRIMARY KEY,
    userID INT NOT NULL,
    department VARCHAR(100),
    permissions_level VARCHAR(50) DEFAULT 'Standard',
    FOREIGN KEY (userID) REFERENCES APP_USER(userID)
);

CREATE TABLE ASSISTANCE_REQUEST (
    requestID INT AUTO_INCREMENT PRIMARY KEY,
    applicantID INT NOT NULL,
    request_type ENUM('Grocery Shopping', 'Medication Collection', 'Transport/Appointment', 'Other') NOT NULL,
    preferred_date_time DATETIME NOT NULL,
    task_description TEXT,
    special_instructions TEXT,
    status ENUM('Pending', 'Accepted', 'In Progress', 'Completed') DEFAULT 'Pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (applicantID) REFERENCES APPLICANT(applicantID)
);

CREATE TABLE TASK_ASSIGNMENT (
    assignmentID INT AUTO_INCREMENT PRIMARY KEY,
    requestID INT NOT NULL,
    volunteerID INT NOT NULL,
    accepted_at TIMESTAMP NULL,
    started_at TIMESTAMP NULL,
    completed_at TIMESTAMP NULL,
    FOREIGN KEY (requestID) REFERENCES ASSISTANCE_REQUEST(requestID),
    FOREIGN KEY (volunteerID) REFERENCES VOLUNTEER(volunteerID)
);

CREATE TABLE MESSAGE (
    messageID INT AUTO_INCREMENT PRIMARY KEY,
    requestID INT NOT NULL,
    senderID INT NOT NULL,
    receiverID INT NOT NULL,
    message_content TEXT NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_read BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (requestID) REFERENCES ASSISTANCE_REQUEST(requestID),
    FOREIGN KEY (senderID) REFERENCES APP_USER(userID),
    FOREIGN KEY (receiverID) REFERENCES APP_USER(userID)
);

CREATE TABLE NOTIFICATION (
    notificationID INT AUTO_INCREMENT PRIMARY KEY,
    userID INT NOT NULL,
    notification_type VARCHAR(50) NOT NULL,
    message VARCHAR(255) NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_read BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (userID) REFERENCES APP_USER(userID)
);

CREATE TABLE ADMIN_REPORT (
    reportID INT AUTO_INCREMENT PRIMARY KEY,
    adminID INT NOT NULL,
    report_type VARCHAR(100) NOT NULL,
    generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    file_path VARCHAR(255),
    FOREIGN KEY (adminID) REFERENCES ADMIN(adminID)
);

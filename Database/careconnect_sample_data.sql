-- 1. APP_USER (5 applicants worth of logins + 3 volunteers + 2 admins = mix of roles)
INSERT INTO APP_USER (email, password_hash, role, account_status) VALUES
('john.smith@gmail.com', 'hashed_pw_1', 'Applicant', 'Approved'),
('mary.jones@gmail.com', 'hashed_pw_2', 'Applicant', 'Approved'),
('peter.dlamini@gmail.com', 'hashed_pw_3', 'Applicant', 'Approved'),
('susan.brown@gmail.com', 'hashed_pw_4', 'Applicant', 'Pending'),
('david.naidoo@gmail.com', 'hashed_pw_5', 'Applicant', 'Approved'),
('lindiwe.khumalo@gmail.com', 'hashed_pw_6', 'Volunteer', 'Approved'),
('sipho.mokoena@gmail.com', 'hashed_pw_7', 'Volunteer', 'Approved'),
('anna.botha@gmail.com', 'hashed_pw_8', 'Volunteer', 'Approved'),
('admin.keenan@careconnect.com', 'hashed_pw_9', 'Admin', 'Approved'),
('admin.zane@careconnect.com', 'hashed_pw_10', 'Admin', 'Approved');

-- 2. APPLICANT (linked to the first 5 APP_USER rows, userID 1-5)
INSERT INTO APPLICANT (userID, full_name, id_number, contact_number, residential_address, next_of_kin_name, next_of_kin_contact, medical_details) VALUES
(1, 'John Smith', '5501015800089', '0721234567', '12 Main Rd, Grabouw', 'Alice Smith', '0821112222', 'Diabetic, needs medication reminders'),
(2, 'Mary Jones', '4809220900081', '0834567890', '45 Oak St, Grabouw', 'Tom Jones', '0833334444', 'None'),
(3, 'Peter Dlamini', '6002145600082', '0712223333', '8 Church St, Grabouw', 'Nomsa Dlamini', '0715556666', 'Limited mobility, uses wheelchair'),
(4, 'Susan Brown', '5203089900083', '0844445555', '22 Pine Ave, Grabouw', 'Mike Brown', '0846667777', 'None'),
(5, 'David Naidoo', '4711055500084', '0768889999', '3 River Rd, Grabouw', 'Priya Naidoo', '0769990000', 'Hearing impaired');

-- 3. VOLUNTEER (linked to userID 6-8)
INSERT INTO VOLUNTEER (userID, full_name, id_number, contact_number, availability_schedule, tasks_completed_count) VALUES
(6, 'Lindiwe Khumalo', '9803120800085', '0791112222', 'Weekdays 9am-2pm', 4),
(7, 'Sipho Mokoena', '9506154400086', '0823334444', 'Weekends only', 2),
(8, 'Anna Botha', '9209087700087', '0745556666', 'Weekday afternoons', 6);

-- 4. ADMIN (linked to userID 9-10)
INSERT INTO ADMIN (userID, department, permissions_level) VALUES
(9, 'Operations', 'Full'),
(10, 'Support', 'Standard');

-- 5. ASSISTANCE_REQUEST (linked to applicantID 1-5)
INSERT INTO ASSISTANCE_REQUEST (applicantID, request_type, preferred_date_time, task_description, special_instructions, status) VALUES
(1, 'Medication Collection', '2026-08-20 10:00:00', 'Collect diabetes medication from Clicks pharmacy', 'Call before arriving', 'Completed'),
(2, 'Grocery Shopping', '2026-08-21 09:00:00', 'Weekly grocery shop - list provided', 'Leave groceries at front door', 'In Progress'),
(3, 'Transport/Appointment', '2026-08-22 08:30:00', 'Transport to physiotherapy appointment', 'Wheelchair access needed', 'Accepted'),
(4, 'Grocery Shopping', '2026-08-23 11:00:00', 'Small grocery top-up', NULL, 'Pending'),
(5, 'Other', '2026-08-24 14:00:00', 'Help setting up hearing aid batteries', NULL, 'Pending');

-- 6. TASK_ASSIGNMENT (linked to requestID + volunteerID)
INSERT INTO TASK_ASSIGNMENT (requestID, volunteerID, accepted_at, started_at, completed_at) VALUES
(1, 1, '2026-08-19 08:00:00', '2026-08-20 09:45:00', '2026-08-20 10:30:00'),
(2, 2, '2026-08-20 07:00:00', '2026-08-21 09:00:00', NULL),
(3, 3, '2026-08-21 12:00:00', NULL, NULL);

-- 7. MESSAGE (linked to requestID + senderID/receiverID from APP_USER)
INSERT INTO MESSAGE (requestID, senderID, receiverID, message_content, is_read) VALUES
(1, 1, 6, 'Thank you so much for collecting my medication!', TRUE),
(1, 6, 1, 'No problem at all, glad I could help.', TRUE),
(2, 2, 7, 'Here is the grocery list, let me know if anything is unavailable.', FALSE),
(3, 3, 8, 'Please confirm what time you will arrive tomorrow.', FALSE),
(3, 8, 3, 'I will be there at 8:30am as planned.', TRUE);

-- 8. NOTIFICATION (linked to userID)
INSERT INTO NOTIFICATION (userID, notification_type, message, is_read) VALUES
(1, 'Status Change', 'Your medication collection request has been completed.', TRUE),
(2, 'Request Accepted', 'Your grocery shopping request has been accepted by a volunteer.', FALSE),
(3, 'New Message', 'You have a new message about your transport request.', FALSE),
(6, 'Task Assigned', 'You have been assigned a new medication collection task.', TRUE),
(7, 'Task Assigned', 'You have been assigned a new grocery shopping task.', TRUE);

-- 9. ADMIN_REPORT (linked to adminID)
INSERT INTO ADMIN_REPORT (adminID, report_type, file_path) VALUES
(1, 'Monthly User Statistics', '/reports/user_stats_aug2026.pdf'),
(1, 'Completed Tasks Report', '/reports/completed_tasks_aug2026.pdf'),
(2, 'Pending Requests Report', '/reports/pending_requests_aug2026.pdf');

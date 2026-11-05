# CareConnect End-to-End Test Checklist

Run with Live Server from the `CareConnect Static` folder. Use new, test-only email addresses for registrations.

- [ ] Open `login.html`, choose **Applicant**, and register a test Applicant with all required fields and a password of at least eight characters.
- [ ] Try to log in as that new Applicant while its account is Pending. Confirm the page says the account is still pending approval.
- [ ] Return to `login.html`, choose **Volunteer**, and register a test Volunteer with availability, preferred time, and all required fields.
- [ ] Try to log in as that Volunteer while its account is Pending. Confirm the same pending-approval message appears.
- [ ] Choose **Admin** and sign in with `admin@careconnect.test` / `CareConnect123!`.
- [ ] On the Admin dashboard, find the two test accounts and approve both. Confirm the pending count/list updates.
- [ ] Sign out. Sign in as the test Applicant and confirm the Applicant dashboard opens.
- [ ] Create a new assistance request with a type, date, time, description, instructions, and priority. Confirm it appears under My Requests with Pending status.
- [ ] Sign out. Sign in as the test Volunteer and accept that Pending request. Confirm it disappears from Available Requests and appears in My Tasks.
- [ ] Update the task through **In Progress**, **On the Way**, and **Completed**, saving each update. Confirm progress notes persist, timestamps appear in the task assignment, and the Completed count increases once.
- [ ] Open Messages from the Volunteer account, select the request, and send a message to the Applicant.
- [ ] Sign out and sign in as the test Applicant. Open Messages, select the same request, and reply. Confirm both messages appear in timestamp order.
- [ ] Sign out and try to open `applicant_dashboard.html` directly. Confirm the browser redirects to `login.html`.
- [ ] Sign in as Admin, then open `admin_users.html` and `admin_requests.html`. Confirm both tables display current data and have no editing controls.
- [ ] Optional cleanup: use **Reset demo data** from `login.html` and confirm the original demo accounts, requests, assignments, and messages return.
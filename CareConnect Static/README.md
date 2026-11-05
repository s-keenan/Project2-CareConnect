# CareConnect Static

CareConnect is a pure front-end community assistance demo. It uses HTML, CSS, JavaScript, `localStorage`, and `sessionStorage`; it does not require PHP, MySQL, npm, frameworks, or external libraries.

## Open the Site

1. Open the repository in VS Code.
2. Open the `CareConnect Static` folder and right-click `index.html`.
3. Choose **Open with Live Server**. If Live Server is not installed, install the VS Code Live Server extension first.
4. You can also open `index.html` directly from disk. Browser storage is separate for the `file://` origin and the Live Server origin.

Start at `index.html`. The **Log In** link opens the role chooser. On that page, use **Reset demo data** to restore the original data for the current browser origin. Reset removes all CareConnect accounts, requests, task assignments, and messages stored there, then recreates the demo data.

## Demo Accounts

| Role | Email | Password | Status |
| --- | --- | --- | --- |
| Applicant | `applicant@careconnect.test` | `CareConnect123!` | Approved |
| Volunteer | `volunteer@careconnect.test` | `CareConnect123!` | Approved |
| Admin | `admin@careconnect.test` | `CareConnect123!` | Approved |
| Pending Applicant | `applicant.pending@careconnect.test` | `CareConnect123!` | Pending |

The Pending Applicant is provided to check the approval gate. New Applicant and Volunteer registrations also start Pending and must be approved by an Admin before those accounts can log in.

## Files

### Pages

| File | Purpose |
| --- | --- |
| `index.html` | Public home page and CareConnect introduction. |
| `login.html` | Applicant, Volunteer, and Admin login chooser, demo credentials, and data reset link. |
| `register.html` | Applicant or Volunteer registration chooser. |
| `applicant_login.html` | Applicant login form. |
| `volunteer_login.html` | Volunteer login form. |
| `admin_login.html` | Admin login form. |
| `applicant_register.html` | Applicant registration form. |
| `volunteer_register.html` | Volunteer registration form. |
| `applicant_dashboard.html` | Applicant welcome page and the applicant's assistance requests. |
| `new_request.html` | Applicant assistance request form. |
| `applicant_tracking.html` | Read-only status tracking for an applicant's selected request. |
| `volunteer_dashboard.html` | Volunteer task counts and Pending requests available to accept. |
| `volunteer_tracking.html` | Volunteer task status and progress-note updates. |
| `admin_dashboard.html` | Admin counts, recent activity, and account approvals. |
| `admin_users.html` | Read-only account directory. |
| `admin_requests.html` | Read-only assistance request table. |
| `messages.html` | Request-based messaging for Applicants, assigned Volunteers, and Admins. |

### Shared Files

| File | Purpose |
| --- | --- |
| `css/style.css` | The single responsive stylesheet for public pages, forms, dashboards, tables, tracking, and messaging. |
| `js/store.js` | Reads and writes the localStorage collections, assigns IDs, seeds demo records, and resets demo data. |
| `js/auth.js` | Hashes passwords, registers and logs in accounts, manages the session, and checks roles. |
| `js/layout.js` | Inserts the shared header and navigation for the current role. |
| `js/forms.js` | Handles registration and role-specific login forms and routes successful logins to the matching dashboard. |
| `js/applicant.js` | Applicant request creation, dashboard rendering, ownership checks, and read-only tracking. |
| `js/volunteer.js` | Volunteer request acceptance, task status updates, progress notes, and completion counts. |
| `js/admin.js` | Admin dashboard counts, approvals, and read-only user/request tables. |
| `js/messages.js` | Request access filtering, ordered message rendering, participant selection, and message sending. |
| `js/reset.js` | Confirms and runs the login-page demo data reset action. |
| `README.md` | Setup instructions, demo credentials, file guide, and storage limitations. |
| `TEST_CHECKLIST.md` | Manual end-to-end test checklist for the main account, request, task, messaging, and access flows. |

## Data and Limitations

The app stores `app_user`, `applicant`, `volunteer`, `assistance_request`, `task_assignment`, and `message` as arrays in browser `localStorage`. The active `{ userID, role }` session is in `sessionStorage`. Data is local to one browser and origin; it is not shared across devices and is not secure authentication or private storage. Do not use real personal or medical data.

For the full manual workflow, follow [TEST_CHECKLIST.md](TEST_CHECKLIST.md).
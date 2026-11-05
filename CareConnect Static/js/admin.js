(function () {
  "use strict";

  const activeRequestStatuses = ["Accepted", "In Progress", "On the Way"];

  async function requireAdmin() {
    await window.CCStore.ready;
    return window.CCAuth.requireRole("Admin");
  }

  function displayDate(value) {
    if (!value) return "Never";
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? "Date not available" : date.toLocaleString([], { dateStyle: "medium", timeStyle: "short" });
  }

  function createCell(row, value, className) {
    const cell = document.createElement("td");
    if (className) cell.className = className;
    cell.textContent = value || "-";
    row.appendChild(cell);
    return cell;
  }

  function getProfileLookups() {
    const applicants = new Map(window.CCStore.read("applicant").map(profile => [profile.userID, profile]));
    const volunteers = new Map(window.CCStore.read("volunteer").map(profile => [profile.userID, profile]));
    return { applicants, volunteers };
  }

  function getUserDetails(user, lookups) {
    const profile = lookups.applicants.get(user.userID) || lookups.volunteers.get(user.userID);
    return {
      name: profile ? profile.full_name : user.role,
      phone: profile ? profile.contact_number : "-"
    };
  }

  function setAdminMessage(text, success) {
    const message = document.querySelector("[data-admin-message]");
    if (!message) return;
    message.textContent = text;
    message.classList.toggle("success", Boolean(success));
  }

  function renderApprovalItem(user, lookups) {
    const item = document.createElement("article");
    item.className = "approval-item";
    const info = document.createElement("div");
    info.className = "approval-info";
    const details = getUserDetails(user, lookups);
    const avatar = document.createElement("div");
    avatar.className = "approval-avatar";
    avatar.setAttribute("aria-hidden", "true");
    avatar.textContent = details.name.split(/\s+/).slice(0, 2).map(part => part.charAt(0)).join("").toUpperCase();
    const identity = document.createElement("div");
    identity.className = "approval-details";
    const name = document.createElement("h4");
    name.textContent = details.name;
    const contact = document.createElement("p");
    contact.textContent = details.phone + " · " + user.email + " · " + user.role;
    const status = document.createElement("span");
    status.className = "status";
    status.textContent = user.account_status;
    identity.append(name, contact, status);
    info.append(avatar, identity);

    const actions = document.createElement("div");
    actions.className = "approval-actions";
    [
      { label: "Approve", status: "Approved", className: "btn-approve" },
      { label: "Reject", status: "Rejected", className: "btn-reject" }
    ].forEach(action => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = action.className;
      button.textContent = action.label;
      button.addEventListener("click", () => updateApproval(user.userID, action.status));
      actions.appendChild(button);
    });
    item.append(info, actions);
    return item;
  }

  function updateApproval(userID, accountStatus) {
    const user = window.CCStore.read("app_user").find(record => record.userID === userID);
    if (!user || user.account_status !== "Pending") return;
    window.CCStore.update("app_user", userID, { account_status: accountStatus });
    renderDashboard();
    setAdminMessage(user.email + " was " + accountStatus.toLowerCase() + ".", true);
  }

  function renderDashboard() {
    const users = window.CCStore.read("app_user");
    const applicants = window.CCStore.read("applicant");
    const volunteers = window.CCStore.read("volunteer");
    const requests = window.CCStore.read("assistance_request");
    const assignments = window.CCStore.read("task_assignment");
    const approvedUsers = users.filter(user => user.account_status === "Approved").length;
    const pendingUsers = users.filter(user => user.account_status === "Pending");
    const completedRequests = requests.filter(request => request.status === "Completed").length;
    const pendingRequests = requests.filter(request => request.status === "Pending").length;

    document.getElementById("total-users").textContent = String(users.length);
    document.getElementById("active-users").textContent = String(approvedUsers);
    document.getElementById("inactive-users").textContent = String(users.length - approvedUsers);
    document.getElementById("pending-approvals").textContent = String(pendingUsers.length);
    document.getElementById("total-requests").textContent = String(requests.length);
    document.getElementById("active-requests").textContent = String(requests.filter(request => activeRequestStatuses.includes(request.status)).length);
    document.getElementById("completed-tasks").textContent = String(completedRequests);
    document.getElementById("pending-tasks").textContent = String(pendingRequests);
    document.getElementById("total-volunteers").textContent = String(volunteers.length);

    const approvalList = document.getElementById("approval-list");
    approvalList.replaceChildren();
    const lookups = getProfileLookups();
    if (pendingUsers.length === 0) {
      const empty = document.createElement("p");
      empty.className = "approval-empty";
      empty.textContent = "There are no pending approvals.";
      approvalList.appendChild(empty);
    } else {
      pendingUsers.forEach(user => approvalList.appendChild(renderApprovalItem(user, lookups)));
    }

    const activityList = document.getElementById("recent-activity-list");
    activityList.replaceChildren();
    const activity = requests.map(request => ({ type: "request", date: request.created_at, request }))
      .concat(users.map(user => ({ type: "account", date: user.created_at, user })))
      .sort((first, second) => new Date(second.date || 0) - new Date(first.date || 0))
      .slice(0, 4);
    if (activity.length === 0) {
      const empty = document.createElement("p");
      empty.className = "approval-empty";
      empty.textContent = "No recent activity.";
      activityList.appendChild(empty);
    } else {
      activity.forEach(entry => {
        const row = document.createElement("div");
        row.className = "activity-item";
        const text = document.createElement("div");
        text.className = "activity-text";
        if (entry.type === "request") {
          text.textContent = entry.request.request_type + " request · " + entry.request.status;
        } else {
          const user = entry.user;
          const details = getUserDetails(user, lookups);
          text.textContent = details.name + " created a " + user.role.toLowerCase() + " account · " + user.account_status;
        }
        const date = document.createElement("span");
        date.className = "activity-time";
        date.textContent = displayDate(entry.date);
        row.append(text, date);
        activityList.appendChild(row);
      });
    }

    document.getElementById("directory-count").textContent = applicants.length + " applicants · " + volunteers.length + " volunteers";
  }

  function appendStatus(row, status) {
    const cell = document.createElement("td");
    const badge = document.createElement("span");
    badge.className = "status-pill " + String(status).toLowerCase().replace(/\s+/g, "-");
    badge.textContent = status;
    cell.appendChild(badge);
    row.appendChild(cell);
  }

  function renderUsers() {
    const users = window.CCStore.read("app_user").slice().sort((first, second) => first.userID - second.userID);
    const body = document.getElementById("users-table-body");
    const lookups = getProfileLookups();
    body.replaceChildren();
    users.forEach(user => {
      const row = document.createElement("tr");
      const details = getUserDetails(user, lookups);
      createCell(row, details.name);
      createCell(row, user.email);
      createCell(row, user.role);
      createCell(row, details.phone);
      appendStatus(row, user.account_status);
      createCell(row, displayDate(user.created_at));
      body.appendChild(row);
    });
    document.getElementById("users-total").textContent = users.length + " accounts";
  }

  function renderRequests() {
    const requests = window.CCStore.read("assistance_request").slice()
      .sort((first, second) => new Date(second.created_at || 0) - new Date(first.created_at || 0));
    const body = document.getElementById("requests-table-body");
    const applicantProfiles = new Map(window.CCStore.read("applicant").map(profile => [profile.applicantID, profile]));
    body.replaceChildren();
    requests.forEach(request => {
      const row = document.createElement("tr");
      const applicant = applicantProfiles.get(request.applicantID);
      createCell(row, String(request.requestID));
      createCell(row, applicant ? applicant.full_name : "Unknown applicant");
      createCell(row, request.request_type);
      createCell(row, displayDate(request.preferred_date_time));
      createCell(row, request.priority || "-");
      appendStatus(row, request.status);
      createCell(row, request.task_description, "description-cell");
      body.appendChild(row);
    });
    document.getElementById("requests-total").textContent = requests.length + " requests";
  }

  document.addEventListener("DOMContentLoaded", async () => {
    if (!await requireAdmin()) return;
    const page = document.body.dataset.adminPage;
    if (page === "dashboard") renderDashboard();
    if (page === "users") renderUsers();
    if (page === "requests") renderRequests();
  });
}());
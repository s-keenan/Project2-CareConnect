(function () {
  "use strict";

  const taskStatuses = ["Accepted", "In Progress", "On the Way", "Completed"];

  async function getVolunteer() {
    await window.CCStore.ready;
    if (!window.CCAuth.requireRole("Volunteer")) return null;
    const user = window.CCAuth.getCurrentUser();
    const volunteer = window.CCStore.read("volunteer").find(record => record.userID === user.userID);
    if (!volunteer) {
      const message = document.querySelector("[data-volunteer-message]");
      if (message) message.textContent = "Volunteer profile not found. Please sign in again.";
      return null;
    }
    return volunteer;
  }

  function displayDate(value) {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? "Date not available" : date.toLocaleString([], { dateStyle: "medium", timeStyle: "short" });
  }

  function makePendingCard(request, applicant) {
    const card = document.createElement("article");
    card.className = "card";
    const row = document.createElement("div");
    row.className = "card-row";
    const title = document.createElement("h3");
    title.className = "card-title";
    title.textContent = request.request_type;
    const priority = document.createElement("span");
    priority.className = "badge badge-" + String(request.priority || "Medium").toLowerCase();
    priority.textContent = request.priority || "Medium";
    row.append(title, priority);

    const date = document.createElement("p");
    date.className = "card-meta";
    date.textContent = displayDate(request.preferred_date_time);
    const applicantName = document.createElement("p");
    applicantName.className = "card-meta";
    applicantName.textContent = applicant ? "Applicant: " + applicant.full_name : "Applicant";
    const description = document.createElement("p");
    description.className = "task-description";
    description.textContent = request.task_description;
    const instructions = document.createElement("p");
    instructions.className = "card-meta";
    instructions.textContent = request.special_instructions ? "Special Instructions: " + request.special_instructions : "No special instructions";

    const accept = document.createElement("button");
    accept.type = "button";
    accept.className = "button";
    accept.textContent = "Accept";
    accept.addEventListener("click", () => acceptRequest(request.requestID));
    card.append(row, date, applicantName, description, instructions, accept);
    return card;
  }

  function setMessage(text, success) {
    const message = document.querySelector("[data-volunteer-message]");
    message.textContent = text;
    message.classList.toggle("success", Boolean(success));
  }

  function renderDashboard(volunteer) {
    document.getElementById("volunteer-name").textContent = volunteer.full_name;
    const assignments = window.CCStore.read("task_assignment").filter(task => task.volunteerID === volunteer.volunteerID);
    const requestsByID = new Map(window.CCStore.read("assistance_request").map(request => [request.requestID, request]));
    const activeCount = assignments.filter(task => {
      const request = requestsByID.get(task.requestID);
      return request && taskStatuses.includes(request.status) && request.status !== "Completed";
    }).length;
    document.getElementById("completed-count").textContent = String(volunteer.tasks_completed_count || 0);
    document.getElementById("active-count").textContent = String(activeCount);

    const list = document.getElementById("pending-list");
    list.replaceChildren();
    const applicants = new Map(window.CCStore.read("applicant").map(applicant => [applicant.applicantID, applicant]));
    const pending = window.CCStore.read("assistance_request")
      .filter(request => request.status === "Pending")
      .sort((first, second) => new Date(first.preferred_date_time) - new Date(second.preferred_date_time));
    if (pending.length === 0) {
      const empty = document.createElement("p");
      empty.className = "empty-state";
      empty.textContent = "There are no Pending requests right now.";
      list.appendChild(empty);
      return;
    }
    pending.forEach(request => list.appendChild(makePendingCard(request, applicants.get(request.applicantID))));
  }

  function acceptRequest(requestID) {
    const request = window.CCStore.read("assistance_request").find(item => item.requestID === requestID);
    const volunteer = window.CCStore.read("volunteer").find(item => item.userID === window.CCAuth.getCurrentUser().userID);
    if (!request || request.status !== "Pending" || !volunteer) {
      setMessage("This request is no longer available.", false);
      return;
    }

    const assignment = window.CCStore.add("task_assignment", {
      requestID: request.requestID,
      volunteerID: volunteer.volunteerID,
      accepted_at: new Date().toISOString(),
      started_at: null,
      completed_at: null,
      progress_notes: ""
    });
    if (!window.CCStore.update("assistance_request", request.requestID, { status: "Accepted" })) {
      window.CCStore.remove("task_assignment", assignment.assignmentID);
      setMessage("Could not accept this request. Please try again.", false);
      return;
    }

    setMessage("Request accepted. It is now available in My Tasks.", true);
    renderDashboard(volunteer);
  }

  function appendTaskDetail(container, label, value) {
    const detail = document.createElement("p");
    detail.className = "card-meta";
    const strong = document.createElement("strong");
    strong.textContent = label + ": ";
    detail.append(strong, document.createTextNode(value || "None"));
    container.appendChild(detail);
  }

  function makeTaskCard(assignment, request, volunteer) {
    const card = document.createElement("article");
    card.className = "card task-card";
    const row = document.createElement("div");
    row.className = "card-row";
    const title = document.createElement("h2");
    title.className = "card-title";
    title.textContent = request.request_type;
    const badge = document.createElement("span");
    badge.className = "badge " + (request.status === "Completed" ? "badge-completed" : "badge-accepted");
    badge.textContent = request.status;
    row.append(title, badge);

    appendTaskDetail(card, "Preferred Date and Time", displayDate(request.preferred_date_time));
    appendTaskDetail(card, "Task Description", request.task_description);
    appendTaskDetail(card, "Special Instructions", request.special_instructions);

    const form = document.createElement("form");
    form.className = "task-update-form";
    const statusField = document.createElement("div");
    statusField.className = "form-field";
    const statusLabel = document.createElement("label");
    statusLabel.htmlFor = "task-status-" + assignment.assignmentID;
    statusLabel.textContent = "Update Status";
    const select = document.createElement("select");
    select.id = statusLabel.htmlFor;
    select.name = "status";
    taskStatuses.forEach(status => {
      const option = document.createElement("option");
      option.value = status;
      option.textContent = status;
      option.selected = status === request.status;
      select.appendChild(option);
    });
    if (request.status === "Completed") select.disabled = true;
    statusField.append(statusLabel, select);

    const noteField = document.createElement("div");
    noteField.className = "form-field task-notes";
    const noteLabel = document.createElement("label");
    noteLabel.htmlFor = "task-notes-" + assignment.assignmentID;
    noteLabel.textContent = "Progress Notes";
    const notes = document.createElement("textarea");
    notes.id = noteLabel.htmlFor;
    notes.name = "progress_notes";
    notes.placeholder = "Add a note about your progress...";
    notes.value = assignment.progress_notes || "";
    noteField.append(noteLabel, notes);

    const message = document.createElement("p");
    message.className = "form-message";
    message.setAttribute("role", "status");
    message.setAttribute("aria-live", "polite");
    const save = document.createElement("button");
    save.type = "submit";
    save.className = "button";
    save.textContent = "Save Updates";
    form.append(statusField, noteField, message, save);
    form.addEventListener("submit", event => {
      event.preventDefault();
      saveTaskUpdates(assignment.assignmentID, select.value, notes.value, volunteer, message);
    });

    card.append(row, form);
    return card;
  }

  function renderTracking(volunteer) {
    const list = document.getElementById("task-list");
    list.replaceChildren();
    const requestsByID = new Map(window.CCStore.read("assistance_request").map(request => [request.requestID, request]));
    const assignments = window.CCStore.read("task_assignment")
      .filter(task => task.volunteerID === volunteer.volunteerID)
      .sort((first, second) => new Date(second.accepted_at || 0) - new Date(first.accepted_at || 0));
    const ownedTasks = assignments
      .map(assignment => ({ assignment, request: requestsByID.get(assignment.requestID) }))
      .filter(item => item.request);

    if (ownedTasks.length === 0) {
      const empty = document.createElement("p");
      empty.className = "empty-state";
      empty.textContent = "You have no assigned tasks yet.";
      list.appendChild(empty);
      return;
    }
    ownedTasks.forEach(item => list.appendChild(makeTaskCard(item.assignment, item.request, volunteer)));
  }

  function saveTaskUpdates(assignmentID, nextStatus, notes, volunteer, message) {
    const assignment = window.CCStore.read("task_assignment").find(task => task.assignmentID === assignmentID);
    if (!assignment || assignment.volunteerID !== volunteer.volunteerID) {
      message.textContent = "This task is not assigned to your account.";
      return;
    }
    const request = window.CCStore.read("assistance_request").find(item => item.requestID === assignment.requestID);
    if (!request || !taskStatuses.includes(nextStatus)) {
      message.textContent = "Choose a valid task status.";
      return;
    }
    if (request.status === "Completed" && nextStatus !== "Completed") {
      message.textContent = "Completed tasks cannot be reopened.";
      return;
    }

    const wasCompleted = request.status === "Completed" || Boolean(assignment.completed_at);
    const now = new Date().toISOString();
    const assignmentChanges = { progress_notes: notes.trim() };
    if (nextStatus === "In Progress" || nextStatus === "On the Way" || nextStatus === "Completed") {
      assignmentChanges.started_at = assignment.started_at || now;
    }
    if (nextStatus === "Completed") assignmentChanges.completed_at = assignment.completed_at || now;

    window.CCStore.update("task_assignment", assignment.assignmentID, assignmentChanges);
    window.CCStore.update("assistance_request", request.requestID, { status: nextStatus });
    if (nextStatus === "Completed" && !wasCompleted) {
      window.CCStore.update("volunteer", volunteer.volunteerID, {
        tasks_completed_count: (Number(volunteer.tasks_completed_count) || 0) + 1
      });
      volunteer.tasks_completed_count = (Number(volunteer.tasks_completed_count) || 0) + 1;
    }
    message.textContent = "Task status and progress notes saved.";
    message.classList.add("success");
    renderTracking(volunteer);
    setMessage("Task status and progress notes saved.", true);
  }

  document.addEventListener("DOMContentLoaded", async () => {
    const volunteer = await getVolunteer();
    if (!volunteer) return;
    if (document.body.dataset.volunteerPage === "dashboard") renderDashboard(volunteer);
    if (document.body.dataset.volunteerPage === "tracking") renderTracking(volunteer);
  });
}());
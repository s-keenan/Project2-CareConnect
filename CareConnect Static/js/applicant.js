(function () {
  "use strict";

  const statuses = ["Pending", "Accepted", "In Progress", "On the Way", "Completed"];

  async function getApplicant() {
    await window.CCStore.ready;
    if (!window.CCAuth.requireRole("Applicant")) return null;
    const user = window.CCAuth.getCurrentUser();
    const applicant = window.CCStore.read("applicant").find(record => record.userID === user.userID);
    if (!applicant) {
      const message = document.querySelector("[data-applicant-message]");
      if (message) message.textContent = "Applicant profile not found. Please sign in again.";
      return null;
    }
    return applicant;
  }

  function displayDate(value) {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? "Date not available" : date.toLocaleString([], { dateStyle: "medium", timeStyle: "short" });
  }

  function makeRequestCard(request) {
    const card = document.createElement("article");
    card.className = "card";
    const row = document.createElement("div");
    row.className = "card-row";

    const summary = document.createElement("div");
    const title = document.createElement("h3");
    title.className = "card-title";
    title.textContent = request.request_type;
    const date = document.createElement("p");
    date.className = "card-meta";
    date.textContent = displayDate(request.preferred_date_time);
    summary.append(title, date);

    const badge = document.createElement("span");
    badge.className = "badge " + (request.status === "Pending" ? "badge-pending" : request.status === "Completed" ? "badge-completed" : "badge-accepted");
    badge.textContent = request.status;
    row.append(summary, badge);

    const description = document.createElement("p");
    description.textContent = request.task_description;
    const actions = document.createElement("div");
    actions.className = "request-actions";
    const track = document.createElement("a");
    track.href = "applicant_tracking.html?requestID=" + encodeURIComponent(request.requestID);
    track.textContent = "Track this request";
    actions.appendChild(track);
    card.append(row, description, actions);
    return card;
  }

  function renderDashboard(applicant) {
    document.getElementById("applicant-name").textContent = applicant.full_name;
    const requests = window.CCStore.read("assistance_request")
      .filter(request => request.applicantID === applicant.applicantID)
      .sort((first, second) => new Date(second.created_at) - new Date(first.created_at));
    const list = document.getElementById("request-list");
    if (requests.length === 0) {
      const empty = document.createElement("p");
      empty.className = "empty-state";
      empty.textContent = "You have not submitted any assistance requests yet.";
      list.appendChild(empty);
      return;
    }
    requests.forEach(request => list.appendChild(makeRequestCard(request)));
  }

  function renderRequestForm(applicant) {
    const form = document.getElementById("request-form");
    const message = document.querySelector("[data-applicant-message]");
    const dashboardLink = document.getElementById("view-requests-link");
    form.addEventListener("submit", event => {
      event.preventDefault();
      message.classList.remove("success");
      message.textContent = "";
      if (!form.checkValidity()) {
        message.textContent = "Please fill in all required fields.";
        return;
      }

      const values = new FormData(form);
      const preferredDate = new Date(values.get("requestDate") + "T" + values.get("requestTime"));
      if (Number.isNaN(preferredDate.getTime())) {
        message.textContent = "Please enter a valid date and time.";
        return;
      }

      window.CCStore.add("assistance_request", {
        applicantID: applicant.applicantID,
        request_type: values.get("requestType"),
        preferred_date_time: preferredDate.toISOString(),
        task_description: String(values.get("taskDescription")).trim(),
        special_instructions: String(values.get("specialInstructions") || "").trim(),
        priority: values.get("priority"),
        status: "Pending",
        created_at: new Date().toISOString()
      });
      form.reset();
      message.classList.add("success");
      message.textContent = "Request submitted. Its status is Pending.";
      dashboardLink.hidden = false;
    });
  }

  function appendDetail(list, label, value) {
    const item = document.createElement("div");
    item.className = "request-detail";
    const term = document.createElement("dt");
    term.textContent = label;
    const detail = document.createElement("dd");
    detail.textContent = value || "None";
    item.append(term, detail);
    list.appendChild(item);
  }

  function renderTracking(applicant) {
    const message = document.querySelector("[data-applicant-message]");
    const requestID = new URLSearchParams(window.location.search).get("requestID");
    const request = window.CCStore.read("assistance_request").find(record =>
      String(record.requestID) === requestID && record.applicantID === applicant.applicantID
    );
    if (!request) {
      message.textContent = "Choose one of your requests from My Requests to view its tracking details.";
      return;
    }

    document.getElementById("tracking-title").textContent = request.request_type;
    document.getElementById("tracking-status").textContent = request.status;
    const currentIndex = statuses.indexOf(request.status);
    document.querySelectorAll("[data-step-status]").forEach(step => {
      const stepIndex = statuses.indexOf(step.dataset.stepStatus);
      step.classList.add(stepIndex < currentIndex ? "complete" : stepIndex === currentIndex ? "active" : "upcoming");
      if (stepIndex === currentIndex) step.setAttribute("aria-current", "step");
    });

    const details = document.getElementById("tracking-details");
    appendDetail(details, "Preferred Date and Time", displayDate(request.preferred_date_time));
    appendDetail(details, "Priority", request.priority);
    appendDetail(details, "Task Description", request.task_description);
    appendDetail(details, "Special Instructions", request.special_instructions);
    document.getElementById("tracking-content").hidden = false;
  }

  document.addEventListener("DOMContentLoaded", async () => {
    const applicant = await getApplicant();
    if (!applicant) return;

    const page = document.body.dataset.applicantPage;
    if (page === "dashboard") renderDashboard(applicant);
    if (page === "request") renderRequestForm(applicant);
    if (page === "tracking") renderTracking(applicant);
  });
}());
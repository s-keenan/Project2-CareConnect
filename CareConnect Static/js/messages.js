(function () {
  "use strict";

  let currentUser;
  let eligibleRequests = [];

  function displayDate(value) {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? "Date not available" : date.toLocaleString([], { dateStyle: "medium", timeStyle: "short" });
  }

  function getContext() {
    const user = window.CCAuth.getCurrentUser();
    const roles = ["Applicant", "Volunteer", "Admin"];
    if (!user || !roles.includes(user.role)) {
      window.location.href = "login.html";
      return null;
    }
    if (!window.CCAuth.requireRole(user.role)) return null;

    const applicants = window.CCStore.read("applicant");
    const volunteers = window.CCStore.read("volunteer");
    const assignments = window.CCStore.read("task_assignment");
    const requests = window.CCStore.read("assistance_request");
    const profiles = {
      applicants: new Map(applicants.map(profile => [profile.applicantID, profile])),
      volunteers: new Map(volunteers.map(profile => [profile.volunteerID, profile])),
      byUserID: new Map(applicants.concat(volunteers).map(profile => [profile.userID, profile]))
    };

    if (user.role === "Applicant") {
      const profile = applicants.find(item => item.userID === user.userID);
      if (!profile) return null;
      eligibleRequests = requests.filter(request => request.applicantID === profile.applicantID);
    } else if (user.role === "Volunteer") {
      const profile = volunteers.find(item => item.userID === user.userID);
      if (!profile) return null;
      const requestIDs = new Set(assignments.filter(item => item.volunteerID === profile.volunteerID).map(item => item.requestID));
      eligibleRequests = requests.filter(request => requestIDs.has(request.requestID));
    } else {
      eligibleRequests = requests;
    }

    return { user, profiles, assignments, requests };
  }

  function participant(userID, profiles) {
    const account = window.CCStore.read("app_user").find(item => item.userID === userID);
    if (!account) return null;
    const profile = profiles.byUserID.get(userID);
    return {
      userID,
      role: account.role,
      name: profile ? profile.full_name : account.role
    };
  }

  function getRecipients(request, context) {
    const assignedVolunteers = context.assignments
      .filter(assignment => assignment.requestID === request.requestID)
      .map(assignment => context.profiles.volunteers.get(assignment.volunteerID))
      .filter(Boolean)
      .map(profile => ({ userID: profile.userID, role: "Volunteer", name: profile.full_name }));
    const applicantProfile = context.profiles.applicants.get(request.applicantID);
    const applicantRecipient = applicantProfile
      ? { userID: applicantProfile.userID, role: "Applicant", name: applicantProfile.full_name }
      : null;

    if (context.user.role === "Applicant") {
      const recipients = assignedVolunteers.length ? assignedVolunteers : window.CCStore.read("app_user")
        .filter(user => user.role === "Admin")
        .map(user => ({ userID: user.userID, role: "Admin", name: "CareConnect Admin" }));
      return recipients.filter(item => item.userID !== context.user.userID);
    }
    if (context.user.role === "Volunteer") {
      return applicantRecipient ? [applicantRecipient] : [];
    }
    return [applicantRecipient].concat(assignedVolunteers).filter(item => item && item.userID !== context.user.userID);
  }

  function setStatus(text, kind) {
    const status = document.getElementById("message-status");
    status.textContent = text;
    status.className = "message-status" + (kind ? " " + kind : "");
  }

  function populateRequests() {
    const select = document.getElementById("request-select");
    eligibleRequests.sort((first, second) => new Date(second.created_at || 0) - new Date(first.created_at || 0));
    select.replaceChildren();
    if (eligibleRequests.length === 0) {
      const option = document.createElement("option");
      option.value = "";
      option.textContent = "No requests available";
      select.appendChild(option);
      select.disabled = true;
      document.getElementById("recipient-select").disabled = true;
      document.getElementById("message-content").disabled = true;
      document.querySelector("#message-form button").disabled = true;
      document.getElementById("request-title").textContent = "No requests available";
      document.getElementById("messages-list").innerHTML = '<p class="empty-state">There are no requests available for your account.</p>';
      setStatus("There are no requests available for your account.", "error");
      return;
    }

    eligibleRequests.forEach(request => {
      const option = document.createElement("option");
      option.value = String(request.requestID);
      option.textContent = "#" + request.requestID + " · " + request.request_type + " · " + request.status;
      select.appendChild(option);
    });
  }

  function renderMessages(request, context) {
    const feed = document.getElementById("messages-list");
    feed.replaceChildren();
    let messages = window.CCStore.read("message")
      .filter(message => message.requestID === request.requestID)
      .sort((first, second) => new Date(first.timestamp) - new Date(second.timestamp) || first.messageID - second.messageID);

    messages.filter(message => message.receiverID === context.user.userID && !message.is_read)
      .forEach(message => window.CCStore.update("message", message.messageID, { is_read: true }));
    messages = window.CCStore.read("message")
      .filter(message => message.requestID === request.requestID)
      .sort((first, second) => new Date(first.timestamp) - new Date(second.timestamp) || first.messageID - second.messageID);

    if (messages.length === 0) {
      const empty = document.createElement("p");
      empty.className = "empty-state";
      empty.textContent = "No messages for this request yet.";
      feed.appendChild(empty);
    } else {
      messages.forEach(message => {
        const bubble = document.createElement("article");
        bubble.className = "message-bubble " + (message.senderID === context.user.userID ? "sent" : "received");
        const sender = participant(message.senderID, context.profiles);
        const senderLabel = document.createElement("span");
        senderLabel.className = "message-sender";
        senderLabel.textContent = sender ? sender.name : "CareConnect User";
        const content = document.createElement("span");
        content.textContent = message.message_content;
        const time = document.createElement("span");
        time.className = "msg-time";
        time.textContent = displayDate(message.timestamp);
        bubble.append(senderLabel, content, time);
        feed.appendChild(bubble);
      });
    }
    feed.scrollTop = feed.scrollHeight;
  }

  function renderRequest(request, context) {
    const recipients = getRecipients(request, context);
    const requestSelect = document.getElementById("request-select");
    const recipientSelect = document.getElementById("recipient-select");
    const previousRecipient = recipientSelect.value;
    recipientSelect.replaceChildren();
    recipients.forEach(recipient => {
      const option = document.createElement("option");
      option.value = String(recipient.userID);
      option.textContent = recipient.name + " (" + recipient.role + ")";
      recipientSelect.appendChild(option);
    });
    recipientSelect.disabled = recipients.length <= 1;
    if (recipients.some(recipient => String(recipient.userID) === previousRecipient)) {
      recipientSelect.value = previousRecipient;
    }

    document.getElementById("request-title").textContent = request.request_type;
    document.getElementById("request-meta").textContent = "Request #" + request.requestID + " · " + request.status;
    const composer = document.getElementById("message-form");
    const hasRecipients = recipients.length > 0;
    composer.querySelector("textarea").disabled = !hasRecipients;
    composer.querySelector("button").disabled = !hasRecipients;
    if (!hasRecipients) setStatus("No other participant is available for this request.", "error");
    else setStatus("", "");
    renderMessages(request, context);
  }

  function currentRequest() {
    const requestID = Number(document.getElementById("request-select").value);
    return eligibleRequests.find(request => request.requestID === requestID) || null;
  }

  function sendMessage(event, context) {
    event.preventDefault();
    const request = currentRequest();
    const content = document.getElementById("message-content");
    const recipientID = Number(document.getElementById("recipient-select").value);
    const message = content.value.trim();
    if (!request || !message) {
      setStatus("Choose a request and enter a message.", "error");
      return;
    }

    const recipient = getRecipients(request, context).find(item => item.userID === recipientID);
    if (!recipient) {
      setStatus("Choose a participant for this request.", "error");
      return;
    }

    window.CCStore.add("message", {
      requestID: request.requestID,
      senderID: context.user.userID,
      receiverID: recipient.userID,
      message_content: message,
      timestamp: new Date().toISOString(),
      is_read: false
    });
    content.value = "";
    renderRequest(request, context);
    setStatus("Message sent.", "success");
  }

  document.addEventListener("DOMContentLoaded", async () => {
    await window.CCStore.ready;
    const context = getContext();
    if (!context) return;

    populateRequests();
    const requestSelect = document.getElementById("request-select");
    requestSelect.addEventListener("change", () => {
      const request = currentRequest();
      if (request) renderRequest(request, context);
    });
    document.getElementById("message-form").addEventListener("submit", event => sendMessage(event, context));
    const firstRequest = currentRequest();
    if (firstRequest) renderRequest(firstRequest, context);
  });
}());
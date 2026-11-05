(function () {
  "use strict";

  function showMessage(target, text, isSuccess) {
    target.textContent = text;
    target.classList.toggle("success", Boolean(isSuccess));
  }

  function formValues(form) {
    return Object.fromEntries(new FormData(form).entries());
  }

  document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll("form[data-login-role]").forEach(form => {
      const message = form.querySelector("[data-form-message]");
      form.addEventListener("submit", async event => {
        event.preventDefault();
        const values = formValues(form);
        showMessage(message, "", false);

        if (!String(values.email || "").trim() || !values.password) {
          showMessage(message, "Please enter your email and password.", false);
          return;
        }
        if (!form.elements.email.checkValidity()) {
          showMessage(message, "Please enter a valid email address.", false);
          return;
        }

        try {
          const session = await window.CCAuth.login(values.email, values.password, form.dataset.loginRole);
          showMessage(message, "Signed in. Opening CareConnect...", true);
          const destinations = {
            Applicant: "applicant_dashboard.html",
            Volunteer: "volunteer_dashboard.html",
            Admin: "admin_dashboard.html"
          };
          window.location.href = destinations[session.role] || "index.html";
        } catch (error) {
          showMessage(message, error.message, false);
        }
      });
    });

    document.querySelectorAll("form[data-register-role]").forEach(form => {
      const message = form.querySelector("[data-form-message]");
      form.addEventListener("submit", async event => {
        event.preventDefault();
        const values = formValues(form);
        showMessage(message, "", false);

        if (!form.checkValidity()) {
          const email = form.elements.email;
          if (email && email.value && !email.checkValidity()) {
            showMessage(message, "Please enter a valid email address.", false);
          } else {
            showMessage(message, "Please fill in all required fields.", false);
          }
          return;
        }

        try {
          await window.CCAuth.register(form.dataset.registerRole, values);
          showMessage(message, "Account created successfully. Please log in.", true);
          form.querySelector("button[type='submit']").disabled = true;
        } catch (error) {
          showMessage(message, error.message, false);
        }
      });
    });
  });
}());
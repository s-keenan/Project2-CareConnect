(function () {
  "use strict";

  document.addEventListener("DOMContentLoaded", () => {
    const link = document.getElementById("reset-demo-data");
    const status = document.getElementById("reset-status");
    if (!link || !status) return;

    const notice = sessionStorage.getItem("careconnect_reset_notice");
    if (notice) {
      status.textContent = notice;
      sessionStorage.removeItem("careconnect_reset_notice");
    }

    link.addEventListener("click", async event => {
      event.preventDefault();
      const confirmed = window.confirm("Reset all CareConnect data saved in this browser to the original demo data?");
      if (!confirmed) return;

      link.setAttribute("aria-disabled", "true");
      try {
        await window.CCStore.resetDemoData();
        window.CCAuth.logout();
        sessionStorage.setItem("careconnect_reset_notice", "Demo data was reset for this browser.");
        window.location.href = "login.html";
      } catch (error) {
        link.removeAttribute("aria-disabled");
        status.textContent = "Could not reset demo data. Please try again.";
      }
    });
  });
}());
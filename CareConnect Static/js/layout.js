(function () {
  "use strict";

  const roleLinks = {
    Applicant: [{ label: "My Requests", href: "applicant_dashboard.html" }, { label: "New Request", href: "new_request.html" }, { label: "Tracking", href: "applicant_tracking.html" }, { label: "Messages", href: "messages.html" }],
    Volunteer: [{ label: "Volunteer Home", href: "volunteer_dashboard.html" }, { label: "My Tasks", href: "volunteer_tracking.html" }, { label: "Messages", href: "messages.html" }],
    Admin: [{ label: "Dashboard", href: "admin_dashboard.html" }, { label: "Users", href: "admin_users.html" }, { label: "Requests", href: "admin_requests.html" }, { label: "Messages", href: "messages.html" }]
  };

  function render() {
    const headerTarget = document.getElementById("site-header");
    const navTarget = document.getElementById("site-nav");
    if (!headerTarget || !navTarget) return;

    const currentUser = window.CCAuth.getCurrentUser();
    const header = document.createElement("header");
    header.className = "site-header";
    header.innerHTML = '<a class="brand" href="index.html">Care<span>Connect</span></a>';

    const nav = document.createElement("nav");
    nav.className = "site-nav";
    nav.setAttribute("aria-label", "Main navigation");
    const links = [{ label: "Home", href: "index.html" }].concat(currentUser ? roleLinks[currentUser.role] || [] : []);
    links.forEach(item => {
      const link = document.createElement("a");
      link.href = item.href;
      link.textContent = item.label;
      nav.appendChild(link);
    });

    if (currentUser) {
      const signOut = document.createElement("button");
      signOut.type = "button";
      signOut.className = "nav-action";
      signOut.textContent = "Sign out";
      signOut.addEventListener("click", () => {
        window.CCAuth.logout();
        window.location.href = "index.html";
      });
      nav.appendChild(signOut);
    } else {
      const signIn = document.createElement("a");
      signIn.href = "login.html";
      signIn.textContent = "Log in";
      nav.appendChild(signIn);

      const createAccount = document.createElement("a");
      createAccount.href = "register.html";
      createAccount.textContent = "Create Account";
      nav.appendChild(createAccount);
    }

    headerTarget.replaceWith(header);
    navTarget.replaceWith(nav);

    const summary = document.querySelector("[data-role-summary]");
    if (summary) {
      summary.textContent = currentUser
        ? "Signed in as " + currentUser.role + ". The matching role navigation is active."
        : "No active session. Sign in with one of the demo accounts to preview role navigation.";
    }
  }

  window.CCLayout = { render };
  window.CCStore.ready.then(render);
}());
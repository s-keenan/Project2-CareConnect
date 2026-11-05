(function () {
  "use strict";

  function makeSalt() {
    const bytes = new Uint8Array(16);
    if (window.crypto && window.crypto.getRandomValues) {
      window.crypto.getRandomValues(bytes);
    } else {
      for (let index = 0; index < bytes.length; index += 1) bytes[index] = Math.floor(Math.random() * 256);
    }
    return Array.from(bytes, value => value.toString(16).padStart(2, "0")).join("");
  }

  function fallbackDigest(value) {
    let first = 2166136261;
    let second = 2654435761;
    for (let index = 0; index < value.length; index += 1) {
      const code = value.charCodeAt(index);
      first = Math.imul(first ^ code, 16777619);
      second = Math.imul(second ^ (code + index), 2246822519);
    }
    return "fallback-" + (first >>> 0).toString(16).padStart(8, "0") + (second >>> 0).toString(16).padStart(8, "0");
  }

  async function hashPassword(password, salt) {
    const usedSalt = salt || makeSalt();
    const input = usedSalt + ":" + password;
    if (window.crypto && window.crypto.subtle && window.TextEncoder) {
      try {
        const bytes = new TextEncoder().encode(input);
        const digest = await window.crypto.subtle.digest("SHA-256", bytes);
        const hash = Array.from(new Uint8Array(digest), value => value.toString(16).padStart(2, "0")).join("");
        return { password_hash: "sha256-" + hash, salt: usedSalt };
      } catch (error) {
        // Some local browser contexts restrict Web Crypto; use the demo fallback.
      }
    }
    return { password_hash: fallbackDigest(input), salt: usedSalt };
  }

  function getCurrentUser() {
    try {
      const session = JSON.parse(sessionStorage.getItem("careconnect_user") || "null");
      if (!session || !session.userID || !session.role) return null;
      return { userID: session.userID, role: session.role };
    } catch (error) {
      return null;
    }
  }

  async function login(email, password, expectedRole) {
    await window.CCStore.ready;
    const normalizedEmail = String(email || "").trim().toLowerCase();
    const user = window.CCStore.read("app_user").find(record => record.email.toLowerCase() === normalizedEmail);
    if (!user) {
      throw new Error("Invalid email or password.");
    }
    if (expectedRole && user.role !== expectedRole) {
      const roleName = expectedRole === "Admin" ? "admin" : expectedRole.toLowerCase();
      const article = roleName === "applicant" || roleName === "admin" ? "an " : "a ";
      throw new Error("This account is not registered as " + article + roleName + ".");
    }
    if ((await hashPassword(password, user.salt)).password_hash !== user.password_hash) {
      throw new Error("Invalid email or password.");
    }
    if (user.account_status !== "Approved") {
      throw new Error("Your account is still pending approval.");
    }

    window.CCStore.update("app_user", user.userID, { last_login: new Date().toISOString() });
    const session = { userID: user.userID, role: user.role };
    sessionStorage.setItem("careconnect_user", JSON.stringify(session));
    return session;
  }

  async function register(role, values) {
    await window.CCStore.ready;
    const requiredFields = role === "Applicant"
      ? ["full_name", "id_number", "email", "phone", "address", "next_of_kin", "kin_relationship", "kin_phone", "password", "confirm_password"]
      : role === "Volunteer"
        ? ["full_name", "id_number", "email", "phone", "address", "availability", "preferred_time", "password", "confirm_password"]
        : null;

    if (!requiredFields) throw new Error("Choose a valid account type.");
    if (requiredFields.some(field => !String(values[field] || "").trim())) {
      throw new Error("Please fill in all required fields.");
    }
    if (values.password !== values.confirm_password) {
      throw new Error("Passwords do not match.");
    }
    if (values.password.length < 8) {
      throw new Error("Password must be at least 8 characters.");
    }

    const email = String(values.email).trim().toLowerCase();
    const duplicate = window.CCStore.read("app_user").some(user => user.email.toLowerCase() === email);
    if (duplicate) throw new Error("An account with that email already exists.");

    const credential = await hashPassword(values.password);
    const user = window.CCStore.add("app_user", {
      email,
      password_hash: credential.password_hash,
      salt: credential.salt,
      role,
      account_status: "Pending",
      created_at: new Date().toISOString(),
      last_login: null
    });

    try {
      if (role === "Applicant") {
        window.CCStore.add("applicant", {
          userID: user.userID,
          full_name: String(values.full_name).trim(),
          id_number: String(values.id_number).trim(),
          contact_number: String(values.phone).trim(),
          residential_address: String(values.address).trim(),
          next_of_kin_name: String(values.next_of_kin).trim(),
          next_of_kin_contact: String(values.kin_phone).trim(),
          medical_details: String(values.medical_details || "").trim()
        });
      } else {
        window.CCStore.add("volunteer", {
          userID: user.userID,
          full_name: String(values.full_name).trim(),
          id_number: String(values.id_number).trim(),
          contact_number: String(values.phone).trim(),
          availability_schedule: String(values.availability).trim() + " - " + String(values.preferred_time).trim(),
          tasks_completed_count: 0
        });
      }
    } catch (error) {
      window.CCStore.remove("app_user", user.userID);
      throw error;
    }

    return user;
  }

  function logout() {
    sessionStorage.removeItem("careconnect_user");
  }

  function requireRole(role) {
    const user = getCurrentUser();
    if (!user || user.role !== role) {
      window.location.href = "login.html";
      return false;
    }
    return true;
  }

  window.CCAuth = { hashPassword, login, register, logout, getCurrentUser, requireRole };
}());
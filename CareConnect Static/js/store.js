(function () {
  "use strict";

  const collections = {
    app_user: "userID",
    applicant: "applicantID",
    volunteer: "volunteerID",
    assistance_request: "requestID",
    task_assignment: "assignmentID",
    message: "messageID"
  };
  const markerKey = "careconnect_seeded_v1";
  const now = new Date();
  const day = (offset, hour) => {
    const date = new Date(now);
    date.setDate(date.getDate() + offset);
    date.setHours(hour, 0, 0, 0);
    return date.toISOString();
  };

  function read(name) {
    if (!collections[name]) throw new Error("Unknown collection: " + name);
    try {
      const value = JSON.parse(localStorage.getItem(name) || "[]");
      return Array.isArray(value) ? value : [];
    } catch (error) {
      return [];
    }
  }

  function write(name, records) {
    if (!collections[name]) throw new Error("Unknown collection: " + name);
    if (!Array.isArray(records)) throw new TypeError("Collection data must be an array.");
    localStorage.setItem(name, JSON.stringify(records));
    return records;
  }

  function add(name, record) {
    const idField = collections[name];
    if (!idField) throw new Error("Unknown collection: " + name);
    const records = read(name);
    const nextID = records.reduce((largest, item) => Math.max(largest, Number(item[idField]) || 0), 0) + 1;
    const saved = Object.assign({}, record, { [idField]: record[idField] || nextID });
    records.push(saved);
    write(name, records);
    return saved;
  }

  function update(name, id, changes) {
    const idField = collections[name];
    if (!idField) throw new Error("Unknown collection: " + name);
    const records = read(name);
    const index = records.findIndex(item => String(item[idField]) === String(id));
    if (index < 0) return null;
    records[index] = Object.assign({}, records[index], changes, { [idField]: records[index][idField] });
    write(name, records);
    return records[index];
  }

  function remove(name, id) {
    const idField = collections[name];
    if (!idField) throw new Error("Unknown collection: " + name);
    const records = read(name);
    const remaining = records.filter(item => String(item[idField]) !== String(id));
    write(name, remaining);
    return remaining.length !== records.length;
  }

  async function resetDemoData() {
    await ready;
    Object.keys(collections).forEach(name => localStorage.removeItem(name));
    localStorage.removeItem(markerKey);
    await seed();
  }

  async function seed() {
    if (localStorage.getItem(markerKey)) return;

    const account = async (userID, email, role, accountStatus) => {
      const credential = await window.CCAuth.hashPassword("CareConnect123!");
      return {
        userID,
        email,
        password_hash: credential.password_hash,
        salt: credential.salt,
        role,
        account_status: accountStatus,
        created_at: day(-12, 9),
        last_login: null
      };
    };

    const users = await Promise.all([
      account(1, "admin@careconnect.test", "Admin", "Approved"),
      account(2, "applicant@careconnect.test", "Applicant", "Approved"),
      account(3, "applicant.two@careconnect.test", "Applicant", "Approved"),
      account(4, "applicant.pending@careconnect.test", "Applicant", "Pending"),
      account(5, "volunteer@careconnect.test", "Volunteer", "Approved"),
      account(6, "volunteer.two@careconnect.test", "Volunteer", "Approved"),
      account(7, "volunteer.three@careconnect.test", "Volunteer", "Approved")
    ]);

    const records = {
      app_user: users,
      applicant: [
        { applicantID: 1, userID: 2, full_name: "Jordan Smith", id_number: "DEMO-APP-001", contact_number: "071 000 0001", residential_address: "12 Main Road, Grabouw", next_of_kin_name: "Alex Smith", next_of_kin_contact: "071 000 0101", medical_details: "Needs assistance collecting medication" },
        { applicantID: 2, userID: 3, full_name: "Maya Jones", id_number: "DEMO-APP-002", contact_number: "071 000 0002", residential_address: "45 Oak Street, Grabouw", next_of_kin_name: "Taylor Jones", next_of_kin_contact: "071 000 0102", medical_details: "" },
        { applicantID: 3, userID: 4, full_name: "Sam Dlamini", id_number: "DEMO-APP-003", contact_number: "071 000 0003", residential_address: "8 Church Street, Grabouw", next_of_kin_name: "Lee Dlamini", next_of_kin_contact: "071 000 0103", medical_details: "Limited mobility" }
      ],
      volunteer: [
        { volunteerID: 1, userID: 5, full_name: "Ari Khumalo", id_number: "DEMO-VOL-001", contact_number: "072 000 0001", availability_schedule: "Weekdays, mornings", tasks_completed_count: 4 },
        { volunteerID: 2, userID: 6, full_name: "Noah Mokoena", id_number: "DEMO-VOL-002", contact_number: "072 000 0002", availability_schedule: "Weekends", tasks_completed_count: 2 },
        { volunteerID: 3, userID: 7, full_name: "Casey Botha", id_number: "DEMO-VOL-003", contact_number: "072 000 0003", availability_schedule: "Weekday afternoons", tasks_completed_count: 6 }
      ],
      assistance_request: [
        { requestID: 1, applicantID: 1, request_type: "Grocery Shopping", preferred_date_time: day(1, 15), task_description: "Help with a weekly grocery shop.", special_instructions: "Please call before arriving.", priority: "High", status: "Pending", created_at: day(-1, 10) },
        { requestID: 2, applicantID: 2, request_type: "Medication Collection", preferred_date_time: day(2, 10), task_description: "Collect a prescription from the pharmacy.", special_instructions: "Call when outside.", priority: "Medium", status: "Accepted", created_at: day(-2, 11) },
        { requestID: 3, applicantID: 3, request_type: "Transport/Appointment", preferred_date_time: day(3, 9), task_description: "Transport to a physiotherapy appointment.", special_instructions: "Wheelchair accessible transport needed.", priority: "High", status: "In Progress", created_at: day(-3, 8) },
        { requestID: 4, applicantID: 1, request_type: "Other", preferred_date_time: day(4, 13), task_description: "Help carry a small delivery inside.", special_instructions: "", priority: "Low", status: "On the Way", created_at: day(-4, 9) },
        { requestID: 5, applicantID: 2, request_type: "Grocery Shopping", preferred_date_time: day(-1, 12), task_description: "Pick up a short grocery list.", special_instructions: "Leave items at the front door.", priority: "Medium", status: "Completed", created_at: day(-7, 9) }
      ],
      task_assignment: [
        { assignmentID: 1, requestID: 2, volunteerID: 1, accepted_at: day(-2, 12), started_at: null, completed_at: null },
        { assignmentID: 2, requestID: 3, volunteerID: 2, accepted_at: day(-3, 9), started_at: day(-1, 8), completed_at: null },
        { assignmentID: 3, requestID: 4, volunteerID: 3, accepted_at: day(-4, 10), started_at: day(0, 10), completed_at: null },
        { assignmentID: 4, requestID: 5, volunteerID: 1, accepted_at: day(-7, 10), started_at: day(-1, 11), completed_at: day(-1, 13) }
      ],
      message: [
        { messageID: 1, requestID: 2, senderID: 3, receiverID: 5, message_content: "I have the prescription details ready.", timestamp: day(-1, 10), is_read: false },
        { messageID: 2, requestID: 2, senderID: 5, receiverID: 3, message_content: "Thanks. I will confirm once it is collected.", timestamp: day(-1, 10), is_read: true },
        { messageID: 3, requestID: 3, senderID: 4, receiverID: 6, message_content: "Please confirm the appointment time.", timestamp: day(0, 8), is_read: false }
      ]
    };

    Object.keys(records).forEach(name => write(name, records[name]));
    localStorage.setItem(markerKey, "true");
  }

  const ready = seed();

  window.CCStore = {
    collections: Object.keys(collections),
    ready,
    read,
    write,
    add,
    update,
    remove,
    resetDemoData
  };
}());
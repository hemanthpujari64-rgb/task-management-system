/* ==========================================================
   TASK MANAGEMENT SYSTEM
   HTML + CSS + JavaScript only
   Authentication and application data use Local Storage.
   ========================================================== */

const USERS_KEY = "tm_users";
const TASKS_KEY = "tm_tasks";
const SESSION_KEY = "tm_session";

let currentUser = null;
let currentModule = "";

// -------------------- INITIAL DATA --------------------

function seedData() {
  let users = getUsers();

  if (!users.some(u => u.username === "admin")) {
    users.push({
      id: "U001",
      name: "System Administrator",
      username: "admin",
      password: "admin123",
      role: "admin"
    });
  }

  if (!users.some(u => u.username === "user")) {
    users.push({
      id: "U002",
      name: "Demo User",
      username: "user",
      password: "user123",
      role: "user"
    });
  }

  localStorage.setItem(USERS_KEY, JSON.stringify(users));

  if (!localStorage.getItem(TASKS_KEY)) {
    const today = new Date();
    const datePlus = days => {
      const d = new Date(today);
      d.setDate(d.getDate() + days);
      return d.toISOString().split("T")[0];
    };

    const sampleTasks = [
      {
        id: "T001",
        title: "Complete Project Report",
        description: "Prepare the final project documentation.",
        priority: "high",
        deadline: datePlus(3),
        status: "todo",
        assignedTo: "user",
        createdBy: "admin"
      },
      {
        id: "T002",
        title: "Design Dashboard",
        description: "Create the UI for the task dashboard.",
        priority: "medium",
        deadline: datePlus(1),
        status: "inprogress",
        assignedTo: "user",
        createdBy: "admin"
      },
      {
        id: "T003",
        title: "Application Testing",
        description: "Test all major application features.",
        priority: "low",
        deadline: datePlus(5),
        status: "completed",
        assignedTo: "user",
        createdBy: "admin"
      }
    ];

    localStorage.setItem(TASKS_KEY, JSON.stringify(sampleTasks));
  }
}

// -------------------- STORAGE HELPERS --------------------

function getUsers() {
  return JSON.parse(localStorage.getItem(USERS_KEY)) || [];
}

function getTasks() {
  return JSON.parse(localStorage.getItem(TASKS_KEY)) || [];
}

function saveUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function saveTasks(tasks) {
  localStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
}

function getNextId(prefix, items) {
  return prefix + String(items.length + 1).padStart(3, "0");
}

// -------------------- AUTHENTICATION --------------------

function showAuth(type) {
  const loginForm = document.getElementById("loginForm");
  const signupForm = document.getElementById("signupForm");
  const loginTab = document.getElementById("loginTab");
  const signupTab = document.getElementById("signupTab");

  if (type === "login") {
    loginForm.classList.remove("hidden");
    signupForm.classList.add("hidden");
    loginTab.classList.add("active");
    signupTab.classList.remove("active");
  } else {
    loginForm.classList.add("hidden");
    signupForm.classList.remove("hidden");
    loginTab.classList.remove("active");
    signupTab.classList.add("active");
  }

  setAuthMessage("");
}

function setAuthMessage(message, type = "error") {
  const box = document.getElementById("authMessage");
  box.textContent = message;
  box.className = "message " + (message ? type : "");
}

function signup(event) {
  event.preventDefault();

  const name = document.getElementById("signupName").value.trim();
  const username = document.getElementById("signupUsername").value.trim().toLowerCase();
  const password = document.getElementById("signupPassword").value;
  const role = document.getElementById("signupRole").value;

  if (password.length < 6) {
    setAuthMessage("Password must contain at least 6 characters.");
    return;
  }

  const users = getUsers();

  if (users.some(user => user.username === username)) {
    setAuthMessage("Username already exists.");
    return;
  }

  users.push({
    id: getNextId("U", users),
    name,
    username,
    password,
    role
  });

  saveUsers(users);
  document.getElementById("signupForm").reset();
  showAuth("login");
  setAuthMessage("Account created successfully. Please login.", "success");
}

function login(event) {
  event.preventDefault();

  const username = document.getElementById("loginUsername").value.trim().toLowerCase();
  const password = document.getElementById("loginPassword").value;

  const user = getUsers().find(
    item => item.username === username && item.password === password
  );

  if (!user) {
    setAuthMessage("Invalid username or password.");
    return;
  }

  currentUser = user;
  localStorage.setItem(SESSION_KEY, JSON.stringify(user));

  openApplication();
}

function logout() {
  localStorage.removeItem(SESSION_KEY);
  currentUser = null;
  document.getElementById("appPage").classList.add("hidden");
  document.getElementById("authPage").classList.remove("hidden");
  document.getElementById("loginForm").reset();
  showAuth("login");
}

function restoreSession() {
  const session = JSON.parse(localStorage.getItem(SESSION_KEY));

  if (!session) return;

  const validUser = getUsers().find(u => u.username === session.username);

  if (validUser) {
    currentUser = validUser;
    openApplication();
  } else {
    localStorage.removeItem(SESSION_KEY);
  }
}

function openApplication() {
  document.getElementById("authPage").classList.add("hidden");
  document.getElementById("appPage").classList.remove("hidden");

  document.getElementById("currentUser").textContent = currentUser.name;
  document.getElementById("roleBadge").textContent = currentUser.role.toUpperCase();

  document.getElementById("adminNav").classList.toggle("hidden", currentUser.role !== "admin");
  document.getElementById("userNav").classList.toggle("hidden", currentUser.role !== "user");

  navigate(currentUser.role === "admin" ? "adminDashboard" : "userDashboard");
}

// -------------------- MODULE NAVIGATION --------------------

function navigate(module) {
  currentModule = module;

  document.querySelectorAll(".nav-item[data-module]").forEach(item => {
    item.classList.toggle("active", item.dataset.module === module);
  });

  const titles = {
    adminDashboard: ["Admin Dashboard", "Monitor users, tasks and overall progress"],
    manageUsers: ["User Management", "View and manage registered users"],
    manageTasks: ["Task Management", "Manage all tasks in the system"],
    userDashboard: ["User Dashboard", "View your task progress"],
    myTasks: ["My Tasks", "View and update your assigned tasks"],
    createTask: ["Create Task", "Add a new task to the system"]
  };

  document.getElementById("pageTitle").textContent = titles[module][0];
  document.getElementById("pageSubtitle").textContent = titles[module][1];

  const content = document.getElementById("moduleContent");

  if (module === "adminDashboard") renderAdminDashboard(content);
  if (module === "manageUsers") renderUsers(content);
  if (module === "manageTasks") renderManageTasks(content);
  if (module === "userDashboard") renderUserDashboard(content);
  if (module === "myTasks") renderMyTasks(content);
  if (module === "createTask") openTaskModal();
}

// -------------------- STATISTICS --------------------

function countTasks(tasks) {
  return {
    total: tasks.length,
    todo: tasks.filter(t => t.status === "todo").length,
    inprogress: tasks.filter(t => t.status === "inprogress").length,
    completed: tasks.filter(t => t.status === "completed").length
  };
}

function statCards(stats) {
  return `
    <div class="stats">
      <div class="stat-card"><h3>Total Tasks</h3><h2>${stats.total}</h2></div>
      <div class="stat-card"><h3>Pending</h3><h2>${stats.todo}</h2></div>
      <div class="stat-card"><h3>In Progress</h3><h2>${stats.inprogress}</h2></div>
      <div class="stat-card"><h3>Completed</h3><h2>${stats.completed}</h2></div>
    </div>
  `;
}

// -------------------- ADMIN MODULE --------------------

function renderAdminDashboard(container) {
  const tasks = getTasks();
  const users = getUsers();
  const stats = countTasks(tasks);

  container.innerHTML = `
    ${statCards(stats)}
    <div class="section">
      <div class="section-header">
        <div>
          <h3>Admin Controls</h3>
          <p style="color:#777;margin-top:5px;">Manage users and tasks using the Admin Module.</p>
        </div>
        <button class="primary-btn" onclick="openTaskModal()">+ Add Task</button>
      </div>
      <div class="stats">
        <div class="stat-card"><h3>Registered Users</h3><h2>${users.length}</h2></div>
        <div class="stat-card"><h3>Admin Accounts</h3><h2>${users.filter(u => u.role === "admin").length}</h2></div>
        <div class="stat-card"><h3>User Accounts</h3><h2>${users.filter(u => u.role === "user").length}</h2></div>
        <div class="stat-card"><h3>High Priority</h3><h2>${tasks.filter(t => t.priority === "high").length}</h2></div>
      </div>
    </div>
  `;
}

function renderUsers(container) {
  const users = getUsers();

  container.innerHTML = `
    <div class="section">
      <div class="toolbar">
        <h3>Registered Users</h3>
        <input class="search" id="userSearch" placeholder="Search users..." oninput="filterUsers()">
      </div>
      <div class="table-wrap">
        <table>
          <thead><tr><th>ID</th><th>Name</th><th>Username</th><th>Role</th><th>Action</th></tr></thead>
          <tbody id="usersBody">
            ${users.map(user => `
              <tr data-user-row="${user.name.toLowerCase()} ${user.username.toLowerCase()}">
                <td>${user.id}</td>
                <td>${escapeHTML(user.name)}</td>
                <td>${escapeHTML(user.username)}</td>
                <td>${user.role.toUpperCase()}</td>
                <td>
                  ${user.username === "admin" ? "<span>Protected</span>" :
                    `<button class="small-btn delete" onclick="deleteUser('${user.username}')">Delete</button>`}
                </td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

function filterUsers() {
  const value = document.getElementById("userSearch").value.toLowerCase();
  document.querySelectorAll("[data-user-row]").forEach(row => {
    row.style.display = row.dataset.userRow.includes(value) ? "" : "none";
  });
}

function deleteUser(username) {
  if (username === "admin") return;

  if (!confirm("Delete this user? Assigned tasks will remain in the system.")) return;

  const users = getUsers().filter(user => user.username !== username);
  saveUsers(users);
  renderUsers(document.getElementById("moduleContent"));
}

// -------------------- TASK MANAGEMENT --------------------

function renderManageTasks(container) {
  const tasks = getTasks();

  container.innerHTML = `
    <div class="section">
      <div class="toolbar">
        <h3>All Tasks</h3>
        <div>
          <input class="search" id="taskSearch" placeholder="Search tasks..." oninput="renderTaskTable()">
          <button class="primary-btn" onclick="openTaskModal()">+ Add Task</button>
        </div>
      </div>
      <div id="taskTableArea"></div>
    </div>
  `;

  renderTaskTable();
}

function renderTaskTable() {
  const area = document.getElementById("taskTableArea");
  if (!area) return;

  const search = (document.getElementById("taskSearch")?.value || "").toLowerCase();
  const tasks = getTasks().filter(task =>
    (task.title + " " + task.description + " " + task.assignedTo)
      .toLowerCase().includes(search)
  );

  area.innerHTML = tasks.length ? `
    <div class="table-wrap">
      <table>
        <thead><tr><th>Title</th><th>Assigned To</th><th>Priority</th><th>Deadline</th><th>Status</th><th>Actions</th></tr></thead>
        <tbody>
          ${tasks.map(task => `
            <tr>
              <td>${escapeHTML(task.title)}</td>
              <td>${escapeHTML(task.assignedTo)}</td>
              <td><span class="priority ${task.priority}">${task.priority.toUpperCase()}</span></td>
              <td>${task.deadline}</td>
              <td>${statusLabel(task.status)}</td>
              <td>
                <button class="small-btn" onclick="editTask('${task.id}')">Edit</button>
                <button class="small-btn delete" onclick="deleteTask('${task.id}')">Delete</button>
              </td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    </div>
  ` : `<div class="empty">No tasks found.</div>`;
}

function renderUserDashboard(container) {
  const tasks = getTasks().filter(t => t.assignedTo === currentUser.username);
  const stats = countTasks(tasks);

  container.innerHTML = `
    ${statCards(stats)}
    <div class="section">
      <div class="section-header">
        <div>
          <h3>My Work</h3>
          <p style="color:#777;margin-top:5px;">Tasks assigned to ${escapeHTML(currentUser.name)}.</p>
        </div>
        <button class="primary-btn" onclick="navigate('createTask')">+ Add Task</button>
      </div>
      ${taskBoardHTML(tasks)}
    </div>
  `;
}

function renderMyTasks(container) {
  const tasks = getTasks().filter(t => t.assignedTo === currentUser.username);

  container.innerHTML = `
    <div class="section">
      <div class="toolbar">
        <h3>My Tasks</h3>
        <input class="search" id="myTaskSearch" placeholder="Search tasks..." oninput="filterMyTasks()">
      </div>
      <div id="myTaskBoard">${taskBoardHTML(tasks)}</div>
    </div>
  `;
}

function filterMyTasks() {
  const value = document.getElementById("myTaskSearch").value.toLowerCase();
  const tasks = getTasks().filter(t =>
    t.assignedTo === currentUser.username &&
    (t.title + " " + t.description).toLowerCase().includes(value)
  );
  document.getElementById("myTaskBoard").innerHTML = taskBoardHTML(tasks);
}

function taskBoardHTML(tasks) {
  const columns = [
    ["todo", "📌 To Do"],
    ["inprogress", "⚙️ In Progress"],
    ["completed", "✅ Completed"]
  ];

  return `
    <div class="task-board">
      ${columns.map(([status, title]) => `
        <div class="task-column">
          <h3>${title}</h3>
          ${tasks.filter(t => t.status === status).map(taskCardHTML).join("") ||
            `<div class="empty">No tasks</div>`}
        </div>
      `).join("")}
    </div>
  `;
}

function taskCardHTML(task) {
  const canEdit = currentUser.role === "admin" || task.assignedTo === currentUser.username;

  return `
    <div class="task-card">
      <span class="priority ${task.priority}">${task.priority.toUpperCase()}</span>
      <h4>${escapeHTML(task.title)}</h4>
      <p>${escapeHTML(task.description)}</p>
      <div class="task-meta">📅 ${task.deadline}<br>👤 ${escapeHTML(task.assignedTo)}</div>
      ${canEdit ? `
        <div class="task-actions">
          <button class="small-btn" onclick="editTask('${task.id}')">Edit</button>
          ${currentUser.role === "admin" ? `<button class="small-btn delete" onclick="deleteTask('${task.id}')">Delete</button>` : ""}
        </div>
      ` : ""}
    </div>
  `;
}

function statusLabel(status) {
  return {
    todo: "To Do",
    inprogress: "In Progress",
    completed: "Completed"
  }[status] || status;
}

// -------------------- ADD / EDIT TASK --------------------

function populateAssignees(selected = "") {
  const select = document.getElementById("taskAssignee");
  const users = getUsers().filter(u => u.role === "user");

  select.innerHTML = users.map(user =>
    `<option value="${escapeHTML(user.username)}" ${user.username === selected ? "selected" : ""}>
      ${escapeHTML(user.name)} (${escapeHTML(user.username)})
    </option>`
  ).join("");

  if (currentUser.role === "user") {
    select.innerHTML = `<option value="${escapeHTML(currentUser.username)}">${escapeHTML(currentUser.name)}</option>`;
    select.disabled = true;
  } else {
    select.disabled = false;
  }
}

function openTaskModal(task = null) {
  document.getElementById("taskModal").classList.remove("hidden");
  document.getElementById("modalTitle").textContent = task ? "Edit Task" : "Add Task";
  document.getElementById("editTaskId").value = task ? task.id : "";
  document.getElementById("taskTitle").value = task ? task.title : "";
  document.getElementById("taskDescription").value = task ? task.description : "";
  document.getElementById("taskPriority").value = task ? task.priority : "medium";
  document.getElementById("taskDeadline").value = task ? task.deadline : "";
  document.getElementById("taskStatus").value = task ? task.status : "todo";

  document.getElementById("assignField").classList.remove("hidden");
  populateAssignees(task ? task.assignedTo : currentUser.username);

  if (currentUser.role === "user") {
    document.getElementById("taskStatus").value = task ? task.status : "todo";
  }
}

function closeTaskModal() {
  document.getElementById("taskModal").classList.add("hidden");
}

function saveTask(event) {
  event.preventDefault();

  const tasks = getTasks();
  const editId = document.getElementById("editTaskId").value;
  const title = document.getElementById("taskTitle").value.trim();
  const description = document.getElementById("taskDescription").value.trim();
  const priority = document.getElementById("taskPriority").value;
  const deadline = document.getElementById("taskDeadline").value;
  const status = document.getElementById("taskStatus").value;
  const assignedTo = document.getElementById("taskAssignee").value;

  if (!title || !description || !deadline || !assignedTo) {
    alert("Please fill all required fields.");
    return;
  }

  if (editId) {
    const task = tasks.find(t => t.id === editId);

    if (!task) return;

    task.title = title;
    task.description = description;
    task.priority = priority;
    task.deadline = deadline;
    task.status = status;

    if (currentUser.role === "admin") {
      task.assignedTo = assignedTo;
    }
  } else {
    tasks.push({
      id: getNextId("T", tasks),
      title,
      description,
      priority,
      deadline,
      status,
      assignedTo,
      createdBy: currentUser.username
    });
  }

  saveTasks(tasks);
  closeTaskModal();
  refreshCurrentModule();
}

function editTask(id) {
  const task = getTasks().find(t => t.id === id);

  if (!task) return;

  if (currentUser.role !== "admin" && task.assignedTo !== currentUser.username) {
    alert("You can only edit your assigned tasks.");
    return;
  }

  openTaskModal(task);
}

function deleteTask(id) {
  const task = getTasks().find(t => t.id === id);

  if (!task) return;

  if (currentUser.role !== "admin") {
    alert("Only Admin can delete tasks.");
    return;
  }

  if (!confirm("Delete this task?")) return;

  saveTasks(getTasks().filter(t => t.id !== id));
  refreshCurrentModule();
}

function refreshCurrentModule() {
  navigate(currentModule);
}

// -------------------- UTILITY --------------------

function escapeHTML(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

// -------------------- START APPLICATION --------------------

seedData();
restoreSession();

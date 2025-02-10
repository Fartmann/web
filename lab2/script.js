const API_URL = "http://localhost:3000";

//user registration
async function register() {
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    const res = await fetch(`${API_URL}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
    });

    const data = await res.json();
    alert(data.message || data.error);
}

//user login
async function login() {
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    const res = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
    });

    const data = await res.json();
    if (res.ok) {
        localStorage.setItem("token", data.token);
        alert("Login successful!");
        document.getElementById("taskSection").style.display = "block";
        loadTasks();
    } else {
        alert("Error: " + data.error);
    }
}

//logout
function logout() {
    localStorage.removeItem("token");
    alert("Logged out");
    document.getElementById("taskSection").style.display = "none";
}

//load all tasks
async function loadTasks() {
    const token = localStorage.getItem("token");
    const res = await fetch(`${API_URL}/tasks`, {
        headers: { "Authorization": `Bearer ${token}` }
    });

    const data = await res.json();
    if (res.ok) {
        const list = document.getElementById("taskList");
        list.innerHTML = "";
        data.forEach(task => {
            list.innerHTML += `
                <li>
                    <span>${task.title} - ${task.description}</span>
                    <button onclick="editTask('${task._id}', '${task.title}', '${task.description}')">Edit</button>
                    <button onclick="deleteTask('${task._id}')">Delete</button>
                </li>
            `;
        });
    } else {
        alert("Error: " + data.error);
    }
}

//create new task
async function addTask() {
    const title = document.getElementById("taskTitle").value;
    const description = document.getElementById("taskDesc").value;
    const token = localStorage.getItem("token");

    const res = await fetch(`${API_URL}/tasks`, {
        method: "POST",
        headers: { 
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ title, description })
    });

    const data = await res.json();
    if (res.ok) {
        alert("Task added!");
        loadTasks();
    } else {
        alert("Error: " + data.error);
    }
}

//edit tasks
function editTask(id, oldTitle, oldDesc) {
    const newTitle = prompt("Edit title:", oldTitle);
    const newDesc = prompt("Edit description:", oldDesc);
    if (newTitle !== null && newDesc !== null) {
        updateTask(id, newTitle, newDesc);
    }
}

//update tasks
async function updateTask(id, title, description) {
    const token = localStorage.getItem("token");

    const res = await fetch(`${API_URL}/tasks/${id}`, {
        method: "PUT",
        headers: { 
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ title, description })
    });

    const data = await res.json();
    if (res.ok) {
        alert("Task updated!");
        loadTasks();
    } else {
        alert("Error: " + data.error);
    }
}

//delete some tasks
async function deleteTask(id) {
    const token = localStorage.getItem("token");

    const res = await fetch(`${API_URL}/tasks/${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
    });

    const data = await res.json();
    if (res.ok) {
        alert("Task deleted!");
        loadTasks();
    } else {
        alert("Error: " + data.error);
    }
}

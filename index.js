const express = require("express");

const app = express();
const port = 3000;
app.use(cors());
app.use(express.json());

const tasks = [
  {
    id: 1,
    title: "Fix a critical bug",
    project: "Project Alpha",
    assignedTo: "Bob",
    priority: "high",
    status: "open",
  },
  {
    id: 2,
    title: "Implement a new feature",
    project: "Project Alpha",
    assignedTo: "Charlie",
    priority: "medium",
    status: "in progress",
  },
  {
    id: 3,
    title: "Write documentation",
    project: "Project Beta",
    assignedTo: "Bob",
    priority: "low",
    status: "open",
  },
];

// 2 a. View All Tasks for a Project:
function filterByProject(projectName) {
  return tasks.filter(
    (task) => task.project.toLowerCase() === projectName.toLowerCase()
  );
}
app.get("/projects/:name/tasks", (req, res) => {
  const projectName = req.params.name;
  const projectTasks = filterByProject(projectName);
  res.json(projectTasks);
});

// 2 b. Sort Tasks by Project Size:
function sortByTaskSize() {
  const projectTaskCount = {};
  //   Number of tasks by a project
  tasks.forEach((task) => {
    if (projectTaskCount[task.project]) {
      projectTaskCount[task.project]++;
    } else {
      projectTaskCount[task.project] = 1;
    }
  });

  // Converting object to array
  const projectTasksArray = Object.keys(projectTaskCount).map((project) => {
    return { project, taskCount: projectTaskCount[project] };
  });

  // Sorting by task count
  projectTasksArray.sort((a, b) => b.taskCount - a.taskCount);

  return projectTasksArray;
}
app.get("/projects/sort/by-task-size", (req, res) => {
  const sortedTasks = sortByTaskSize();
  res.json(sortedTasks);
});

// 2 c.  Add new Task
function validateTask(title, project, assignedTo, priority, status) {
  if (!title && typeof title !== "string") {
    return "Title is required and must be a string";
  }
  if (!project && typeof project !== "string") {
    return "Project is required and must be a string";
  }
  if (!assignedTo && typeof assignedTo !== "string") {
    return "Assigned to is required and must be a string";
  }
  if (!priority && typeof priority !== "string") {
    return "Priority is required and must be a string";
  }
  if (!status && typeof status !== "string") {
    return "Status is required and must be a string";
  }
}
function addTask(data) {
  const { title, project, assignedTo, priority, status } = data;
  const newId = tasks.length + 1;

  const newTask = {
    id: newId,
    title,
    project,
    assignedTo,
    priority,
    status,
  };
  tasks.push(newTask);
  return newTask;
}
app.get("/tasks", (req, res) => {
  const { title, project, assignedTo, priority, status } = req.query;
  const error = validateTask(title, project, assignedTo, priority, status);
  if (error) {
    return res.status(400).json({ message: error });
  }
  const newTask = addTask(req.query);
  res.status(201).json({ message: "Task added successfully", task: newTask });
});

// 1  View All tasks assignes to a person
function getTasksAssignedbyName(name) {
  return tasks.filter((task) => task.assignedTo.toLowerCase() === name);
}

app.get("/users/:name/tasks", (req, res) => {
  const name = req.params.name.toLowerCase();
  const tasksAssignedToUser = getTasksAssignedbyName(name);
  res.json(tasksAssignedToUser);
});

// View Pending Tasks:
function getTasksByStatus(status) {
  return tasks.filter((task) => task.status === status);
}
app.get("/tasks/pending", (req, res) => {
  let status = req.query.status;
  status = status.toLowerCase();
  const pendingTasks = getTasksByStatus(status);
  res.json(pendingTasks);
});

function getSortedTasksByPriority() {
  return tasks.sort((t1, t2) => {
    return t1.priority > t2.priority;
  });
}
app.get("/tasks/sort/by-priority", (req, res) => {
  const sortedTasks = getSortedTasksByPriority();
  res.json(sortedTasks);
});

function updateTaskById(id, status) {
  for (let i = 0; i < tasks.length; i++) {
    if (tasks[i].id === id) {
      tasks[i].status = status;
      break;
    }
  }
  return tasks.find((task) => task.id === id);
}
app.post("/tasks/:id/status", (req, res) => {
  const status = req.body.status;
  const id = parseInt(req.params.id);
  const updatedTask = updateTaskById(id, status);
  res
    .status(200)
    .json({ message: "Updated Successfully", updatedTask: updatedTask });
});
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

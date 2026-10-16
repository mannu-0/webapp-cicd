const express = require("express");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 5002;

app.use(cors());
app.use(express.json());

let tasks = [
  { id: 1, title: "Learn Docker", completed: false },
  { id: 2, title: "Build Jenkins Pipeline", completed: false }
];

let nextId = 3;

app.get("/health", (req, res) => {
  res.json({
    status: "healthy",
    application: "Task Manager API"
  });
});

app.get("/api/tasks", (req, res) => {
  res.json(tasks);
});

app.post("/api/tasks", (req, res) => {
  const title = req.body.title;

  if (typeof title !== "string" || !title.trim()) {
    return res.status(400).json({
      error: "Task title is required"
    });
  }

  const task = {
    id: nextId++,
    title: title.trim(),
    completed: false
  };

  tasks.push(task);
  res.status(201).json(task);
});

app.patch("/api/tasks/:id", (req, res) => {
  const task = tasks.find(
    (item) => item.id === Number(req.params.id)
  );

  if (!task) {
    return res.status(404).json({ error: "Task not found" });
  }

  if (typeof req.body.completed !== "boolean") {
    return res.status(400).json({
      error: "completed must be true or false"
    });
  }

  task.completed = req.body.completed;
  res.json(task);
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Task Manager API running on port ${PORT}`);
});

const { test, before, after } = require("node:test");
const assert = require("node:assert/strict");
const { app } = require("./server");

let server;
let baseUrl;

before(async () => {
  server = app.listen(0, "127.0.0.1");

  await new Promise((resolve, reject) => {
    server.once("listening", resolve);
    server.once("error", reject);
  });

  baseUrl = `http://127.0.0.1:${server.address().port}`;
});

after(async () => {
  await new Promise((resolve, reject) => {
    server.close((err) => err ? reject(err) : resolve());
  });
});

test("GET /health returns healthy status", async () => {
  const response = await fetch(`${baseUrl}/health`);
  const data = await response.json();

  assert.equal(response.status, 200);
  assert.equal(data.status, "healthy");
  assert.equal(data.application, "Task Manager API");
});

test("GET /api/tasks returns the task list", async () => {
  const response = await fetch(`${baseUrl}/api/tasks`);
  const data = await response.json();

  assert.equal(response.status, 200);
  assert.ok(Array.isArray(data));
  assert.ok(data.length >= 2);
});

test("POST /api/tasks creates a task", async () => {
  const response = await fetch(`${baseUrl}/api/tasks`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title: "Automated test task" })
  });

  const data = await response.json();

  assert.equal(response.status, 201);
  assert.equal(data.title, "Automated test task");
  assert.equal(data.completed, false);
});

test("POST /api/tasks rejects an empty title", async () => {
  const response = await fetch(`${baseUrl}/api/tasks`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title: "   " })
  });

  const data = await response.json();

  assert.equal(response.status, 400);
  assert.equal(data.error, "Task title is required");
});

test("PATCH /api/tasks rejects an unknown task ID", async () => {
  const response = await fetch(`${baseUrl}/api/tasks/99999`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ completed: true })
  });

  assert.equal(response.status, 404);
});

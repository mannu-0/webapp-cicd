import { useCallback, useEffect, useState } from "react";
import "./App.css";

const API = "/api/tasks";

function App() {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadTasks = useCallback(async () => {
    try {
      setError("");
      const response = await fetch(API);
      if (!response.ok) throw new Error("Could not load tasks");
      setTasks(await response.json());
    } catch {
      setError("Backend se connect nahi ho pa raha. API check karo.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  async function addTask(event) {
    event.preventDefault();
    if (!title.trim()) return;

    try {
      setError("");
      const response = await fetch(API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title }),
      });

      if (!response.ok) throw new Error("Could not add task");

      const task = await response.json();
      setTasks((current) => [...current, task]);
      setTitle("");
    } catch {
      setError("Task add nahi hua. Backend check karo.");
    }
  }

  async function toggleTask(task) {
    try {
      setError("");
      const response = await fetch(`${API}/${task.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed: !task.completed }),
      });

      if (!response.ok) throw new Error("Could not update task");

      const updated = await response.json();
      setTasks((current) =>
        current.map((item) => item.id === updated.id ? updated : item)
      );
    } catch {
      setError("Task update nahi hua. Backend check karo.");
    }
  }

  const completed = tasks.filter((task) => task.completed).length;
  const pending = tasks.length - completed;
  const progress = tasks.length
    ? Math.round((completed / tasks.length) * 100)
    : 0;

  return (
    <main className="app-shell">
      <header className="topbar">
        <a className="brand" href="#">
          <span className="brand-icon">✓</span>
          TaskFlow<span className="brand-dot">.</span>
        </a>
        <span className="status"><i /> Local API</span>
      </header>

      <section className="hero">
        <p className="eyebrow">YOUR PERSONAL WORKSPACE</p>
        <h1>Make today <span>count.</span></h1>
        <p className="subtitle">
          Small steps every day lead to big results.
        </p>
      </section>

      <section className="stats">
        <article className="stat-card">
          <span>Total tasks</span>
          <strong>{tasks.length}</strong>
          <small>All your tasks</small>
        </article>
        <article className="stat-card">
          <span>In progress</span>
          <strong>{pending}</strong>
          <small>Still to do</small>
        </article>
        <article className="stat-card">
          <span>Completed</span>
          <strong>{completed}</strong>
          <small>Tasks finished</small>
        </article>
      </section>

      <section className="workspace">
        <div className="section-heading">
          <div>
            <p className="eyebrow">STAY ORGANIZED</p>
            <h2>Your tasks</h2>
          </div>
          <span className="task-count">{tasks.length} tasks</span>
        </div>

        <form className="add-form" onSubmit={addTask}>
          <input
            aria-label="New task title"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="What needs to get done?"
            maxLength={200}
          />
          <button type="submit">+ Add task</button>
        </form>

        {error && <p className="error-message">{error}</p>}

        <div className="progress-heading">
          <span>Overall progress</span>
          <strong>{progress}%</strong>
        </div>
        <div
          className="progress-track"
          role="progressbar"
          aria-valuenow={progress}
          aria-valuemin="0"
          aria-valuemax="100"
        >
          <div className="progress-fill" style={{ width: `${progress}%` }} />
        </div>

        {loading ? (
          <p className="empty-state">Loading your tasks...</p>
        ) : tasks.length === 0 ? (
          <p className="empty-state">No tasks yet. Add your first task above.</p>
        ) : (
          <div className="task-list">
            {tasks.map((task) => (
              <article className="task-row" key={task.id}>
                <button
                  type="button"
                  className={`check-button ${task.completed ? "checked" : ""}`}
                  onClick={() => toggleTask(task)}
                  aria-label={task.completed ? "Mark incomplete" : "Mark complete"}
                  title={task.completed ? "Mark incomplete" : "Mark complete"}
                >
                  {task.completed ? "✓" : ""}
                </button>
                <span className={task.completed ? "task-title done" : "task-title"}>
                  {task.title}
                </span>
                <span className={`task-badge ${task.completed ? "badge-done" : ""}`}>
                  {task.completed ? "Done" : "Pending"}
                </span>
              </article>
            ))}
          </div>
        )}
      </section>

      <footer>
        <span>TaskFlow © 2026</span>
        <span>Built with React + Express</span>
      </footer>
    </main>
  );
}

export default App;

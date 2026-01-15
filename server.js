import express from "express";
import fs from "fs";
import { execSync } from "child_process";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const STATE_FILE = "./state.json";
const PUBLIC_DIR = path.join(__dirname, "public");

/* ---------- util ---------- */

function loadState() {
  return fs.existsSync(STATE_FILE)
    ? JSON.parse(fs.readFileSync(STATE_FILE))
    : { current: 0 };
}

function saveState(state) {
  fs.writeFileSync(STATE_FILE, JSON.stringify(state));
}

function render() {
  execSync("node render.js", { stdio: "inherit" });
}

/* ---------- 初回レンダリング ---------- */
render();

/* ---------- API ---------- */

app.post("/next", (req, res) => {
  const state = loadState();
  state.current++;
  saveState(state);
  render();
  res.send("ok");
});

app.post("/prev", (req, res) => {
  const state = loadState();
  state.current = Math.max(0, state.current - 1);
  saveState(state);
  render();
  res.send("ok");
});

app.post("/goto/:num", (req, res) => {
  const num = parseInt(req.params.num, 10);
  if (isNaN(num) || num < 0) {
    return res.status(400).send("invalid number");
  }
  const state = loadState();
  state.current = num;
  saveState(state);
  render();
  res.send("ok");
});

/* ---------- HTML 配信 ---------- */

app.use(express.static(PUBLIC_DIR));

/* ---------- 起動 ---------- */

app.listen(8080, () => {
  console.log("Viewer: http://localhost:8080");
});

import express from "express";
import fs from "fs";
import { execSync } from "child_process";

const app = express();
const STATE_FILE = "./state.json";

/* -------------------------
   起動時 state
   themeだけ引き継ぐ
------------------------- */
function loadStartupState() {
  if (!fs.existsSync(STATE_FILE)) {
    return { current: 0, theme: "purple" };
  }
  try {
    const raw = JSON.parse(fs.readFileSync(STATE_FILE, "utf8"));
    return {
      current: 0,
      theme: typeof raw.theme === "string" ? raw.theme : "purple"
    };
  } catch {
    return { current: 0, theme: "purple" };
  }
}

function loadState() {
  if (!fs.existsSync(STATE_FILE)) {
    return { current: 0, theme: "purple" };
  }
  try {
    const raw = JSON.parse(fs.readFileSync(STATE_FILE, "utf8"));
    return {
      current: Number.isInteger(raw.current) ? raw.current : 0,
      theme: typeof raw.theme === "string" ? raw.theme : "purple"
    };
  } catch {
    return { current: 0, theme: "purple" };
  }
}

function saveState(state) {
  fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
}

function render() {
  execSync("node render.js", { stdio: "inherit" });
}

/* 起動時 */
const startupState = loadStartupState();
saveState(startupState);
render();

/* API */
app.post("/next", (req, res) => {
  const s = loadState();
  s.current++;
  saveState(s);
  render();
  res.send("ok");
});

app.post("/prev", (req, res) => {
  const s = loadState();
  s.current = Math.max(0, s.current - 1);
  saveState(s);
  render();
  res.send("ok");
});

app.post("/theme/:name", (req, res) => {
  const s = loadState();
  s.theme = req.params.name;
  saveState(s);
  render();
  res.send("ok");
});

/* ★ キャッシュ禁止で静的配信 */
app.use(
  express.static("public", {
    setHeaders: (res) => {
      res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate");
      res.setHeader("Pragma", "no-cache");
      res.setHeader("Expires", "0");
    }
  })
);

app.listen(8080, () => {
  console.log("Viewer: http://localhost:8080");
});

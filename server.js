import express from "express";
import fs from "fs";
import { execSync } from "child_process";
import path from "path";

const app = express();
const STATE_FILE = "./state.json";
const MD_FILE = "./md/topic.md";
const PUBLIC_DIR = path.join(process.cwd(), "public");
const INDEX_HTML = path.join(PUBLIC_DIR, "index.html");

/* -------------------------
   state load
------------------------- */
function loadState() {
  try {
    const raw = JSON.parse(fs.readFileSync(STATE_FILE, "utf8"));
    return {
      current: Number.isInteger(raw.current) ? raw.current : 0,
      theme: typeof raw.theme === "string" ? raw.theme : "aotori",
      showAd: typeof raw.showAd === "boolean" ? raw.showAd : true
    };
  } catch {
    return { current: 0, theme: "aotori", showAd: true };
  }
}

/* -------------------------
   state save
------------------------- */
function saveState(state) {
  fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
}

/* -------------------------
   render
------------------------- */
let lastRender = 0;
function render() {
  const now = Date.now();
  if (now - lastRender < 100) return;
  lastRender = now;
  execSync("node render.js");
}

/* -------------------------
   startup
------------------------- */
const startupState = loadState();
startupState.current = 0;
saveState(startupState);
render();

/* -------------------------
   markdown polling
------------------------- */
let lastMtime = 0;
setInterval(() => {
  try {
    const stat = fs.statSync(MD_FILE);
    if (stat.mtimeMs !== lastMtime) {
      lastMtime = stat.mtimeMs;
      render();
    }
  } catch {}
}, 500);

/* -------------------------
   API
------------------------- */
app.post("/next", (_, res) => {
  const s = loadState();
  s.current++;
  saveState(s);
  res.send("ok");
});

app.post("/prev", (_, res) => {
  const s = loadState();
  s.current = Math.max(0, s.current - 1);
  saveState(s);
  res.send("ok");
});

app.post("/theme/:name", (req, res) => {
  const s = loadState();
  s.theme = req.params.name;
  saveState(s);
  render(); // テーマ変更時のみHTML再生成
  res.send("ok");
});

app.post("/ad/toggle", (_, res) => {
  const s = loadState();
  s.showAd = !s.showAd;
  saveState(s);
  res.send("ok");
});

/* -------------------------
   state.json serve
------------------------- */
app.get("/state.json", (_, res) => {
  res.setHeader("Cache-Control", "no-store");
  res.sendFile(path.join(process.cwd(), "state.json"));
});

/* -------------------------
   index.html HEAD (mtime)
------------------------- */
app.head("/", (_, res) => {
  try {
    const stat = fs.statSync(INDEX_HTML);
    res.setHeader("Last-Modified", stat.mtime.toUTCString());
  } catch {}
  res.status(200).end();
});

/* -------------------------
   static serve
------------------------- */
app.use(express.static(PUBLIC_DIR, {
  setHeaders: res => {
    res.setHeader("Cache-Control", "no-store");
  }
}));

/* -------------------------
   listen
------------------------- */
app.listen(8080, () => {
  console.log("Viewer running at http://localhost:8080");
});

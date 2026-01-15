import express from "express";
import fs from "fs";
import { execSync } from "child_process";

const app = express();
const STATE_FILE = "./state.json";

/* -------------------------
   state の安全なロード
   （theme だけ復元対象）
------------------------- */
function loadStateForStartup() {
  if (!fs.existsSync(STATE_FILE)) {
    return { current: 0, theme: "purple" };
  }

  try {
    const raw = JSON.parse(fs.readFileSync(STATE_FILE, "utf8"));
    return {
      current: 0, // ★ 起動時は必ずリセット
      theme: typeof raw.theme === "string" ? raw.theme : "purple"
    };
  } catch {
    return { current: 0, theme: "purple" };
  }
}

/* -------------------------
   通常操作用 state ロード
------------------------- */
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

/* -------------------------
   state 保存
------------------------- */
function saveState(state) {
  fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
}

/* -------------------------
   HTML 再生成
------------------------- */
function render() {
  execSync("node render.js", { stdio: "inherit" });
}

/* -------------------------
   起動時処理
   - theme だけ引き継ぐ
   - current は必ず 0
------------------------- */
const startupState = loadStateForStartup();
saveState(startupState);
render();

/* -------------------------
   API
------------------------- */
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

/* -------------------------
   静的ファイル配信
------------------------- */
app.use(express.static("public"));

/* -------------------------
   起動
------------------------- */
app.listen(8080, () => {
  console.log("Viewer: http://localhost:8080");
});

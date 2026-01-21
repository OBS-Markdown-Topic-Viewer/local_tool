import fs from "fs";

/* -------------------------
   state / theme
------------------------- */
const state = JSON.parse(fs.readFileSync("./state.json", "utf8"));
const theme = state.theme || "aotori";

/* -------------------------
   markdown load
------------------------- */
const src = fs.readFileSync("./md/topic.md", "utf8");
const lines = src.split("\n");

let title = "";
let index = -1;
let inAd = false;
let ad = {};
const blocks = [];

/* -------------------------
   markdown parse
------------------------- */
for (const line of lines) {
  if (line.startsWith("# ")) {
    title = line.slice(2).trim();
    continue;
  }

  if (line.startsWith(":::ad")) {
    inAd = true;
    ad = {
      bg: line.match(/bg=([#A-Za-z0-9]+)/)?.[1] || "#ffffff"
    };
    continue;
  }

  if (line === ":::") {
    blocks.push({ type: "ad", ...ad });
    inAd = false;
    ad = {};
    continue;
  }

  if (inAd) {
    if (line.startsWith("画像:")) ad.image = line.replace("画像:", "").trim();
    if (line.startsWith("動画:")) ad.video = line.replace("動画:", "").trim();
    if (line.startsWith("YouTube:")) ad.youtube = line.replace("YouTube:", "").trim();
    if (line.startsWith("テキスト:")) ad.text = line.replace("テキスト:", "").trim();
    continue;
  }

  if (line.startsWith("## ")) {
    blocks.push({ type: "h2", text: line.slice(3).trim() });
    continue;
  }

  if (line.startsWith("- ")) {
    const text = line.slice(2).trim();
    if (!text) continue;
    index++;
    blocks.push({ type: "item", text, index });
  }
}

/* -------------------------
   css load
------------------------- */
const css =
  fs.readFileSync("./styles/base.css", "utf8") +
  fs.readFileSync(`./styles/theme-${theme}.css`, "utf8");

/* -------------------------
   html render
------------------------- */
const html = `
<!doctype html>
<html>
<head>
<meta charset="utf-8">
<style>${css}</style>
</head>
<body data-theme="${theme}">
<div class="topic-board">
  <div class="board-title">${title}</div>
  <ul class="topic-list">
    ${blocks.map(b => {
      if (b.type === "h2") return "<h2>" + b.text + "</h2>";

      if (b.type === "item") {
        return "<li class='topic-item' data-index='" + b.index + "'>" + b.text + "</li>";
      }

      if (b.type === "ad") {
        let media = "";
        if (b.image) media = "<img src='" + b.image + "'>";
        if (b.video) media = "<video src='" + b.video + "' autoplay muted loop playsinline></video>";

        return (
          "<div class='ad-block' style='background:" + b.bg + ";" +
          (state.showAd ? "" : "display:none;") +
          "'>" +
          media +
          (b.text ? "<div class='ad-text'>" + b.text + "</div>" : "") +
          "</div>"
        );
      }

      return "";
    }).join("")}
  </ul>
</div>

<script>
let lastStateText = "";
let lastTheme = document.body.dataset.theme;
let lastModified = null;

function activeCount(mode) {
  if (mode === "triple") return 3;
  if (mode === "double") return 2;
  return 1;
}

/* -------------------------
   state sync
------------------------- */
async function syncState() {
  try {
    const res = await fetch("/state.json?_=" + Date.now());
    const text = await res.text();
    if (text !== lastStateText) {
      lastStateText = text;
      const state = JSON.parse(text);

      const count = activeCount(state.cursorMode);
      const cursors = state.current.slice(0, count);

      document.querySelectorAll(".topic-item").forEach(el => {
        const idx = Number(el.dataset.index);
        el.classList.remove("current", "current-2", "current-3");

        if (idx === cursors[0]) el.classList.add("current");
        if (idx === cursors[1]) el.classList.add("current-2");
        if (idx === cursors[2]) el.classList.add("current-3");
      });

      document.querySelectorAll(".ad-block").forEach(el => {
        el.style.display = state.showAd ? "" : "none";
      });

      if (state.theme !== lastTheme) {
        location.reload();
      }
    }
  } catch {}
}

/* -------------------------
   index.html 更新検知
------------------------- */
async function watchIndex() {
  try {
    const res = await fetch("/", { method: "HEAD" });
    const lm = res.headers.get("Last-Modified");
    if (lastModified && lm && lm !== lastModified) {
      location.reload();
    }
    lastModified = lm;
  } catch {}
}

setInterval(() => {
  syncState();
  watchIndex();
}, 500);
</script>
</body>
</html>
`;

fs.mkdirSync("./public", { recursive: true });
fs.writeFileSync("./public/index.html", html);

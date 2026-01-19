import fs from "fs";

const state = JSON.parse(fs.readFileSync("./state.json", "utf8"));
const theme = state.theme || "aotori";

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
    ad = { bg: line.match(/bg=([#A-Za-z0-9]+)/)?.[1] || "#ffffff" };
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
      if (b.type === "item")
        return "<li class='topic-item' data-index='" + b.index + "'>" + b.text + "</li>";
      if (b.type === "ad")
        return "<div class='ad-block' style='background:" + b.bg + "'>" +
               (b.image ? "<img src='" + b.image + "'>" : "") +
               (b.text ? "<div class='ad-text'>" + b.text + "</div>" : "") +
               "</div>";
      return "";
    }).join("")}
  </ul>
</div>

<script>
let lastState = "";
let lastHtmlTime = null;

/* -------------------------
   state sync
------------------------- */
async function syncState() {
  try {
    const res = await fetch("/state.json?_=" + Date.now());
    const text = await res.text();
    if (text !== lastState) {
      lastState = text;
      const state = JSON.parse(text);

      document.querySelectorAll(".topic-item").forEach(el => {
        el.classList.toggle(
          "current",
          Number(el.dataset.index) === state.current
        );
      });

      document.querySelectorAll(".ad-block").forEach(el => {
        el.style.display = state.showAd ? "" : "none";
      });
    }
  } catch {}
}

/* -------------------------
   html update detect
------------------------- */
async function checkHtmlUpdate() {
  try {
    const res = await fetch("/", { method: "HEAD" });
    const lm = res.headers.get("Last-Modified");
    if (lastHtmlTime && lm !== lastHtmlTime) {
      location.reload();
    }
    lastHtmlTime = lm;
  } catch {}
}

setInterval(syncState, 300);
setInterval(checkHtmlUpdate, 1000);
</script>
</body>
</html>
`;

fs.mkdirSync("./public", { recursive: true });
fs.writeFileSync("./public/index.html", html);

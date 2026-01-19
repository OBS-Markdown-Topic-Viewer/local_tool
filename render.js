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
   youtube id helper
------------------------- */
function getYoutubeId(url) {
  const m =
    url.match(/v=([^&]+)/) ||
    url.match(/youtu\.be\/([^?]+)/);
  return m ? m[1] : null;
}

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
      if (b.type === "h2") {
        return "<h2>" + b.text + "</h2>";
      }
      if (b.type === "item") {
        return "<li class='topic-item' data-index='" + b.index + "'>" + b.text + "</li>";
      }
      if (b.type === "ad") {
        let media = "";

        if (b.youtube) {
          const id = getYoutubeId(b.youtube);
          if (id) {
            media =
              "<div class='ad-media-16x9'>" +
              "<iframe src='https://www.youtube.com/embed/" + id +
              "?rel=0&autoplay=1&mute=1&loop=1&playlist=" + id +
              "' allow='autoplay; encrypted-media' allowfullscreen></iframe>" +
              "</div>";
          }
        }
        else if (b.video) {
          media =
            "<div class='ad-media-16x9'>" +
            "<video src='" + b.video + "' autoplay muted loop playsinline></video>" +
            "</div>";
        }
        else if (b.image) {
          media = "<img src='" + b.image + "'>";
        }

        return (
          "<div class='ad-block' style='background:" + b.bg + "'>" +
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

/* -------------------------
   state sync
------------------------- */
async function syncState() {
  try {
    const res = await fetch("/state.json?_=" + Date.now());
    const text = await res.text();
    if (text === lastStateText) return;

    lastStateText = text;
    const state = JSON.parse(text);

    /* current */
    document.querySelectorAll(".topic-item").forEach(el => {
      el.classList.toggle(
        "current",
        Number(el.dataset.index) === state.current
      );
    });

    /* ad on/off */
    document.querySelectorAll(".ad-block").forEach(el => {
      el.style.display = state.showAd ? "" : "none";
    });

    /* theme change → reload */
    if (state.theme !== lastTheme) {
      location.reload();
    }
  } catch {}
}

setInterval(syncState, 300);
</script>
</body>
</html>
`;

fs.mkdirSync("./public", { recursive: true });
fs.writeFileSync("./public/index.html", html);

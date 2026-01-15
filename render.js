import fs from "fs";

const stateRaw = JSON.parse(fs.readFileSync("./state.json", "utf8"));
const theme = stateRaw.theme || "purple";

const src = fs.readFileSync("./md/topic.md", "utf8");
const lines = src.split("\n");

let title = "";
let index = -1;
const blocks = [];

for (const line of lines) {
  if (line.startsWith("# ")) {
    title = line.replace("# ", "").trim();
  }
  else if (line.startsWith("## ")) {
    blocks.push({ type: "h2", text: line.replace("## ", "").trim() });
  }
  else if (line.startsWith("- ")) {
    index++;
    blocks.push({
      type: "item",
      text: line.slice(2).trim(),
      current: index === stateRaw.current
    });
  }
}

const css =
  fs.readFileSync("./styles/base.css", "utf8") +
  fs.readFileSync(`./styles/theme-${theme}.css`, "utf8");

const html = `
<!doctype html>
<html>
<head>
<meta charset="utf-8">
<style>${css}</style>

<!-- ★ 自動再読み込み（500ms） -->
<script>
  setTimeout(() => {
    location.reload();
  }, 500);
</script>
</head>
<body>
  <div class="topic-board">
    <div class="board-title">${title}</div>
    <ul class="topic-list">
      ${blocks.map(b => {
        if (b.type === "h2") return "<h2>" + b.text + "</h2>";
        if (b.type === "item")
          return "<li class='topic-item" + (b.current ? " current" : "") + "'>" + b.text + "</li>";
        return "";
      }).join("")}
    </ul>
  </div>
</body>
</html>
`;

fs.mkdirSync("./public", { recursive: true });
fs.writeFileSync("./public/index.html", html);

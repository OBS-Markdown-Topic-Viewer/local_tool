import fs from "fs";
import MarkdownIt from "markdown-it";

const STATE_FILE = "./state.json";
const md = new MarkdownIt({ html: true });

if (!fs.existsSync("./md/topic.md")) {
  console.error("md/topic.md not found");
  process.exit(1);
}

const state = fs.existsSync(STATE_FILE)
  ? JSON.parse(fs.readFileSync(STATE_FILE))
  : { current: 0 };

const src = fs.readFileSync("./md/topic.md", "utf8");
const lines = src.split("\n");

let index = -1;

const processed = lines.map(line => {
  if (line.startsWith("- ")) {
    index++;
    if (index === state.current) {
      return `- <span class="current">${line.slice(2)}</span>`;
    }
  }
  return line;
}).join("\n");

const html = md.render(processed);

const template = `
<!doctype html>
<html>
<head>
<meta charset="utf-8">
<style>
${fs.readFileSync("./style.css")}
</style>
</head>
<body>
${html}
</body>
</html>
`;

fs.mkdirSync("./public", { recursive: true });
fs.writeFileSync("./public/index.html", template);

console.log("Rendered index.html");

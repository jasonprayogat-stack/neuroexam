// ------------------------------------------------------------
//  Tiny static web server for NeuroExam (Node, no dependencies).
//  Run:  node server.js         (optionally: node server.js 8080)
//  Then open the printed URL in your browser.
// ------------------------------------------------------------
const http = require("http");
const fs = require("fs");
const path = require("path");

const port = Number(process.argv[2]) || 8080;
const root = __dirname;

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".webmanifest": "application/manifest+json",
};

const server = http.createServer((req, res) => {
  let urlPath = decodeURIComponent(new URL(req.url, "http://x").pathname);
  if (urlPath === "/") urlPath = "/index.html";
  // keep the request inside the project folder
  const file = path.join(root, path.normalize(urlPath).replace(/^(\.\.[/\\])+/, ""));
  if (!file.startsWith(root)) {
    res.writeHead(403).end("Forbidden");
    return;
  }
  fs.readFile(file, (err, data) => {
    if (err) {
      res.writeHead(404, { "Content-Type": "text/plain" }).end("404: not found");
      return;
    }
    const type = MIME[path.extname(file).toLowerCase()] || "application/octet-stream";
    res.writeHead(200, { "Content-Type": type }).end(data);
  });
});

server.listen(port, () => {
  console.log(`\n  NeuroExam running at:  http://localhost:${port}/`);
  console.log("  Press Ctrl+C to stop.\n");
});

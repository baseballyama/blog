import fs from "node:fs";
import path from "node:path";
import http from "node:http";

const ROOT = path.join(import.meta.dirname, "..");
const DOCS_DIR = path.join(ROOT, "docs");
const PORT = 3000;

const mimeTypes: Record<string, string> = {
  ".html": "text/html",
  ".css": "text/css",
  ".js": "application/javascript",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".svg": "image/svg+xml",
};

const server = http.createServer((req, res) => {
  const url = req.url || "/";
  let filePath = path.join(DOCS_DIR, url === "/" ? "index.html" : url);
  if (!path.extname(filePath)) filePath += ".html";

  const ext = path.extname(filePath);
  const contentType = mimeTypes[ext] || "application/octet-stream";

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404);
      res.end("Not Found");
    } else {
      res.writeHead(200, { "Content-Type": contentType });
      res.end(data);
    }
  });
});

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

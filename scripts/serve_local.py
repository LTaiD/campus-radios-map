import importlib.util
import json
import os
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import urlparse, parse_qs

REPO = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DIST = os.path.join(REPO, "dist")

spec = importlib.util.spec_from_file_location("detect", os.path.join(REPO, "api", "detect.py"))
detect = importlib.util.module_from_spec(spec)
spec.loader.exec_module(detect)

CTYPES = {
    ".html": "text/html", ".js": "application/javascript", ".css": "text/css",
    ".svg": "image/svg+xml", ".json": "application/json", ".png": "image/png",
    ".ico": "image/x-icon", ".webmanifest": "application/manifest+json",
    ".woff2": "font/woff2", ".woff": "font/woff",
}


class H(BaseHTTPRequestHandler):
    def do_GET(self):
        parsed = urlparse(self.path)
        if parsed.path == "/api/detect":
            url = (parse_qs(parsed.query).get("url") or [""])[0]
            body = json.dumps(detect.identify(url)).encode()
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.send_header("Cache-Control", "no-store")
            self.end_headers()
            self.wfile.write(body)
            return
        rel = parsed.path.lstrip("/") or "index.html"
        fp = os.path.join(DIST, rel)
        if not os.path.isfile(fp):
            fp = os.path.join(DIST, "index.html")
        ext = os.path.splitext(fp)[1]
        with open(fp, "rb") as f:
            data = f.read()
        self.send_response(200)
        self.send_header("Content-Type", CTYPES.get(ext, "application/octet-stream"))
        self.end_headers()
        self.wfile.write(data)

    def log_message(self, *args):
        pass


print("serving http://localhost:3000 (dist + /api/detect)")
ThreadingHTTPServer(("127.0.0.1", 3000), H).serve_forever()

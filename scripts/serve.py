from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import urlparse
import os

ROOT = Path(__file__).resolve().parent.parent / 'site'
os.chdir(ROOT)

class Handler(SimpleHTTPRequestHandler):
    def do_GET(self):
        route = urlparse(self.path).path
        if route.startswith('/work/') or route.startswith('/stories/'):
            self.path = '/index.html'
        super().do_GET()
    def end_headers(self):
        self.send_header('Cache-Control', 'no-store')
        super().end_headers()

class PreviewServer(ThreadingHTTPServer):
    # Several browser tabs can request the static chunks together. The default
    # backlog of five can refuse connections before a worker accepts them.
    request_queue_size = 128

PreviewServer(('127.0.0.1', 8943), Handler).serve_forever()

from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import urlparse
import os

ROOT = Path(__file__).resolve().parent.parent / 'site'
CHARACTER_VIEWER = ROOT.parent / 'qa' / 'resident' / 'viewer.js'
os.chdir(ROOT)

class Handler(SimpleHTTPRequestHandler):
    def do_GET(self):
        route = urlparse(self.path).path
        # Development-only UI stays outside the static publication root.
        if route in ('/__character', '/__character/'):
            html = (ROOT / 'index.html').read_text(encoding='utf-8')
            html = html.replace('</body>', '<script src="/__character/viewer.js"></script></body>')
            payload = html.encode('utf-8')
            self.send_response(200)
            self.send_header('Content-Type', 'text/html; charset=utf-8')
            self.send_header('Content-Length', str(len(payload)))
            self.end_headers()
            self.wfile.write(payload)
            return
        if route == '/__character/viewer.js':
            if not CHARACTER_VIEWER.is_file():
                self.send_error(404)
                return
            payload = CHARACTER_VIEWER.read_bytes()
            self.send_response(200)
            self.send_header('Content-Type', 'text/javascript; charset=utf-8')
            self.send_header('Content-Length', str(len(payload)))
            self.end_headers()
            self.wfile.write(payload)
            return
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

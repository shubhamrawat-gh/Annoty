import http from 'http';

export interface AuthResult {
  email: string;
  token: string;
}

export function startCallbackServer(startPort: number, timeoutMs: number): {
  portPromise: Promise<number>;
  authPromise: Promise<AuthResult>;
  cancel: () => void;
} {
  let port = startPort;
  const server = http.createServer();
  let timeoutTimer: NodeJS.Timeout | null = null;
  let resolved = false;

  let resolvePort: (port: number) => void;
  let rejectPort: (err: any) => void;
  const portPromise = new Promise<number>((res, rej) => {
    resolvePort = res;
    rejectPort = rej;
  });

  const cleanup = () => {
    if (timeoutTimer) {
      clearTimeout(timeoutTimer);
      timeoutTimer = null;
    }
    if (server.listening) {
      server.close();
    }
  };

  const authPromise = new Promise<AuthResult>((resolve, reject) => {
    server.on('error', (err: any) => {
      if (resolved) return;
      if (err.code === 'EADDRINUSE') {
        if (port < startPort + 10) {
          port++;
          server.listen(port);
        } else {
          resolved = true;
          cleanup();
          const error = new Error('Could not find an available port in the range 9876-9885.');
          rejectPort(error);
          reject(error);
        }
      } else {
        resolved = true;
        cleanup();
        rejectPort(err);
        reject(err);
      }
    });

    server.on('listening', () => {
      // Remove the EADDRINUSE retry listener
      server.removeAllListeners('error');
      server.on('error', (err) => {
        if (!resolved) {
          resolved = true;
          cleanup();
          reject(err);
        }
      });

      resolvePort(port);

      // Set timeout
      timeoutTimer = setTimeout(() => {
        if (!resolved) {
          resolved = true;
          cleanup();
          reject(new Error('Authentication timed out. The request was not completed within 2 minutes.'));
        }
      }, timeoutMs);
    });

    server.on('request', (req, res) => {
      if (!req.url) {
        res.writeHead(400);
        res.end('Bad Request');
        return;
      }

      const urlObj = new URL(req.url, `http://localhost:${port}`);
      if (urlObj.pathname !== '/callback') {
        res.writeHead(404);
        res.end('Not Found');
        return;
      }

      const token = urlObj.searchParams.get('token');
      const email = urlObj.searchParams.get('email');

      if (!token || !email) {
        res.writeHead(400, { 'Content-Type': 'text/html' });
        res.end('<h1>Authentication Failed</h1><p>Missing token or email parameter in callback.</p>');
        return;
      }

      // Success! Respond to browser
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Annoty CLI Login Successful</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
              background-color: #0f172a;
              color: #f8fafc;
              display: flex;
              align-items: center;
              justify-content: center;
              height: 100vh;
              margin: 0;
            }
            .card {
              background-color: #1e293b;
              padding: 2.5rem;
              border-radius: 12px;
              box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.3), 0 4px 6px -4px rgba(0, 0, 0, 0.3);
              text-align: center;
              max-width: 450px;
              border: 1px solid #334155;
            }
            h1 { color: #10b981; margin-top: 0; font-size: 24px; font-weight: 600; }
            p { color: #94a3b8; font-size: 0.95rem; line-height: 1.5; }
            .logo { font-size: 36px; margin-bottom: 15px; }
          </style>
        </head>
        <body>
          <div class="card">
            <div class="logo">✏️</div>
            <h1>Authentication Successful</h1>
            <p>You have successfully logged in to the Annoty CLI as <strong>${escapeHtml(email)}</strong>.</p>
            <p>You can close this tab and return to your terminal.</p>
          </div>
        </body>
        </html>
      `);

      resolved = true;
      // Delay closing server slightly to make sure browser gets the response fully
      setTimeout(() => {
        cleanup();
        resolve({ email, token });
      }, 500);
    });

    server.listen(port);
  });

  return {
    portPromise,
    authPromise,
    cancel: () => {
      resolved = true;
      cleanup();
    }
  };
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

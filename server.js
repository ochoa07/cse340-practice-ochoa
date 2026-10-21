import express from 'express';
import { fileURLToPath } from 'url';
import path from 'path';

import routes from './src/controllers/routes.js';
import { addLocalVariables } from './src/middleware/global.js';
import { setupDatabase, testConnection } from './src/models/setup.js';

const PORT = process.env.PORT || 3000;
const NODE_ENV = (process.env.NODE_ENV || 'production').toLowerCase();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Configure static files and EJS
app.use(express.static(path.join(__dirname, 'public')));
// Read submitted form data and JSON
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'src/views'));

// Make shared values available to EJS templates
app.use(addLocalVariables);

// Connect the routes
app.use('/', routes);

// Handle addresses that do not exist
app.use((req, res, next) => {
  const err = new Error('Page Not Found');
  err.status = 404;
  next(err);
});

// Handle errors
app.use((err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }

  console.error(err.stack || err.message);

  const status = err.status || 500;
  const template = status === 404 ? '404' : '500';

  const context = {
    title: status === 404 ? 'Page Not Found' : 'Server Error',
    error: NODE_ENV === 'production'
      ? 'An error occurred'
      : err.message,
    stack: NODE_ENV === 'production' ? null : err.stack,
    NODE_ENV
  };

  res.status(status).render(
    `errors/${template}`,
    context,
    (renderErr, html) => {
      if (renderErr) {
        console.error('Error rendering error page:', renderErr);

        return res.status(status).send(
          `<h1>Error ${status}</h1><p>An error occurred.</p>`
        );
      }

      res.send(html);
    }
  );
});

// Start the development WebSocket server for live reloading
if (NODE_ENV.includes('dev')) {
  try {
    const ws = await import('ws');
    const wsPort = parseInt(PORT, 10) + 1;
    const wsServer = new ws.WebSocketServer({ port: wsPort });

    wsServer.on('listening', () => {
      console.log(`WebSocket server is running on port ${wsPort}`);
    });

    wsServer.on('error', (error) => {
      console.error('WebSocket server error:', error);
    });
  } catch (error) {
    console.error('Failed to start WebSocket server:', error);
  }
}

// Set up the database, then start the Express server
try {
  await setupDatabase();
  await testConnection();

  app.listen(PORT, () => {
    console.log(`Server is running on http://127.0.0.1:${PORT}`);
  });
} catch (error) {
  console.error('Database startup failed:', error.message);
  process.exit(1);

}

import express from 'express';
import { fileURLToPath } from 'url';
import path from 'path';

const PORT = process.env.PORT || 3000;
const NODE_ENV = (process.env.NODE_ENV || 'production').toLowerCase();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Static files and EJS configuration
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'src/views'));

// Make NODE_ENV available to every EJS template
app.use((req, res, next) => {
  res.locals.NODE_ENV = NODE_ENV;
  next();
});

// Routes
app.get('/', (req, res) => {
  const title = 'Welcome Home';
  res.render('home', { title });
});

app.get('/about', (req, res) => {
  const title = 'About Me';
  res.render('about', { title });
});

app.get('/products', (req, res) => {
  const title = 'Our Products';
  res.render('products', { title });
});

// Test route for a 500 error
app.get('/test-error', (req, res, next) => {
  const err = new Error('This is a test error');
  err.status = 500;
  next(err);
});

// Catch requests that do not match an existing route
app.use((req, res, next) => {
  const err = new Error('Page Not Found');
  err.status = 404;
  next(err);
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack || err.message);

  if (res.headersSent) {
    return next(err);
  }

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

  res.status(status).render(`errors/${template}`, context, (renderErr, html) => {
    if (renderErr) {
      console.error('Error rendering error page:', renderErr);

      return res.status(status).send(
        `<h1>Error ${status}</h1><p>An error occurred.</p>`
      );
    }

    res.send(html);
  });
});

// Development WebSocket server for live reloading
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

// Start Express
app.listen(PORT, () => {
  console.log(`Server is running on http://127.0.0.1:${PORT}`);
});
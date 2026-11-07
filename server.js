import express from 'express';
import { fileURLToPath } from 'url';
import path from 'path';

import session from 'express-session';
import connectPgSimple from 'connect-pg-simple';
import flash from 'connect-flash';

import routes from './src/controllers/routes.js';
import { addLocalVariables } from './src/middleware/global.js';
import { notFound, errorHandler } from './src/middleware/error-handler.js';
import { setupDatabase, testConnection } from './src/models/setup.js';
import { startSessionCleanup } from './src/utils/session-cleanup.js';

const PORT = process.env.PORT || 3000;
const NODE_ENV = (process.env.NODE_ENV || 'production').toLowerCase();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.set('trust proxy', 1);

// Store sessions in PostgreSQL
const pgSession = connectPgSimple(session);

app.use(session({
  store: new pgSession({
    conObject: {
      connectionString: process.env.DB_URL
    },
    tableName: 'session',
    createTableIfMissing: true
  }),
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: !NODE_ENV.includes('dev'),
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 24 * 60 * 60 * 1000
  }
}));

// Enable session-based flash messages
app.use(flash());

// Configure static files and EJS
app.use(express.static(path.join(__dirname, 'public')));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'src/views'));

// Read submitted form data and JSON
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Make shared values available to EJS templates
app.use(addLocalVariables);

// Read flash messages once for each page request
app.use((req, res, next) => {
  res.locals.currentPath = req.path;
  res.locals.successMessages = req.flash('success');
  res.locals.errorMessages = req.flash('error');
  next();
});

// Connect the routes
app.use('/', routes);

// Handle missing pages and application errors
app.use(notFound);
app.use(errorHandler);

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
  startSessionCleanup();

  app.listen(PORT, () => {
    console.log(`Server is running on http://127.0.0.1:${PORT}`);
  });
} catch (error) {
  console.error('Database startup failed:', error.message);
  process.exit(1);
}
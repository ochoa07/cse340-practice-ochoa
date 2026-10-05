import express from 'express';
import { fileURLToPath } from 'url';
import path from 'path';

const courses = {
  CS121: {
    id: 'CS121',
    title: 'Introduction to Programming',
    description: 'Learn programming fundamentals using JavaScript and basic web development concepts.',
    credits: 3,
    sections: [
      { time: '9:00 AM', room: 'STC 392', professor: 'Brother Jack' },
      { time: '2:00 PM', room: 'STC 394', professor: 'Sister Enkey' },
      { time: '11:00 AM', room: 'STC 390', professor: 'Brother Keers' }
    ]
  },
  MATH110: {
    id: 'MATH110',
    title: 'College Algebra',
    description: 'Fundamental algebraic concepts including functions, graphing, and problem solving.',
    credits: 4,
    sections: [
      { time: '8:00 AM', room: 'MC 301', professor: 'Sister Anderson' },
      { time: '1:00 PM', room: 'MC 305', professor: 'Brother Miller' },
      { time: '3:00 PM', room: 'MC 307', professor: 'Brother Thompson' }
    ]
  },
  ENG101: {
    id: 'ENG101',
    title: 'Academic Writing',
    description: 'Develop writing skills for academic and professional communication.',
    credits: 3,
    sections: [
      { time: '10:00 AM', room: 'GEB 201', professor: 'Sister Anderson' },
      { time: '12:00 PM', room: 'GEB 205', professor: 'Brother Davis' },
      { time: '4:00 PM', room: 'GEB 203', professor: 'Sister Enkey' }
    ]
  }
};

const PORT = process.env.PORT || 3000;
const NODE_ENV = (process.env.NODE_ENV || 'production').toLowerCase();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use((req, res, next) => {
  res.locals.timestamp = new Date().toISOString();
  next();
});


app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'src/views'));


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


app.get('/test-error', (req, res, next) => {
  const err = new Error('This is a test error');
  err.status = 500;
  next(err);
});


app.get('/catalog', (req, res) => {
  res.render('catalog', {
    title: 'Course Catalog',
    courses
  });
});


app.get('/catalog/:courseId', (req, res, next) => {
  const courseId = req.params.courseId;

  const course = Object.hasOwn(courses, courseId)
    ? courses[courseId]
    : null;

  if (!course) {
    const err = new Error(`Course ${courseId} not found`);
    err.status = 404;
    return next(err);
  }

  const sortBy = req.query.sort || 'time';
  const sortedSections = [...course.sections];

  switch (sortBy) {
    case 'professor':
      sortedSections.sort((a, b) =>
        a.professor.localeCompare(b.professor)
      );
      break;

    case 'room':
      sortedSections.sort((a, b) =>
        a.room.localeCompare(b.room)
      );
      break;

    case 'time':
    default:
      break;
  }

  console.log(`Viewing course: ${courseId}, sorted by: ${sortBy}`);

  res.render('course-detail', {
    title: `${course.id} - ${course.title}`,
    course: { ...course, sections: sortedSections },
    currentSort: sortBy
  });
});


const addVisitCount = (req, res, next) => {
  res.locals.visitCount = 42;
  next();
};


app.get('/welcome', addVisitCount, (req, res) => {
  res.send(`
    <h1>Welcome!</h1>
    <p>Current time: ${res.locals.timestamp}</p>
    <p>Visitor count: ${res.locals.visitCount}</p>
  `);
});


app.use((req, res, next) => {
  const err = new Error('Page Not Found');
  err.status = 404;
  next(err);
});


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

// Development WebSocket server
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


app.listen(PORT, () => {
  console.log(`Server is running on http://127.0.0.1:${PORT}`);
});
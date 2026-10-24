import { Router } from 'express';

import { addDemoHeaders } from '../middleware/demo/headers.js';

import { catalogPage, courseDetailPage } from './catalog/catalog.js';

import { facultyListPage, facultyDetailPage } from './faculty/faculty.js';

import { homePage, aboutPage, demoPage, testErrorPage } from './index.js';

import contactRoutes from './forms/contact.js';

import registrationRoutes from './forms/registration.js';

const router = Router();
// Load catalog styles for catalog pages
router.use('/catalog', (req, res, next) => {
  res.addStyle('<link rel="stylesheet" href="/css/catalog.css">');
  next();
});

// Load faculty styles for faculty pages
router.use('/faculty', (req, res, next) => {
  res.addStyle('<link rel="stylesheet" href="/css/faculty.css">');
  next();
});

// Load styles for contact pages
router.use('/contact', (req, res, next) => {
  res.addStyle('<link rel="stylesheet" href="/css/contact.css">');
  next();
});

// Load styles for registration pages
router.use('/register', (req, res, next) => {
  res.addStyle('<link rel="stylesheet" href="/css/registration.css">');
  next();
});

router.get('/', homePage);
router.get('/about', aboutPage);

router.get('/catalog', catalogPage);
router.get('/catalog/:slugId', courseDetailPage);

router.get('/faculty', facultyListPage);
router.get('/faculty/:facultyId', facultyDetailPage);

router.get('/demo', addDemoHeaders, demoPage);

router.get('/test-error', testErrorPage);

// Contact form routes
router.use('/contact', contactRoutes);

// Registration routes
router.use('/register', registrationRoutes);

export default router;
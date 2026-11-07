import { Router } from 'express';
import { addDemoHeaders } from '../middleware/demo/headers.js';
import { catalogPage, courseDetailPage } from './catalog/catalog.js';
import { facultyListPage, facultyDetailPage } from './faculty/faculty.js';
import { homePage, aboutPage, demoPage, testErrorPage } from './index.js';
import { showContactForm, handleContactSubmission, showContactResponses } from './forms/contact.js';
import { contactValidation, registrationValidation, loginValidation, updateAccountValidation } from '../middleware/validation/forms.js';
import { showRegistrationForm, processRegistration, showAllUsers, showEditAccountForm, processEditAccount, processDeleteAccount } from './forms/registration.js';
import { showLoginForm, processLogin, processLogout, showDashboard } from './forms/login.js';
import { requireLogin, requireRole } from '../middleware/auth.js';

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

// Load styles for login pages
router.use('/login', (req, res, next) => {
  res.addStyle('<link rel="stylesheet" href="/css/login.css">');
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
router.get('/contact', showContactForm);
router.post('/contact', contactValidation, handleContactSubmission);
router.get('/contact/responses', showContactResponses);

// Registration routes
router.get('/register', showRegistrationForm);
router.post('/register', registrationValidation, processRegistration);
router.get('/register/list', showAllUsers);
router.get('/register/:id/edit', requireLogin, showEditAccountForm);
router.post('/register/:id/edit', requireLogin, updateAccountValidation, processEditAccount);
router.post('/register/:id/delete', requireRole('admin'), processDeleteAccount);

// Login form and submission
router.get('/login', showLoginForm);
router.post('/login', loginValidation, processLogin);

// Logout and protected dashboard
router.get('/logout', processLogout);
router.get('/dashboard', requireLogin, (req, res, next) => {
  res.addStyle('<link rel="stylesheet" href="/css/login.css">');
  next();
}, showDashboard);

export default router;
import { body, validationResult } from 'express-validator';
import {
  findUserByEmail,
  verifyPassword
} from '../../models/forms/login.js';
import { Router } from 'express';

const router = Router();

// Validate login fields
const loginValidation = [
  body('email')
    .trim()
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),

  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters')
];

// Display the login form
const showLoginForm = (req, res) => {
  res.render('forms/login/form', {
    title: 'User Login'
  });
};

// Process a login submission
const processLogin = async (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    console.error(
      'Login validation errors:',
      errors.array().map(error => ({
        field: error.path,
        message: error.msg
      }))
    );

    return res.redirect('/login');
  }

  const { email, password } = req.body;

  try {
  const user = await findUserByEmail(email);

  if (!user) {
    console.log('User not found');
    return res.redirect('/login');
  }

  const passwordMatches = await verifyPassword(password, user.password);

  if (!passwordMatches) {
    console.log('Invalid password');
    return res.redirect('/login');
  }

  // Create a fresh session after successful login
  req.session.regenerate((error) => {
    if (error) {
      return next(error);
    }

    // Store only account information, never the password hash
    req.session.user = {
      id: user.id,
      name: user.name,
      email: user.email,
      created_at: user.created_at
    };

    req.session.save((error) => {
      if (error) {
        return next(error);
      }

      console.log('Login successful');
      return res.redirect('/dashboard');
    });
  });
} catch (error) {
  console.error('Login failed:', error.code || 'Unknown error');
  return res.redirect('/login');
}
};

// End the login session
const processLogout = (req, res, next) => {
  req.session.destroy((error) => {
    if (error) {
      console.error('Logout failed:', error.code || 'Unknown error');
      return next(error);
    }

    res.clearCookie('connect.sid', { path: '/' });
    return res.redirect('/');
  });
};

// Display the protected dashboard
const showDashboard = (req, res) => {
  const user = req.session.user;
  const sessionData = req.session;

  // Ensure password data is never passed to the view
  if (user && Object.hasOwn(user, 'password')) {
    console.error('Security error: password found in session');
    delete user.password;
  }

  res.render('dashboard', {
    title: 'Dashboard',
    user,
    sessionData
  });
};

// Login form and submission
router.get('/', showLoginForm);
router.post('/', loginValidation, processLogin);

export default router;
export { processLogout, showDashboard };
import { validationResult } from 'express-validator';
import { findUserByEmail, verifyPassword } from '../../models/forms/login.js';

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
    for (const error of errors.array()) {
      req.flash('error', error.msg);
    }

    return res.redirect('/login');
  }

  const { email, password } = req.body;

  try {
    const user = await findUserByEmail(email);

    if (!user) {
      req.flash('error', 'Email or password is incorrect.');
      return res.redirect('/login');
    }

    const passwordMatches = await verifyPassword(password, user.password);

    if (!passwordMatches) {
      req.flash('error', 'Email or password is incorrect.');
      return res.redirect('/login');
    }

    // Create a fresh session after successful login
    req.session.regenerate((error) => {
      if (error) {
        return next(error);
      }

      // Store the account details needed by the app
      req.session.user = {
        id: user.id,
        name: user.name,
        email: user.email,
        created_at: user.created_at,
        roleName: user.roleName
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

  // Remove any password field before rendering the dashboard
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

export { showLoginForm, processLogin, processLogout, showDashboard };
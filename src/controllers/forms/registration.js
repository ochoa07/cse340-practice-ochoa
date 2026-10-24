import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import bcrypt from 'bcrypt';
import { emailExists, saveUser, getAllUsers } from '../../models/forms/registration.js';
const router = Router();
/**
 * Validation rules for user registration
 */
const registrationValidation = [
    body('name')
        .trim()
        .isLength({ min: 2 })
        .withMessage('Name must be at least 2 characters'),
    body('email')
        .trim()
        .isEmail()
        .normalizeEmail()
        .withMessage('Must be a valid email address'),
    body('emailConfirm')
        .trim()
        .normalizeEmail()
        .custom((value, { req }) => value === req.body.email)
        .withMessage('Email addresses must match'),
    body('password')
        .isLength({ min: 8 })
        .withMessage('Password must be at least 8 characters')
        .matches(/[0-9]/)
        .withMessage('Password must contain at least one number')
        .matches(/[!@#$%^&*]/)
        .withMessage('Password must contain at least one special character'),
    body('passwordConfirm')
        .custom((value, { req }) => value === req.body.password)
        .withMessage('Passwords must match')
];

// Display the registration form
const showRegistrationForm = (req, res) => {
  res.render('forms/registration/form', {
    title: 'User Registration'
  });
};

const processRegistration = async (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    console.error(
      'Registration validation errors:',
      errors.array().map(error => ({
        field: error.path,
        message: error.msg
      }))
    );

    return res.redirect('/register');
  }

  const { name, email, password } = req.body;

  try {
  const alreadyRegistered = await emailExists(email);

  if (alreadyRegistered) {
    console.log('Email already registered');
    return res.redirect('/register');
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  await saveUser(name, email, hashedPassword);

  console.log('User registered successfully');
  return res.redirect('/register/list');
} catch (error) {
  console.error('Registration failed:', error.code || 'Unknown error');
  return res.redirect('/register');
}
};

// Display registered users
const showAllUsers = async (req, res) => {
  let users = [];

  try {
    users = await getAllUsers();
  } catch (error) {
    console.error('Error retrieving users:', error.code || 'Unknown error');
  }

  res.render('forms/registration/list', {
    title: 'Registered Users',
    users
  });
};

// Display the registration form
router.get('/', showRegistrationForm);

// Process registration
router.post('/', registrationValidation, processRegistration);

// Display registered users
router.get('/list', showAllUsers);

export default router;
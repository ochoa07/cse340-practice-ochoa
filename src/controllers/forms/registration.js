import { validationResult } from 'express-validator';
import bcrypt from 'bcrypt';
import { emailExists, saveUser, getAllUsers, getUserById, updateUser, deleteUser } from '../../models/forms/registration.js';

// Display the registration form
const showRegistrationForm = (req, res) => {
  res.render('forms/registration/form', {
    title: 'User Registration'
  });
};

const processRegistration = async (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    for (const error of errors.array()) {
    req.flash('error', error.msg);
  }

    return res.redirect('/register');
  }

  const { name, email, password } = req.body;

  try {
  const alreadyRegistered = await emailExists(email);

  if (alreadyRegistered) {
    req.flash('error', 'An account with this email already exists.');
    return res.redirect('/register');
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  await saveUser(name, email, hashedPassword);

  req.flash('success', 'Your account was created successfully.');
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
    users,
    currentUser: req.session?.user
  });
};

const showEditAccountForm = async (req, res) => {
  const targetUserId = Number(req.params.id);
  const currentUser = req.session.user;

  if (!Number.isInteger(targetUserId) || targetUserId < 1 || targetUserId > 2147483647) {
    req.flash?.('error', 'User not found.');
    return res.redirect('/register/list');
  }

  const canEdit =
    currentUser.id === targetUserId || currentUser.roleName === 'admin';

  if (!canEdit) {
    req.flash?.('error', 'You do not have permission to edit this account.');
    return res.redirect('/register/list');
  }

  const targetUser = await getUserById(targetUserId);

  if (!targetUser) {
    req.flash?.('error', 'User not found.');
    return res.redirect('/register/list');
  }

  return res.render('forms/registration/edit', {
    title: 'Edit Account',
    user: targetUser
  });
};

const processEditAccount = async (req, res, next) => {
  const targetUserId = Number(req.params.id);
  const currentUser = req.session.user;

  if (!Number.isInteger(targetUserId) || targetUserId < 1 || targetUserId > 2147483647) {
    req.flash?.('error', 'User not found.');
    return res.redirect('/register/list');
  }

  const isOwnAccount = currentUser.id === targetUserId;

  if (!isOwnAccount && currentUser.roleName !== 'admin') {
    req.flash?.('error', 'You do not have permission to edit this account.');
    return res.redirect('/register/list');
  }

  const editUrl = `/register/${targetUserId}/edit`;
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    for (const error of errors.array()) {
      req.flash?.('error', error.msg);
    }

    return res.redirect(editUrl);
  }

  const { name, email } = req.body;

  try {
    const updatedUser = await updateUser(targetUserId, name, email);

    if (!updatedUser) {
      req.flash?.('error', 'User not found.');
      return res.redirect('/register/list');
    }

    if (isOwnAccount) {
      currentUser.name = updatedUser.name;
      currentUser.email = updatedUser.email;
    }

    req.flash?.('success', 'Account updated successfully.');
    return res.redirect('/register/list');
  } catch (error) {
    if (error.code === '23505') {
      req.flash?.('error', 'An account with this email already exists.');
      return res.redirect(editUrl);
    }

    return next(error);
  }
};

const processDeleteAccount = async (req, res, next) => {
  const targetUserId = Number(req.params.id);

  if (!Number.isInteger(targetUserId) || targetUserId < 1 || targetUserId > 2147483647) {
    req.flash?.('error', 'User not found.');
    return res.redirect('/register/list');
  }

  if (req.session.user.id === targetUserId) {
    req.flash?.('error', 'You cannot delete your own account.');
    return res.redirect('/register/list');
  }

  try {
    const deleted = await deleteUser(targetUserId);

    if (deleted) {
      req.flash?.('success', 'User account deleted successfully.');
    } else {
      req.flash?.('error', 'User not found.');
    }

    return res.redirect('/register/list');
  } catch (error) {
    return next(error);
  }
};

export { showRegistrationForm, processRegistration, showAllUsers, showEditAccountForm, processEditAccount, processDeleteAccount };
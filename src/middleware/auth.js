// Protect routes that require login
const requireLogin = (req, res, next) => {
  if (req.session && req.session.user) {
    res.locals.isLoggedIn = true;
    return next();
  }

  return res.redirect('/login');
};

export { requireLogin };
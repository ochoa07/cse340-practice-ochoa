// Protect routes that require login
const requireLogin = (req, res, next) => {
  if (req.session && req.session.user) {
    res.locals.isLoggedIn = true;
    return next();
  }

  return res.redirect('/login');
};

const requireRole = (roleName) => {
  return (req, res, next) => {
    if (!req.session?.user) {
      req.flash?.('error', 'You must be logged in to access this page.');
      return res.redirect('/login');
    }

    if (req.session.user.roleName !== roleName) {
      req.flash?.('error', 'You do not have permission to access this page.');
      return res.redirect('/');
    }

    return next();
  };
};

export { requireLogin, requireRole };
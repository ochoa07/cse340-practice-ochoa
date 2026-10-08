const homePage = (req, res) => {
  res.render('home', { title: 'Welcome Home' });
};

const aboutPage = (req, res) => {
  res.render('about', { title: 'About Me' });
};

const demoPage = (req, res) => {
  res.render('demo', { title: 'Middleware Demo Page' });
};

const testErrorPage = (req, res, next) => {
  const err = new Error('This is a test error');
  err.status = 500;
  next(err);
};

export { homePage, aboutPage, demoPage, testErrorPage };
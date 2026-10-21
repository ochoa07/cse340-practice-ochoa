const getCurrentGreeting = () => {
  const currentHour = new Date().getHours();

  if (currentHour < 12) {
    return 'Good Morning!';
  }

  if (currentHour < 18) {
    return 'Good Afternoon!';
  }

  return 'Good Evening!';
};

// Manage CSS and JavaScript assets for each request
const setHeadAssetsFunctionality = (res) => {
  res.locals.styles = [];
  res.locals.scripts = [];

  res.addStyle = (css, priority = 0) => {
    res.locals.styles.push({ content: css, priority });
  };

  res.addScript = (js, priority = 0) => {
    res.locals.scripts.push({ content: js, priority });
  };

  res.locals.renderStyles = () => {
    return res.locals.styles
      .sort((a, b) => b.priority - a.priority)
      .map(item => item.content)
      .join('\n');
  };

  res.locals.renderScripts = () => {
    return res.locals.scripts
      .sort((a, b) => b.priority - a.priority)
      .map(item => item.content)
      .join('\n');
  };
};

const addLocalVariables = (req, res, next) => {
  res.locals.currentYear = new Date().getFullYear();

  res.locals.NODE_ENV =
    (process.env.NODE_ENV || 'production').toLowerCase();

  res.locals.queryParams = { ...req.query };

  res.locals.greeting = `<p>${getCurrentGreeting()}</p>`;

  const themes = ['blue-theme', 'green-theme', 'red-theme'];

  res.locals.bodyClass =
    themes[Math.floor(Math.random() * themes.length)];

  // Keep the timestamp used by the welcome page
  res.locals.timestamp = new Date().toISOString();

  setHeadAssetsFunctionality(res);

  next();
};

export { addLocalVariables };
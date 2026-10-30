const NODE_ENV = (process.env.NODE_ENV || 'production').toLowerCase();

// Pass requests that do not match a route to the error handler
export const notFound = (req, res, next) => {
  const err = new Error('Page Not Found');
  err.status = 404;
  next(err);
};

// Display the correct error page
export const errorHandler = (err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }

  console.error(err.stack || err.message);

  const status = err.status || 500;
  const template = status === 404 ? '404' : '500';

  const context = {
    title: status === 404 ? 'Page Not Found' : 'Server Error',
    error: NODE_ENV === 'production'
      ? 'An error occurred'
      : err.message,
    stack: NODE_ENV === 'production' ? null : err.stack,
    NODE_ENV
  };

  res.status(status).render(
    `errors/${template}`,
    context,
    (renderErr, html) => {
      if (renderErr) {
        console.error('Error rendering error page:', renderErr);

        return res.status(status).send(
          `<h1>Error ${status}</h1><p>An error occurred.</p>`
        );
      }

      res.send(html);
    }
  );
};
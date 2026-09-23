import express from 'express';

const app = express();
const name = process.env.NAME;

app.get('/', (req, res) => {
  res.send(`Welcome, ${name}!`);
});

const PORT = 3000;

app.get('/new-route', (req, res) => {
  res.send('This is a new route!');
});
app.listen(PORT, () => {
  console.log(`Server is running on http://127.0.0.1:${PORT}`);
});
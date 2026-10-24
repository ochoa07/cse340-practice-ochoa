import bcrypt from 'bcrypt';
import db from '../db.js';

// Find a user by email

const findUserByEmail = async (email) => {
  const query = `
    SELECT id, name, email, password, created_at
    FROM users
    WHERE LOWER(email) = LOWER($1)
    LIMIT 1
  `;

  const result = await db.query(query, [email]);
  return result.rows[0] || null;
};

// Compare the entered password with the saved hash
const verifyPassword = async (plainPassword, hashedPassword) => {
  return await bcrypt.compare(plainPassword, hashedPassword);
};

export { findUserByEmail, verifyPassword };
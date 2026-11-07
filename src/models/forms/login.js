import bcrypt from 'bcrypt';
import db from '../db.js';

// Find a user by email

const findUserByEmail = async (email) => {
 const query = `
  SELECT
    users.id,
    users.name,
    users.email,
    users.password,
    users.created_at,
    roles.role_name AS "roleName"
  FROM users
  INNER JOIN roles ON users.role_id = roles.id
  WHERE LOWER(users.email) = LOWER($1)
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
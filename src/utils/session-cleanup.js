import db from '../models/db.js';

// Remove expired sessions
const cleanupExpiredSessions = async () => {
  try {
    const result = await db.query(
      'DELETE FROM session WHERE expire < NOW()'
    );

    if (result.rowCount > 0) {
      console.log(`Cleaned up ${result.rowCount} expired sessions`);
    }
  } catch (error) {
    if (error.code === '42P01') {
      console.log('Session table will be created when first used.');
      return;
    }

    console.error('Error cleaning up sessions:', error.code);
  }
};

// Run cleanup now and every 12 hours
const startSessionCleanup = () => {
  cleanupExpiredSessions();

  const twelveHours = 12 * 60 * 60 * 1000;
  setInterval(cleanupExpiredSessions, twelveHours);

  console.log('Session cleanup scheduled to run every 12 hours');
};

export { startSessionCleanup };
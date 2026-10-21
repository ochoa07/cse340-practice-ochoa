import db from './db.js';
import fs from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const setupDatabase = async () => {
    let hasData = false;

    try {
        const result = await db.query(
            'SELECT EXISTS (SELECT 1 FROM faculty LIMIT 1) as has_data'
        );
        hasData = result.rows[0]?.has_data || false;
    } catch (error) {
        hasData = false;
    }

    if (hasData) {
        console.log('Database already seeded');
    } else {
        console.log('Seeding database...');

        const seedPath = join(__dirname, 'sql', 'seed.sql');
        const seedSQL = fs.readFileSync(seedPath, 'utf8');

        await db.query(seedSQL);
        console.log('Database seeded successfully');
    }

    // Initialize practice tables on every startup
    const practicePath = join(__dirname, 'sql', 'practice.sql');

    if (fs.existsSync(practicePath)) {
        const practiceSQL = fs.readFileSync(practicePath, 'utf8');

        await db.query(practiceSQL);
        console.log('Practice database tables initialized');
    }

    return true;
};

const testConnection = async () => {
    const result = await db.query('SELECT NOW() as current_time');

    console.log(
        'Database connection successful:',
        result.rows[0].current_time
    );

    return true;
};

export { setupDatabase, testConnection };
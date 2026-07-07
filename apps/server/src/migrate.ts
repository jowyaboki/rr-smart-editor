import fs from 'fs';
import path from 'path';
import pool from './db';

async function migrate() {
  const migrationPath = path.join(__dirname, '../migrations/001_create_projects.sql');
  const sql = fs.readFileSync(migrationPath, 'utf8');

  try {
    await pool.query(sql);
    console.log('Migration successful');
  } catch (err) {
    console.error('Migration failed:', err);
  } finally {
    await pool.end();
  }
}

migrate();

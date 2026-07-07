import fs from 'fs';
import path from 'path';
import pool from './db';

async function migrate() {
  const migrationsDir = path.join(__dirname, '../migrations');
  const files = fs.readdirSync(migrationsDir).sort();

  for (const file of files) {
    if (file.endsWith('.sql')) {
      console.log(`Running migration: ${file}`);
      const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
      try {
        await pool.query(sql);
        console.log(`Migration ${file} successful`);
      } catch (err) {
        console.error(`Migration ${file} failed:`, err);
        process.exit(1);
      }
    }
  }
  await pool.end();
}

migrate();

import Database from 'better-sqlite3';
const db = new Database('users.db');
console.log('Users:', db.prepare('SELECT * FROM users').all());
console.log('Opinions:', db.prepare('SELECT * FROM opinions').all());

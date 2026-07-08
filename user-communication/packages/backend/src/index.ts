import dotenv from 'dotenv';
dotenv.config();

import { runMigrations } from './db';
import app from './app';

const port = parseInt(process.env.PORT || '8080', 10);

runMigrations()
  .then(() => {
    app.listen(port, () => {
      console.log(`Backend running on port ${port}`);
    });
  })
  .catch((err) => {
    console.error('Migration failed, exiting:', err);
    process.exit(1);
  });

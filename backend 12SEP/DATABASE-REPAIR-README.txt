JOB PORTAL BACKEND - DATABASE REPAIR PATCH
==============================================

This build fixes the database errors seen in the Admin/Chat screens:

  Table 'jobportal1.conversations' doesn't exist
  Table 'jobportal1.admin_access_keys' doesn't exist

WHAT CHANGED
------------
1. Added scripts/ensureDatabaseSchema.js
   - Idempotently creates missing conversations and messages tables.
   - Creates admin_access_keys when missing.
   - Adds missing chat attachment columns.
   - Adds missing user/job compatibility columns.
   - Creates the default Admin account ONLY if admin@jobportal.com does not exist.
   - Existing users/passwords/data are not overwritten.

2. index.js now runs the schema check before the HTTP server starts.
   This means the fix also runs after deployment/restart.

3. Added npm script:
   npm run db:repair

4. CORS now supports:
   CORS_ORIGINS=https://your-frontend.example.com,https://another-frontend.example.com
   while retaining localhost:5173 and localhost:5174.

ADMIN BOOTSTRAP
---------------
Only when the Admin account does not already exist:
  email: admin@jobportal.com
  password: Test@1234

If that admin already exists, its password is NOT changed.

HOSTINGER
---------
Upload this backend and restart the Node/Web App.
On startup the server will run the database repair automatically.

If you prefer to run it manually:
  npm install
  npm run db:repair
  npm start   (or use the Hostinger start command already configured)

IMPORTANT
---------
Do not delete the existing jobportal1 database. The migration uses
CREATE IF NOT EXISTS and only adds missing schema pieces.

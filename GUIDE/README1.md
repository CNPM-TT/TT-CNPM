README — Database CI & Local DB instructions

This README1 explains how the project's database CI workflow works, how to run and test the database connection locally (PowerShell), and how to securely provide MongoDB connection strings for CI and production.

1) Purpose

- The repository includes a GitHub Actions workflow at `.github/workflows/database.yml` that can start a MongoDB service inside the runner and run `database/seed.js` to seed or test the DB on pushes.
- `database/seed.js` attempts to connect using `process.env.MONGODB_URI` and exits with success/failure codes.

2) Important security note

- Do NOT commit secrets like production MongoDB URIs with credentials into the repository. Your repository currently contains a `.env` with an Atlas connection string — rotate these credentials and remove the file from Git history if it's sensitive.
- Use GitHub Actions Secrets for production or Atlas URIs. Example secret name: `PROD_MONGODB_URI`.

3) How CI sets the DB connection

- The workflow uses the `mongo:6.0` service container. The recommended job-level environment variable is:

  MONGODB_URI=mongodb://127.0.0.1:27017/tt_cnpm_ci

- The seed/test scripts use `process.env.MONGODB_URI` so they will connect to the service DB during CI runs.

4) How to test locally (PowerShell)

- If you want to test the database connection locally without Docker, ensure your local MongoDB instance is running and the `MONGODB_URI` in your `.env` points to it.

- Quick PowerShell commands to test using the repo's `database/seed.js` (from repo root):

```powershell
# 1) Ensure .env contains MONGODB_URI or export it for this session
$env:MONGODB_URI = "mongodb://127.0.0.1:27017/tt_cnpm_local"

# 2) Install dependencies (if not already)
npm install

# 3) Run the seed test script
node database/seed.js
```

- Expected output:
  - If connection succeeds, you'll see a success message and exit code 0.
  - If it fails, the script prints the error and exits non-zero.

5) How to configure GitHub Actions with a production/Atlas URI

- In GitHub: Settings → Secrets and variables → Actions → New repository secret.
  - Name: `PROD_MONGODB_URI`
  - Value: `mongodb+srv://<user>:<password>@cluster.../foodDeliveryDB`

- In workflows that need it (deployment), reference it like:

```yaml
env:
  MONGODB_URI: ${{ secrets.PROD_MONGODB_URI }}
```

- Never print secrets in logs. If you need to debug, print only presence checks (e.g. `echo "MONGODB_URI present: ${MONGODB_URI?}"`).

6) Recommended follow-ups (I can implement these):
- Add `.env` to `.gitignore` (if not present) and delete the committed `.env` from the repo; rotate compromised credentials.
- Update the workflow to use a Node-based wait-for-Mongo script if `nc` or /dev/tcp is not available on the runner.
- Add a simple test step that runs `node -e "require('./database/db').connectDb().then(()=>console.log('ok')).catch(e=>{console.error(e); process.exit(1)})"` to validate `connectDb()`.

---

If you want, I can:
- Add `.gitignore` entry and remove `.env` from the repository and update the todo list to mark those steps completed.
- Or just create a small Node wait script and adjust the workflow again.

Which one next?
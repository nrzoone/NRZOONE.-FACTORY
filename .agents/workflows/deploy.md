---
description: How to deploy the NRZONE Dashboard to Vercel
---

This workflow guides you through deploying the application to Vercel, handling common macOS permission issues.

1. **Fix Permissions (If needed)**
   If you encounter `EPERM` or `Operation not permitted` errors, follow these steps:
   - Open **System Settings** on your Mac.
   - Go to **Privacy & Security** > **Full Disk Access**.
   - Ensure your Terminal (or VS Code) is enabled in the list.
   - Alternatively, run this command in the project root:

   ```bash
   sudo chown -R $(whoami) .
   ```

2. **Clean Build**
   Ensure the project builds correctly locally:
// turbo

   ```bash
   npm run build
   ```

3. **Deploy to Production**
   Use the Vercel CLI to deploy to production:
// turbo

   ```bash
   vercel --prod --yes
   ```

4. **Verify Deployment**
   Once finished, verify the production URL provided in the terminal output.

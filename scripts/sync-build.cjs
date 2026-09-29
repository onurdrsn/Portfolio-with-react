const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const srcDist = path.resolve(rootDir, 'apps/web/dist');
const pagesDist = path.resolve(rootDir, 'pages/dist');
const rootDist = path.resolve(rootDir, 'dist');

if (!fs.existsSync(srcDist)) {
  console.warn(`[sync-build] Source dist not found at ${srcDist}, skipping sync.`);
  process.exit(0);
}

try {
  // Sync to pages/dist (Cloudflare Pages build output directory)
  fs.mkdirSync(path.resolve(rootDir, 'pages'), { recursive: true });
  fs.cpSync(srcDist, pagesDist, { recursive: true, force: true });

  // Sync to root dist (fallback for default root deployment setups)
  fs.mkdirSync(rootDist, { recursive: true });
  fs.cpSync(srcDist, rootDist, { recursive: true, force: true });

  console.log(`[sync-build] Successfully synced build output to ${pagesDist} and ${rootDist}`);
} catch (err) {
  console.error('[sync-build] Error syncing build directories:', err);
  process.exit(1);
}

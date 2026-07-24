import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');

try {
  console.log('📦 Building Client Frontend (Vite)...');
  execSync('npm run build', { cwd: path.join(root, 'client'), stdio: 'inherit' });

  const distPath = path.join(root, 'client/dist');
  const publicPath = path.join(root, 'public');

  if (fs.existsSync(distPath)) {
    console.log('🚚 Syncing client/dist to public directory...');
    if (fs.existsSync(publicPath)) {
      fs.rmSync(publicPath, { recursive: true, force: true });
    }
    fs.cpSync(distPath, publicPath, { recursive: true });
    console.log('✅ Production assets synced successfully to /public!');
  }
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}

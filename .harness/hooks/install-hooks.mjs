/**
 * HARNESS: Git Hooks Installer
 *
 * Symlinks hooks from .harness/hooks/ into .git/hooks/
 * Runs automatically via `npm install` (prepare script)
 */

import { existsSync, mkdirSync, copyFileSync, chmodSync } from 'fs';
import { join, resolve } from 'path';

const ROOT = resolve(import.meta.dirname, '..', '..');
const GIT_HOOKS_DIR = join(ROOT, '.git', 'hooks');
const HARNESS_HOOKS_DIR = join(ROOT, '.harness', 'hooks');

const HOOKS = ['pre-commit', 'commit-msg'];

// Check if .git exists
if (!existsSync(join(ROOT, '.git'))) {
  console.log('⚠️  No .git directory found. Skipping hook installation.');
  console.log('   Run "git init" first, then "npm run harness:install-hooks".');
  process.exit(0);
}

// Ensure .git/hooks exists
if (!existsSync(GIT_HOOKS_DIR)) {
  mkdirSync(GIT_HOOKS_DIR, { recursive: true });
}

for (const hook of HOOKS) {
  const src = join(HARNESS_HOOKS_DIR, hook);
  const dest = join(GIT_HOOKS_DIR, hook);

  if (!existsSync(src)) {
    console.warn(`⚠️  Hook source not found: ${src}`);
    continue;
  }

  copyFileSync(src, dest);

  try {
    chmodSync(dest, 0o755);
  } catch {
    // Windows may not support chmod - hooks will still work via git
  }

  console.log(`✅ Installed: ${hook}`);
}

console.log('🔒 Harness git hooks installed successfully.');

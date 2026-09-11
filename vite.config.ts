import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import { execSync } from 'node:child_process'

const APP_VERSION_BASE = '1.5.1'

function git(command: string): string {
  try {
    return execSync(command, { encoding: 'utf8' }).trim()
  } catch {
    return ''
  }
}

function buildAppVersionInfo() {
  const sha = git('git rev-parse --short HEAD')
  const commitDate = git('git log -1 --format=%ci') // e.g. 2026-09-04 12:22:11 +0800
  const match = commitDate.match(/^(\d{4})-(\d{2})-(\d{2})/)
  const yyMMdd = match ? `${match[1].slice(2)}${match[2]}${match[3]}` : ''
  const version = yyMMdd ? `${APP_VERSION_BASE}.${yyMMdd}` : APP_VERSION_BASE
  const repoUrl = git('git config --get remote.origin.url')
    .replace(/^git@github\.com:/, 'https://github.com/')
    .replace(/\.git$/, '')
  return { version, sha, repoUrl: repoUrl || 'https://github.com/gingerbreap/HKUBS_BA_CourseList' }
}

const appVersion = buildAppVersionInfo()

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      // Keep locale-specific manifests in public/; do not generate a competing one.
      manifest: false,
      includeAssets: [
        'favicon.ico',
        'favicon.svg',
        'favicon-96x96.png',
        'apple-touch-icon.png',
        'logo.png',
        'site.webmanifest',
        'site.zh-CN.webmanifest',
        'site.zh-HK.webmanifest',
        'web-app-manifest-192x192.png',
        'web-app-manifest-512x512.png',
      ],
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,webp,json,webmanifest}'],
        navigateFallback: 'index.html',
        // Iframe PDF loads are navigations; without a denylist Workbox serves index.html
        // (course outline embeds become a miniature homepage).
        navigateFallbackDenylist: [/\.pdf$/i],
        // workbox-build's production terser pass can hang / fail ("Unfinished hook action(s) on exit: (terser) renderChunk").
        mode: 'development',
        maximumFileSizeToCacheInBytes: 3 * 1024 * 1024,
      },
      devOptions: {
        enabled: false,
      },
    }),
  ],
  base: '/HKUBS_BA_CourseList/',
  define: {
    __APP_VERSION__: JSON.stringify(appVersion.version),
    __APP_COMMIT_SHA__: JSON.stringify(appVersion.sha),
    __APP_REPO_URL__: JSON.stringify(appVersion.repoUrl),
  },
})

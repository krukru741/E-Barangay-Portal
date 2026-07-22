/**
 * browser-pool.ts
 *
 * Singleton Chromium browser pool for PDF generation.
 *
 * WHY THIS EXISTS:
 * The old approach called `puppeteer.launch()` on EVERY PDF request, which
 * spends 3–8 seconds launching a 150MB Chrome process each time. This file
 * maintains a SINGLE shared browser instance that is reused across all
 * requests, reducing that cost to near zero.
 *
 * LIFECYCLE:
 * - First call to `getBrowser()` launches Chrome once.
 * - Subsequent calls return the same instance immediately.
 * - If the browser crashes (disconnects), it is automatically re-launched.
 * - In Next.js dev mode (HMR), the instance is stored on `globalThis` to
 *   survive hot-reloads and prevent multiple instances from accumulating.
 */

import puppeteer, { Browser } from 'puppeteer'

// Store the browser on globalThis so it survives Next.js Hot Module Replacement.
const g = globalThis as unknown as { __puppeteerBrowser?: Browser | null }

// Single in-flight launch promise — prevents a "thundering herd" where
// multiple concurrent requests each try to launch their own browser.
let launchPromise: Promise<Browser> | null = null

async function launchBrowser(): Promise<Browser> {
  const browser = await puppeteer.launch({
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage', // Prevents /dev/shm crashes in low-memory envs
      '--disable-gpu',           // Not needed for PDF generation
      '--disable-extensions',
      '--no-first-run',
      // NOTE: --single-process and --no-zygote are intentionally EXCLUDED.
      // --single-process causes 'Target closed' crashes on Windows because
      // Chromium's IPC breaks in single-process mode on this platform.
    ],
  })

  // When this browser instance disconnects (crash / manual close),
  // clear the cached reference so the next call re-launches it.
  browser.on('disconnected', () => {
    g.__puppeteerBrowser = null
    launchPromise = null
    console.log('[BrowserPool] Browser disconnected — will re-launch on next request.')
  })

  return browser
}

/**
 * Returns the shared Chromium browser instance, launching it if needed.
 * Safe to call concurrently — only one launch will happen at a time.
 */
export async function getBrowser(): Promise<Browser> {
  // Return the cached instance if it's alive
  if (g.__puppeteerBrowser && g.__puppeteerBrowser.connected) {
    return g.__puppeteerBrowser
  }

  // If a launch is already in flight, await that same promise
  if (launchPromise) {
    return await launchPromise
  }

  // Start a new launch and cache the promise so concurrent callers share it
  launchPromise = launchBrowser()
  const browser = await launchPromise

  g.__puppeteerBrowser = browser
  launchPromise = null

  console.log('[BrowserPool] New Chromium instance launched.')
  return browser
}

/**
 * Opens a new page from the pool, runs `fn`, then closes the page.
 * The browser itself is NOT closed — it stays warm for the next request.
 *
 * Usage:
 *   const pdf = await withPage(async (page) => {
 *     await page.setContent(html)
 *     return page.pdf({ format: 'A4' })
 *   })
 */
export async function withPage<T>(fn: (page: import('puppeteer').Page) => Promise<T>): Promise<T> {
  const browser = await getBrowser()
  const page = await browser.newPage()

  try {
    // NOTE: Request interception is intentionally NOT enabled here.
    //
    // Interception was useful when Puppeteer navigated to an external URL
    // (page.goto) to block CDN fonts/analytics. But with page.setContent(),
    // Puppeteer internally navigates to about:blank first — enabling interception
    // interferes with this internal navigation and causes 'Target closed' errors.
    //
    // This is safe to omit because our HTML is fully self-contained:
    // all images are base64 data URIs, CSS is inline, no CDN calls are made.

    return await fn(page)
  } finally {
    // Always close the page — browser stays warm for the next request
    await page.close().catch(() => { /* ignore errors on close */ })
  }
}

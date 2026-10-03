import assert from 'node:assert/strict'
import { readFileSync, statSync } from 'node:fs'
import { dirname, resolve, sep } from 'node:path'
import { fileURLToPath } from 'node:url'
import vm from 'node:vm'

// Execute the generated worker's initialization with the real bundled Workbox.
// This catches runtime cache conflicts that Vite's successful build does not.
const buildDir = resolve(process.argv[2] ?? fileURLToPath(new URL('../dist', import.meta.url)))
const manifest = JSON.parse(readFileSync(resolve(buildDir, 'manifest.webmanifest'), 'utf8'))
const scope = new URL(manifest.scope, 'https://offline.test')
const eventTypes = new Set()
const entries = []
const sandbox = {
  URL, Request, Response, Headers, console,
  location: new URL('sw.js', scope),
  registration: { scope: scope.href },
  clients: { claim() {} },
  skipWaiting() {},
  addEventListener(type) { eventTypes.add(type) },
}
sandbox.self = sandbox
const context = vm.createContext(sandbox)
const modules = new Map()

function load(file) {
  assert.ok(file.startsWith(buildDir + sep), 'Worker imports must stay inside the build')
  if (modules.has(file)) return modules.get(file)
  const exports = {}
  modules.set(file, exports)
  sandbox.define = (dependencies, factory) => factory(...dependencies.map(dependency =>
    dependency === 'exports' ? exports : load(resolve(dirname(file), `${dependency}.js`)),
  ))
  vm.runInContext(readFileSync(file, 'utf8'), context, { filename: file, timeout: 1000 })
  if (exports.precacheAndRoute) {
    const precacheAndRoute = exports.precacheAndRoute
    exports.precacheAndRoute = (list, ...options) => {
      entries.push(...list)
      return precacheAndRoute(list, ...options)
    }
  }
  return exports
}

load(resolve(buildDir, 'sw.js'))
for (const type of ['install', 'activate', 'fetch']) assert.ok(eventTypes.has(type), `Missing ${type} handler`)
const urls = new Set()
for (const entry of entries) {
  const url = new URL(entry.url, scope)
  assert.ok(url.href.startsWith(scope.href), `Asset outside app scope: ${entry.url}`)
  assert.ok(!urls.has(url.href), `Duplicate cache entry: ${entry.url}`)
  urls.add(url.href)
  const file = resolve(buildDir, decodeURIComponent(url.pathname.slice(scope.pathname.length)))
  assert.ok(file.startsWith(buildDir + sep) && statSync(file).isFile(), `Missing cached asset: ${entry.url}`)
  if (!/^assets\/[^/]+-[\w-]{8}\./.test(entry.url)) {
    assert.ok(typeof entry.revision === 'string' && entry.revision.length > 0, `Unversioned static asset: ${entry.url}`)
  }
}
for (const file of ['index.html', 'manifest.webmanifest', 'assets/terrain/lake-morning.avif', 'assets/terrain/perch.webp', 'assets/terrain/pike.webp', 'assets/terrain/zander.webp']) {
  assert.ok(urls.has(new URL(file, scope).href), `Offline asset not cached: ${file}`)
}
console.log(`PWA gültig: Worker startet, ${entries.length} eindeutige Cacheeinträge mit gültigen Dateien und Revisionen.`)

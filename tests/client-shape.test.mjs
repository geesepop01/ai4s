import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), 'utf8')

test('the client half registers into the panel list, the overlay and settings', async () => {
  const source = await read('client.js')
  assert.match(source, /__ModuleLoader__\.load/)
  assert.match(source, /sidebar\.panellist/)
  assert.match(source, /name: 'main', key: 'openscience-workbench'/)
  assert.match(source, /settings\.section/)
  assert.match(source, /fetch\(url, { headers: { accept: 'application\/json' } }\)/)
  assert.match(source, /'\/ai4s\/state'/)
  assert.match(source, /'\/ai4s\/catalog'/)
})

test('the client reads both locales and never hardcodes one path', async () => {
  const source = await read('client.js')
  assert.match(source, /'zh-CN'/)
  assert.match(source, /STRINGS\.en/)
})

test('the client dictionary covers both languages and reads the live locale', async () => {
  const source = await read('client.js')
  // LocaleSnapshot exposes `active`; `id` never existed on it.
  assert.match(source, /getLocale\?\.\(\)/)
  assert.match(source, /snapshot\?\.active/)
  assert.match(source, /'zh-CN':/)
  // Tabs are nested, so a flat lookup would render raw ids.
  assert.match(source, /tabs: { state:/)
  assert.match(source, /t\(dict, `tabs\.\$\{id\}`\)/)
})

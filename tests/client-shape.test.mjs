import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), 'utf8')

test('the client half registers into the panel list, the overlay and settings', async () => {
  const source = await read('client.js')
  assert.match(source, /__ModuleLoader__\.load/)
  assert.match(source, /sidebar\.panellist/)
  assert.match(source, /shell\.overlay/)
  assert.match(source, /settings\.section/)
  assert.match(source, /fetch\('\/ai4s\/state'\)/)
  assert.match(source, /fetch\('\/ai4s\/catalog'\)/)
})

test('the client reads both locales and never hardcodes one path', async () => {
  const source = await read('client.js')
  assert.match(source, /'zh-CN'/)
  assert.match(source, /STRINGS\.en/)
})

test('locale files carry the same keys in both languages', async () => {
  const en = flatten(JSON.parse(await read('locale/en.json')))
  const zh = flatten(JSON.parse(await read('locale/zh-CN.json')))
  assert.deepEqual(Object.keys(zh).sort(), Object.keys(en).sort())
})

function flatten(value, prefix = '', out = {}) {
  for (const [key, child] of Object.entries(value)) {
    const path = prefix === '' ? key : `${prefix}.${key}`
    if (child !== null && typeof child === 'object') flatten(child, path, out)
    else out[path] = child
  }
  return out
}

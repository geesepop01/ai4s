import test from 'node:test'
import assert from 'node:assert/strict'
import { existsSync } from 'node:fs'
import { readFile } from 'node:fs/promises'

const root = (p) => new URL(`../${p}`, import.meta.url)

test('manifest declares bundle, client and engine floor', async () => {
  const pkg = JSON.parse(await readFile(root('package.json'), 'utf8'))
  assert.equal(pkg.name, '@geesepop01/ai4s')
  assert.equal(pkg.type, 'module')
  assert.equal(pkg.dsh.bundle.patch, './cordis.patch.yml')
  assert.equal(pkg.dsh.client.platform, 'web')
  assert.equal(pkg.dsh.client.immediately, true)
  assert.match(pkg.engines.dsh, />=0\.2\.0/)
  for (const f of ['index.js', 'client.js', 'cordis.patch.yml', 'LICENSE', 'NOTICE', 'icon.svg', 'locale/en.json', 'locale/zh-CN.json']) {
    assert.ok(existsSync(root(f)), `${f} missing`)
  }
})

test('patch inserts the openscience row and mounts index.js', async () => {
  const yaml = await readFile(root('cordis.patch.yml'), 'utf8')
  assert.match(yaml, /id: openscience/)
  assert.match(yaml, /name: '\.\/index\.js'/)
})

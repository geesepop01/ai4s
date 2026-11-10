// Package-relative paths. Resolved from this module so the plugin finds its own
// vendored tree wherever the bundle is installed.

import { fileURLToPath } from 'node:url'
import { dirname, join, resolve } from 'node:path'

/** Directory holding the plugin package. */
export const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')

/** Vendored OpenScience skills tree. */
export const skillsRoot = join(packageRoot, 'skills')

/** Locale resources. */
export const localeRoot = join(packageRoot, 'locale')

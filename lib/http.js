// Outbound fetches for the research tools.
//
// The harness's web service accepts only a URL (`WebFetchRequest = { url }`):
// no method, headers or body, and the provider picks the User-Agent. So every
// request here is a GET, politeness rides in query parameters, and a failure is
// a VALUE the model can act on — never a thrown error that ends the turn.

const DEFAULT_TIMEOUT_MS = 12_000

/**
 * @typedef {{ ok: true, status: number, body: unknown, truncated: boolean }
 *   | { ok: false, status: number, reason: 'rate-limited'|'not-found'|'upstream-error'|'network'|'not-json'|'truncated-parse', message: string }} JsonResult
 */

/**
 * Create a JSON GET helper over `ctx.web`.
 *
 * @param {object} options
 * @param {{ fetch(request: { url: string }): Promise<any> }} options.web
 * @param {(ms: number) => Promise<void>} [options.sleep]
 * @param {number} [options.timeoutMs]
 */
export function createHttpClient({ web, sleep = defaultSleep, timeoutMs = DEFAULT_TIMEOUT_MS }) {
  return {
    /**
     * @param {string} url
     * @returns {Promise<JsonResult>}
     */
    async getJson(url) {
      let response
      try {
        response = await withTimeout(web.fetch({ url }), timeoutMs, url)
      } catch (error) {
        return {
          ok: false,
          status: 0,
          reason: 'network',
          message: networkMessage(error),
        }
      }
      const status = Number(response?.statusCode ?? 0)
      if (status === 429) return { ok: false, status, reason: 'rate-limited', message: `上游限速（HTTP 429）：${hostOf(url)}` }
      if (status === 404 || status === 410) return { ok: false, status, reason: 'not-found', message: `没有找到记录（HTTP ${status}）：${url}` }
      if (status >= 500) return { ok: false, status, reason: 'upstream-error', message: `上游服务故障（HTTP ${status}）：${hostOf(url)}` }
      if (status >= 400) return { ok: false, status, reason: 'upstream-error', message: `请求被拒绝（HTTP ${status}）：${url}` }

      const body = response?.body
      if (body?.kind === 'html') {
        return { ok: false, status, reason: 'not-json', message: `返回了网页而不是数据（HTTP ${status}）：${hostOf(url)}` }
      }
      const text = typeof body?.content === 'string' ? body.content : ''
      try {
        return { ok: true, status, body: JSON.parse(text), truncated: response?.truncated === true }
      } catch {
        if (response?.truncated === true) {
          return { ok: false, status, reason: 'truncated-parse', message: `响应被截断，无法解析：${hostOf(url)}` }
        }
        return { ok: false, status, reason: 'not-json', message: `响应不是 JSON：${hostOf(url)}` }
      }
    },
  }
}

/**
 * Serialises calls that share one upstream, so a burst of sources cannot trip
 * a rate limit.
 */
export class RateLimiter {
  /**
   * @param {number} minIntervalMs
   * @param {(ms: number) => Promise<void>} [sleep]
   */
  constructor(minIntervalMs, sleep = defaultSleep) {
    this.minIntervalMs = minIntervalMs
    this.sleep = sleep
    this.last = 0
    this.queue = Promise.resolve()
  }

  /**
   * @template T
   * @param {() => Promise<T>} operation
   * @returns {Promise<T>}
   */
  run(operation) {
    const result = this.queue.then(async () => {
      const now = Date.now()
      const wait = this.last === 0 ? 0 : Math.max(0, this.minIntervalMs - (now - this.last))
      if (wait > 0) await this.sleep(wait)
      this.last = Date.now()
      return operation()
    })
    // Keep the chain alive even when this operation rejects.
    this.queue = result.then(() => undefined, () => undefined)
    return result
  }
}

function defaultSleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function withTimeout(promise, ms, url) {
  let timer
  const timeout = new Promise((_, reject) => {
    timer = setTimeout(() => reject(new Error(`timeout after ${ms}ms: ${url}`)), ms)
  })
  try {
    return await Promise.race([promise, timeout])
  } finally {
    clearTimeout(timer)
  }
}

function networkMessage(error) {
  const text = error instanceof Error ? error.message : String(error)
  if (/WEB_PROVIDER/i.test(text)) {
    return '宿主没有可用的联网取数通道（web provider）。到设置 → 插件里配置搜索/抓取来源后用重试。'
  }
  return `取数失败：${text}`
}

function hostOf(url) {
  try {
    return new URL(url).host
  } catch {
    return url
  }
}

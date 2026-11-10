// OpenScience for the DeepSeek Harness — client half.
//
// Registers the "Research workbench" panel entry and a floating overlay with
// three read-only views (state, literature, skill catalog) plus a settings
// section. No build step: the host injects React and the slot registry.

window.__ModuleLoader__.load({
  id: '@geesepop01/ai4s',
  factory(require) {
    const React = require('react')
    const h = React.createElement

    const STRINGS = {
      en: {
        title: 'Research workbench',
        open: 'Open research workbench',
        close: 'Close research workbench',
        tabs: { state: 'State', literature: 'Literature', catalog: 'Skills' },
        empty: 'No research state yet. Ask the agent to start a research scope.',
        stage: 'Stage',
        hypothesis: 'Hypothesis',
        todos: 'Next steps',
        loading: 'Loading research state',
        error: 'Cannot read research state',
        literatureEmpty: 'No papers recorded yet.',
        catalogSearch: 'Search 371 skills',
        catalogEmpty: 'No skill matches that query.',
        visible: 'in catalog',
        hidden: 'hidden',
        settingsTitle: 'OpenScience',
        mailto: 'Contact email (Crossref / open access)',
        mailtoHint: 'Used for the polite API pool and for open-access lookups.',
        pubmedKey: 'NCBI API key',
        pubmedKeyHint: 'Optional. Raises the PubMed rate limit.',
        catalogMode: 'Skill catalog',
        catalogModeCurated: 'Curated (recommended)',
        catalogModeAll: 'All skills visible',
        bootstrap: 'Always-on research guidance',
      },
      'zh-CN': {
        title: '科研工作台',
        open: '打开科研工作台',
        close: '关闭科研工作台',
        tabs: { state: '状态', literature: '文献', catalog: '技能' },
        empty: '还没有研究状态。让 agent 先建立研究范围。',
        stage: '阶段',
        hypothesis: '假设',
        todos: '下一步',
        loading: '正在读取研究状态',
        error: '读不到研究状态',
        literatureEmpty: '还没有录入文献。',
        catalogSearch: '搜索 371 个技能',
        catalogEmpty: '没有匹配的技能。',
        visible: '目录内',
        hidden: '隐藏',
        settingsTitle: 'OpenScience 科研',
        mailto: '联系邮箱（Crossref / 开放获取）',
        mailtoHint: '用于礼貌调用池和开放获取查询。',
        pubmedKey: 'NCBI API Key',
        pubmedKeyHint: '可选。提高 PubMed 的速率上限。',
        catalogMode: '技能目录',
        catalogModeCurated: '精选（推荐）',
        catalogModeAll: '全部可见',
        bootstrap: '常驻科研引导',
      },
    }

    /** Tiny external store so the button and the overlay share one open flag. */
    const store = {
      open: false,
      tab: 'state',
      listeners: new Set(),
      subscribe(fn) {
        store.listeners.add(fn)
        return () => store.listeners.delete(fn)
      },
      set(patch) {
        Object.assign(store, patch)
        for (const fn of store.listeners) fn()
      },
    }

    function useStore() {
      const [, force] = React.useState(0)
      React.useEffect(() => store.subscribe(() => force((n) => n + 1)), [])
      return store
    }

    function t(ctx, key) {
      const dict = STRINGS[ctx?.locale?.getLocale?.()?.id === 'zh-CN' ? 'zh-CN' : 'en'] ?? STRINGS.en
      return dict[key] ?? STRINGS.en[key] ?? key
    }

    async function readState() {
      try {
        const response = await fetch('/ai4s/state')
        if (!response.ok) return { error: response.status === 400 ? 'empty' : 'unavailable' }
        return await response.json()
      } catch {
        return { error: 'unavailable' }
      }
    }

    async function readCatalog() {
      try {
        const response = await fetch('/ai4s/catalog')
        if (!response.ok) return []
        return await response.json()
      } catch {
        return []
      }
    }

    function WorkbenchButton(props) {
      const ctx = props.host
      const state = useStore()
      return h('button', {
        type: 'button',
        title: t(ctx, 'open'),
        'aria-label': t(ctx, 'open'),
        onClick: () => store.set({ open: !state.open }),
        style: { display: 'flex', alignItems: 'center', gap: 6, padding: '4px 6px', cursor: 'pointer' },
      }, h('span', { 'aria-hidden': true }, '⚗'), h('span', null, t(ctx, 'title')))
    }

    function Overlay(props) {
      const ctx = props.host
      const state = useStore()
      const [data, setData] = React.useState({ loading: true })
      const [catalog, setCatalog] = React.useState([])
      const [query, setQuery] = React.useState('')

      React.useEffect(() => {
        if (!state.open) return undefined
        let live = true
        setData({ loading: true })
        readState().then((value) => { if (live) setData(value) })
        return () => { live = false }
      }, [state.open])

      React.useEffect(() => {
        if (!state.open || state.tab !== 'catalog') return undefined
        let live = true
        readCatalog().then((items) => { if (live) setCatalog(items) })
        return () => { live = false }
      }, [state.open, state.tab])

      if (!state.open) return null
      const tabs = ['state', 'literature', 'catalog']
      const body = state.tab === 'state'
        ? renderState(ctx, data)
        : state.tab === 'literature'
          ? renderLiterature(ctx, data)
          : renderCatalog(ctx, catalog, query, setQuery)

      return h('div', {
        role: 'dialog',
        'aria-label': t(ctx, 'title'),
        style: {
          position: 'fixed', inset: '64px auto auto 72px', width: 420, maxHeight: '70vh',
          display: 'flex', flexDirection: 'column', zIndex: 60,
          background: 'var(--dsh-color-surface, #fff)', color: 'var(--dsh-color-text, #111)',
          border: '1px solid var(--dsh-color-border, #ccc)', borderRadius: 12,
          boxShadow: '0 12px 40px rgba(0,0,0,.18)', padding: 12, gap: 8,
        },
      },
      h('header', { style: { display: 'flex', alignItems: 'center', gap: 8 } },
        h('strong', { style: { flex: 1 } }, t(ctx, 'title')),
        h('button', { type: 'button', onClick: () => store.set({ open: false }), 'aria-label': t(ctx, 'close') }, '×')),
      h('nav', { style: { display: 'flex', gap: 8 } },
        ...tabs.map((tab) => h('button', {
          key: tab,
          type: 'button',
          'aria-pressed': state.tab === tab,
          onClick: () => store.set({ tab }),
          style: { fontWeight: state.tab === tab ? 600 : 400 },
        }, t(ctx, `tabs.${tab}`) === `tabs.${tab}` ? tab : String(t(ctx, tab))))),
      h('div', { style: { overflow: 'auto' } }, body))
    }

    function renderState(ctx, data) {
      if (data.loading) return h('p', null, t(ctx, 'loading'))
      if (data.error === 'empty') return h('p', null, t(ctx, 'empty'))
      if (data.error !== undefined) return h('p', null, t(ctx, 'error'))
      const state = data.state ?? {}
      return h('div', null,
        h('p', null, `${t(ctx, 'stage')}: ${state.stage ?? 'SCOPE'}`),
        state.hypothesis ? h('p', null, `${t(ctx, 'hypothesis')}: ${state.hypothesis}`) : null,
        Array.isArray(state.todos) && state.todos.length > 0
          ? h('div', null, h('p', null, t(ctx, 'todos')), h('ul', null, ...state.todos.map((todo, i) => h('li', { key: i }, String(todo)))))
          : null,
        data.path ? h('p', { style: { opacity: .6, fontSize: '.8em' } }, data.path) : null)
    }

    function renderLiterature(ctx, data) {
      const entries = data?.state?.entries ?? []
      if (entries.length === 0) return h('p', null, t(ctx, 'literatureEmpty'))
      return h('ul', null, ...entries.slice(0, 200).map((entry, i) => h('li', { key: i },
        entry.doi ? h('a', { href: `https://doi.org/${encodeURIComponent(entry.doi)}`, target: '_blank', rel: 'noreferrer' }, entry.title ?? entry.doi) : (entry.title ?? String(entry)),
        entry.year ? ` (${entry.year})` : '')))
    }

    function renderCatalog(ctx, items, query, setQuery) {
      const needle = query.trim().toLowerCase()
      const filtered = needle === '' ? items : items.filter((item) => `${item.name} ${item.description}`.toLowerCase().includes(needle))
      return h('div', null,
        h('input', { type: 'search', value: query, placeholder: t(ctx, 'catalogSearch'), onChange: (event) => setQuery(event.target.value), style: { width: '100%', marginBottom: 8 } }),
        filtered.length === 0 ? h('p', null, t(ctx, 'catalogEmpty')) : h('ul', null, ...filtered.slice(0, 200).map((item) => h('li', { key: item.name },
          h('strong', null, item.name), ' — ', item.description, ' ',
          h('span', { style: { opacity: .6 } }, item.hidden ? t(ctx, 'hidden') : t(ctx, 'visible'))))))
    }

    function SettingsSection(props) {
      const ctx = props.host
      const [saved, setSaved] = React.useState(false)
      return h('section', { style: { display: 'grid', gap: 10, padding: 8 } },
        h('h3', null, t(ctx, 'settingsTitle')),
        label(ctx, 'mailto', h('input', { type: 'email', placeholder: 'name@example.org' })),
        h('p', { style: { opacity: .6, fontSize: '.85em' } }, t(ctx, 'mailtoHint')),
        label(ctx, 'pubmedKey', h('input', { type: 'password' })),
        h('p', { style: { opacity: .6, fontSize: '.85em' } }, t(ctx, 'pubmedKeyHint')),
        label(ctx, 'catalogMode', h('select', null,
          h('option', { value: 'curated' }, t(ctx, 'catalogModeCurated')),
          h('option', { value: 'all' }, t(ctx, 'catalogModeAll')))),
        h('label', null, h('input', { type: 'checkbox', defaultChecked: true }), ' ', t(ctx, 'bootstrap')),
        h('button', { type: 'button', onClick: () => setSaved(true) }, saved ? '✓' : 'Save'))
    }

    function label(ctx, key, control) {
      return h('label', { style: { display: 'grid', gap: 4 } }, h('span', null, t(ctx, key)), control)
    }

    return {
      inject: ['slots'],
      apply(ctx) {
        ctx.slots.inject('sidebar.panellist', () => ctx.slots.register({
          name: 'sidebar.panellist', id: 'openscience-workbench', order: 40,
        }, () => h(WorkbenchButton, { host: ctx, key: 'btn' })))

        ctx.slots.inject('shell.overlay', () => ctx.slots.register({
          name: 'shell.overlay', id: 'openscience-overlay', order: 40,
        }, () => h(Overlay, { host: ctx, key: 'overlay' })))

        ctx.slots.inject('settings.section', () => ctx.slots.register({
          name: 'settings.section', id: 'openscience', order: 60, label: 'OpenScience',
        }, () => h(SettingsSection, { host: ctx, key: 'settings' })))
      },
    }
  },
})

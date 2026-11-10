// OpenScience for the DeepSeek Harness — client half.
//
// Registers a real main panel (the sidebar's own button opens it), a sidebar
// icon whose label the sidebar renders, and a read-only settings section. No
// build step: the host injects React and the slot registry.

window.__ModuleLoader__.load({
  id: '@geesepop01/ai4s',
  factory(require) {
    const React = require('react')
    const h = React.createElement

    const STRINGS = {
      en: {
        title: 'Research workbench',
        tabs: { state: 'State', literature: 'Literature', catalog: 'Skills' },
        empty: 'No research state yet. Ask the agent to start a research scope.',
        stage: 'Stage',
        hypothesis: 'Hypothesis',
        todos: 'Next steps',
        loading: 'Loading research state',
        error: 'Cannot read research state',
        literatureEmpty: 'No papers recorded yet.',
        catalogSearch: 'Search 370 skills',
        catalogEmpty: 'No skill matches that query.',
        visible: 'in catalog',
        hidden: 'hidden',
        settingsTitle: 'OpenScience',
        settingsNote: 'These values come from the plugin row config. Edit them in Plugins → ai4s.',
        mailto: 'Contact email',
        pubmedKey: 'NCBI API key',
        catalogMode: 'Skill catalog',
        bootstrap: 'Always-on research guidance',
        unset: 'not set',
        set: 'set',
      },
      'zh-CN': {
        title: '科研工作台',
        tabs: { state: '状态', literature: '文献', catalog: '技能' },
        empty: '还没有研究状态。让 agent 先建立研究范围。',
        stage: '阶段',
        hypothesis: '假设',
        todos: '下一步',
        loading: '正在读取研究状态',
        error: '读不到研究状态',
        literatureEmpty: '还没有录入文献。',
        catalogSearch: '搜索 370 个技能',
        catalogEmpty: '没有匹配的技能。',
        visible: '目录内',
        hidden: '隐藏',
        settingsTitle: 'OpenScience 科研',
        settingsNote: '这些值来自插件行配置，请在「插件 → ai4s」里修改。',
        mailto: '联系邮箱',
        pubmedKey: 'NCBI API Key',
        catalogMode: '技能目录',
        bootstrap: '常驻科研引导',
        unset: '未设置',
        set: '已设置',
      },
    }

    /** Language actually in force, per the host's LocaleSnapshot. */
    function dictFor(host) {
      const snapshot = host?.locale?.getLocale?.()
      const active = typeof snapshot?.active === 'string' ? snapshot.active : snapshot?.active?.id ?? 'en'
      return String(active).toLowerCase().startsWith('zh') ? STRINGS['zh-CN'] : STRINGS.en
    }

    function t(dict, path) {
      return path.split('.').reduce((value, key) => (value === undefined ? undefined : value[key]), dict) ?? path
    }

    const store = {
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

    async function readJson(url) {
      try {
        const response = await fetch(url, { headers: { accept: 'application/json' } })
        if (!response.ok) return { error: response.status === 403 ? 'forbidden' : 'unavailable' }
        return { value: await response.json() }
      } catch {
        return { error: 'unavailable' }
      }
    }

    /** Sidebar icon cell: the sidebar owns the button, so render a glyph only. */
    function WorkbenchIcon(props) {
      const size = Number.isFinite(props?.size) ? props.size : 16
      return h('svg', {
        width: size, height: size, viewBox: '0 0 24 24', fill: 'none', 'aria-hidden': true,
        style: { display: 'block', opacity: props?.active === true ? 1 : 0.75 },
      },
      h('path', { d: 'M9 3h6v2h-1v3.2l3.4 6.4A3 3 0 0 1 14.7 19H9.3a3 3 0 0 1-2.7-4.4L10 8.2V5H9z', stroke: 'currentColor', strokeWidth: 1.5, strokeLinejoin: 'round' }),
      h('path', { d: 'M7.6 14h8.8', stroke: 'currentColor', strokeWidth: 1.5 }))
    }

    function Workbench(props) {
      const dict = dictFor(props.host)
      const state = useStore()
      const [data, setData] = React.useState({ loading: true })
      const [catalog, setCatalog] = React.useState([])
      const [query, setQuery] = React.useState('')

      React.useEffect(() => {
        let live = true
        readJson('/ai4s/state').then((result) => {
          if (!live) return
          setData(result.error === undefined ? result.value : { error: result.error })
        })
        return () => { live = false }
      }, [])

      React.useEffect(() => {
        if (state.tab !== 'catalog' || catalog.length > 0) return undefined
        let live = true
        readJson('/ai4s/catalog').then((result) => {
          if (live && result.error === undefined) setCatalog(result.value)
        })
        return () => { live = false }
      }, [state.tab, catalog.length])

      const tab = state.tab
      return h('div', { style: { display: 'flex', flexDirection: 'column', gap: 12, padding: 16, pointerEvents: 'auto' } },
        h('h2', { style: { margin: 0, fontSize: 18 } }, t(dict, 'title')),
        h('nav', { style: { display: 'flex', gap: 8 } },
          ...['state', 'literature', 'catalog'].map((id) => h('button', {
            key: id,
            type: 'button',
            'aria-pressed': tab === id,
            onClick: () => store.set({ tab: id }),
            style: { fontWeight: tab === id ? 600 : 400 },
          }, t(dict, `tabs.${id}`)))),
        h('div', { style: { overflow: 'auto' } },
          tab === 'state' ? renderState(dict, data) : tab === 'literature' ? renderLiterature(dict, data) : renderCatalog(dict, catalog, query, setQuery)))
    }

    function renderState(dict, data) {
      if (data.loading) return h('p', null, t(dict, 'loading'))
      if (data.error !== undefined) return h('p', null, t(dict, data.error === 'forbidden' ? 'error' : 'empty'))
      const state = data.state ?? {}
      const rows = [h('p', { key: 'stage' }, `${t(dict, 'stage')}: ${state.stage ?? 'SCOPE'}`)]
      if (state.hypothesis) rows.push(h('p', { key: 'hyp' }, `${t(dict, 'hypothesis')}: ${state.hypothesis}`))
      if (Array.isArray(state.todos) && state.todos.length > 0) {
        rows.push(h('div', { key: 'todos' }, h('p', null, t(dict, 'todos')), h('ul', null, ...state.todos.map((todo, index) => h('li', { key: index }, String(todo))))))
      }
      if (data.path) rows.push(h('p', { key: 'path', style: { opacity: 0.6, fontSize: '.8em' } }, data.path))
      return h('div', null, ...rows)
    }

    function renderLiterature(dict, data) {
      const entries = data?.state?.entries ?? []
      if (entries.length === 0) return h('p', null, t(dict, 'literatureEmpty'))
      return h('ul', null, ...entries.slice(0, 200).map((entry, index) => h('li', { key: index },
        entry.doi
          ? h('a', { href: `https://doi.org/${encodeURIComponent(entry.doi)}`, target: '_blank', rel: 'noreferrer' }, entry.title ?? entry.doi)
          : (entry.title ?? String(entry)),
        entry.year ? ` (${entry.year})` : '')))
    }

    function renderCatalog(dict, items, query, setQuery) {
      const needle = query.trim().toLowerCase()
      const filtered = needle === '' ? items : items.filter((item) => `${item.name} ${item.description}`.toLowerCase().includes(needle))
      return h('div', null,
        h('input', {
          type: 'search', value: query, placeholder: t(dict, 'catalogSearch'),
          onChange: (event) => setQuery(event.target.value),
          style: { width: '100%', marginBottom: 8 },
        }),
        filtered.length === 0
          ? h('p', null, t(dict, 'catalogEmpty'))
          : h('ul', null, ...filtered.slice(0, 200).map((item) => h('li', { key: item.name },
              h('strong', null, item.name), ' — ', item.description, ' ',
              h('span', { style: { opacity: 0.6 } }, item.hidden ? t(dict, 'hidden') : t(dict, 'visible'))))))
    }

    function SettingsSection(props) {
      const dict = dictFor(props.host)
      const [config, setConfig] = React.useState(undefined)
      React.useEffect(() => {
        let live = true
        readJson('/ai4s/config').then((result) => { if (live) setConfig(result.error === undefined ? result.value : {}) })
        return () => { live = false }
      }, [])
      const rows = config === undefined ? [] : [
        [t(dict, 'mailto'), config.mailto === '' ? t(dict, 'unset') : config.mailto],
        [t(dict, 'pubmedKey'), config.pubmedKeySet ? t(dict, 'set') : t(dict, 'unset')],
        [t(dict, 'catalogMode'), config.catalogMode],
        [t(dict, 'bootstrap'), config.bootstrap ? 'on' : 'off'],
      ]
      return h('section', { style: { display: 'grid', gap: 8, padding: 8 } },
        h('h3', { style: { margin: 0 } }, t(dict, 'settingsTitle')),
        h('p', { style: { opacity: 0.65, margin: 0, fontSize: '.85em' } }, t(dict, 'settingsNote')),
        h('dl', { style: { display: 'grid', gridTemplateColumns: 'max-content 1fr', gap: '4px 12px', margin: 0 } },
          ...rows.flatMap(([label, value]) => [h('dt', { key: `${label}-t` }, label), h('dd', { key: `${label}-d`, style: { margin: 0 } }, String(value))])))
    }

    return {
      inject: ['slots'],
      apply(ctx) {
        // A panellist id addresses a main panel by the same key; without the
        // panel the sidebar's own button would throw on click.
        ctx.slots.inject('main', () => ctx.slots.register({
          name: 'main', key: 'openscience-workbench',
        }, () => h(Workbench, { host: ctx, key: 'workbench' })))

        ctx.slots.inject('sidebar.panellist', () => ctx.slots.register({
          name: 'sidebar.panellist', id: 'openscience-workbench', order: 40, label: () => 'AI4S',
        }, (props) => h(WorkbenchIcon, { size: props?.size, active: props?.active, key: 'icon' })))

        ctx.slots.inject('settings.section', () => ctx.slots.register({
          name: 'settings.section', id: 'ai4s', order: 60, label: 'OpenScience',
        }, () => h(SettingsSection, { host: ctx, key: 'settings' })))
      },
    }
  },
})

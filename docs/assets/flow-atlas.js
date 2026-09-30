/* Shared, data-driven SVG diagrams. No graph data or player state is global. */
(function () {
  'use strict';
  const NS = 'http://www.w3.org/2000/svg';
  let serial = 0;
  const mounted = new WeakMap();
  const make = (tag, attrs, parent, text, svg = false) => {
    const el = svg ? document.createElementNS(NS, tag) : document.createElement(tag);
    for (const [key, value] of Object.entries(attrs || {})) el.setAttribute(key, value);
    if (text != null) el.textContent = text;
    parent.append(el);
    return el;
  };
  function draw(parent, graph, thumbnail) {
    const uid = 'atlas-flow-' + (++serial);
    const s = (tag, attrs, target, text) => make(tag, attrs, target, text, true);
    const svg = s('svg', { viewBox: `0 0 ${graph.width} ${graph.height}`, role: thumbnail ? 'img' : 'group', 'aria-labelledby': uid + '-title', 'aria-describedby': uid + '-desc' }, parent);
    s('title', { id: uid + '-title' }, svg, graph.title);
    s('desc', { id: uid + '-desc' }, svg, thumbnail ? graph.title + '流程缩略图' : graph.title + '。选择节点查看说明，使用播放控件查看路径。');
    const defs = s('defs', {}, svg);
    const pattern = s('pattern', { id: uid + '-grid', width: 24, height: 24, patternUnits: 'userSpaceOnUse' }, defs);
    s('circle', { cx: 1, cy: 1, r: .7, fill: '#68716d', opacity: .2 }, pattern);
    const marker = s('marker', { id: uid + '-arrow', viewBox: '0 0 10 10', refX: 15, refY: 5, markerWidth: 7, markerHeight: 7, orient: 'auto' }, defs);
    s('path', { d: 'M2 2L8 5L2 8', fill: 'none', stroke: 'context-stroke', 'stroke-width': 1.5 }, marker);
    s('rect', { width: graph.width, height: graph.height, fill: `url(#${uid}-grid)` }, svg);
    for (const g of graph.groups || []) {
      s('rect', { class: 'af-group ' + (g.kind || 'neutral'), x: g.x, y: g.y, width: g.w, height: g.h, rx: 14 }, svg);
      s('text', { class: 'af-group-label', x: g.x + 30, y: g.y - 27 }, svg, g.label);
      if (!thumbnail) s('text', { class: 'af-group-tag', x: g.x + 30, y: g.y + 33 }, svg, g.subtitle);
    }
    const edges = (graph.edges || []).map(e => ({ ...e, el: s('path', { d: e.d, class: 'af-wire' + (e.retry ? ' retry' : '') + (e.consult ? ' consult' : ''), 'marker-end': `url(#${uid}-arrow)` }, svg) }));
    const nodes = graph.nodes.map((n, i) => {
      const attrs = { class: 'af-node ' + (n.kind || 'neutral'), 'data-node': n.id };
      if (!thumbnail) Object.assign(attrs, { role: 'button', tabindex: '0', 'aria-label': n.title + '：' + (n.copy || '') });
      const el = s('g', attrs, svg);
      s('rect', { class: 'af-halo', x: n.x - 5, y: n.y - 5, width: n.w + 10, height: n.h + 10, rx: 12 }, el);
      s('rect', { class: 'af-base', x: n.x, y: n.y, width: n.w, height: n.h, rx: 8 }, el);
      if (!thumbnail) {
        s('text', { class: 'af-number', x: n.x + 17, y: n.y + 25 }, el, String(i + 1).padStart(2, '0'));
        if (n.badge) s('text', { class: 'af-badge', x: n.x + n.w - 16, y: n.y + 25 }, el, n.badge);
      }
      s('text', { class: 'af-node-title', x: n.x + 17, y: n.y + (thumbnail ? n.h / 2 + 8 : 51) }, el, n.title);
      if (!thumbnail) s('text', { class: 'af-node-copy', x: n.x + 17, y: n.y + 77 }, el, n.copy);
      const ports = edges.flatMap(e => e.from === n.id ? [e.ports?.[0]] : e.to === n.id ? [e.ports?.[1]] : []).filter(Boolean);
      for (const [x, y] of ports) s('circle', { class: 'af-port', cx: x, cy: y, r: 4.5 }, el);
      return { ...n, el };
    });
    if (!thumbnail) for (const label of graph.labels || []) s('text', { class: 'af-edge-label ' + (label.kind || ''), x: label.x, y: label.y, 'text-anchor': label.anchor || 'start' }, svg, label.text);
    const traveler = s('g', { opacity: 0, 'aria-hidden': 'true' }, svg);
    s('circle', { r: 11, fill: '#e8bf98', opacity: .14 }, traveler);
    s('circle', { r: 5, class: 'af-dot' }, traveler);
    return { svg, edges, nodes, traveler };
  }
  function thumbnail(container, graph) {
    mounted.get(container)?.destroy();
    const root = make('div', { class: 'atlas-flow-thumb' }, container);
    draw(root, graph, true);
    const handle = { destroy() { root.remove(); if (mounted.get(container) === handle) mounted.delete(container); } };
    mounted.set(container, handle);
    return handle;
  }
  function mount(container, graph) {
    mounted.get(container)?.destroy();
    if (!graph.nodes?.length || !graph.routes?.length || graph.routes.some(r => !r.nodes?.length)) throw new Error('AtlasFlow requires nodes and nonempty routes.');
    const root = make('section', { class: 'atlas-flow', 'aria-label': graph.title }, container);
    const toolbar = make('div', { class: 'af-toolbar' }, root);
    const routeGroup = make('div', { class: 'af-routes', role: 'group', 'aria-label': '选择演示路径' }, toolbar);
    const routeButtons = graph.routes.map(r => make('button', { type: 'button', 'aria-pressed': 'false' }, routeGroup, r.name));
    const player = make('div', { class: 'af-player', role: 'group', 'aria-label': '演示控制' }, toolbar);
    const reset = make('button', { type: 'button' }, player, '↺ 重置');
    const next = make('button', { type: 'button' }, player, '下一步 →');
    const play = make('button', { type: 'button', class: 'af-play' }, player, 'Ⅱ 暂停');
    const scroll = make('div', { class: 'af-diagram-scroll' }, root);
    const { edges, nodes, traveler } = draw(scroll, graph, false);
    const inspector = make('div', { class: 'af-inspector' }, root);
    const heading = make('div', {}, inspector);
    const count = make('span', { class: 'af-eyebrow' }, heading);
    const name = make('h3', {}, heading);
    const detail = make('p', { tabindex: '0', 'aria-label': '节点说明' }, inspector);
    const footer = make('div', { class: 'af-status' }, root);
    const status = make('strong', {}, footer);
    make('span', {}, footer, '点击节点可停下细看');
    if (graph.footnote) make('p', { class: 'af-footnote' }, root, graph.footnote);
    const live = make('span', { class: 'af-sr-only', 'aria-live': 'polite', 'aria-atomic': 'true' }, root);
    const cleanup = [];
    const listen = (target, event, handler) => { target.addEventListener(event, handler); cleanup.push(() => target.removeEventListener(event, handler)); };
    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    let routeIndex = 0, step = 0, animation = null, raf = 0, lastPhase = '', destroyed = false;
    let userPlaying = true, inView = !('IntersectionObserver' in window), selectedOutside = false;
    const route = () => graph.routes[routeIndex];
    const eligible = () => !destroyed && userPlaying && inView && !document.hidden;
    const edgeBetween = (a, b) => edges.find(e => e.from === a && e.to === b);
    const announce = text => { live.textContent = text; };
    function clearEdges() { edges.forEach(e => e.el.classList.remove('current')); }
    function showNode(id) {
      const node = nodes.find(n => n.id === id);
      if (!node) return;
      nodes.forEach(n => { n.el.classList.toggle('active', n === node); n.el.setAttribute('aria-pressed', String(n === node)); });
      count.textContent = '节点 ' + (nodes.indexOf(node) + 1) + ' / ' + nodes.length;
      name.textContent = node.title;
      detail.textContent = node.detail || node.copy || '';
      detail.scrollTop = 0;
      next.disabled = !selectedOutside && step >= route().nodes.length - 1;
    }
    function cancel() {
      cancelAnimationFrame(raf); raf = 0;
      const previous = animation; animation = null;
      if (previous) previous.cancel();
      lastPhase = ''; clearEdges();
    }
    function initRoute(index) {
      cancel(); routeIndex = index; step = 0; selectedOutside = false;
      routeButtons.forEach((b, i) => b.setAttribute('aria-pressed', String(i === index)));
      showNode(route().nodes[0]);
      status.textContent = '已就绪 · ' + route().name;
    }
    function buildAnimation() {
      const seq = route().nodes, frames = [];
      // Include the final-node dwell and the 1.8s route hold in one pausable clock.
      const duration = (seq.length - 1) * 1500 + 800 + 1800;
      for (let i = 0; i < seq.length - 1; i++) {
        const edge = edgeBetween(seq[i], seq[i + 1]);
        if (!edge) continue;
        const length = edge.el.getTotalLength();
        const at = t => edge.el.getPointAtLength(length * t);
        const begin = i * 1500;
        for (const [t, opacity] of [[begin, 0], [begin + 800, 0], [begin + 801, 1]]) {
          const p = at(0); frames.push({ offset: t / duration, transform: `translate(${p.x}px,${p.y}px)`, opacity });
        }
        for (let j = 1; j <= 36; j++) {
          const p = at(j / 36);
          frames.push({ offset: (begin + 800 + 700 * j / 36) / duration, transform: `translate(${p.x}px,${p.y}px)`, opacity: 1 });
        }
        // Same-time keyframes hide the traveler between different node ports.
        const p = at(1); frames.push({ offset: (begin + 1500) / duration, transform: `translate(${p.x}px,${p.y}px)`, opacity: 0 });
      }
      frames.push({ offset: 1, opacity: 0 });
      const current = traveler.animate(reduced.matches || frames.length === 1 ? [{ opacity: 0 }, { opacity: 0 }] : frames, { duration, easing: 'linear', fill: 'both' });
      current.pause(); current.currentTime = step * 1500;
      current.onfinish = () => {
        if (destroyed || current !== animation) return;
        if (eligible()) { initRoute((routeIndex + 1) % graph.routes.length); reconcile(); }
      };
      return current;
    }
    function tick() {
      if (!eligible() || !animation || animation.playState !== 'running') return;
      const time = Number(animation.currentTime || 0), seq = route().nodes;
      const index = Math.min(Math.floor(time / 1500), seq.length - 1);
      const moving = index < seq.length - 1 && time % 1500 >= 800;
      const hold = time >= (seq.length - 1) * 1500 + 800;
      const phase = index + ':' + moving + ':' + hold;
      if (phase !== lastPhase) {
        lastPhase = phase; step = index; showNode(seq[index]); clearEdges();
        if (moving) {
          const edge = edgeBetween(seq[index], seq[index + 1]);
          edge?.el.classList.add('current');
          status.textContent = (edge?.retry ? '返回 · ' : '前往 · ') + (nodes.find(n => n.id === seq[index + 1])?.title || '下一节点');
        } else status.textContent = hold ? '流程完成 · 即将切换路径' : '正在演示 · ' + name.textContent;
      }
      raf = requestAnimationFrame(tick);
    }
    function reconcile() {
      if (destroyed) return;
      cancelAnimationFrame(raf); raf = 0;
      play.textContent = userPlaying ? 'Ⅱ 暂停' : '▶ 继续';
      play.setAttribute('aria-label', userPlaying ? '暂停自动轮播' : '继续自动轮播');
      if (!eligible()) { if (animation && animation.playState !== 'finished') animation.pause(); return; }
      if (animation?.playState === 'finished') initRoute((routeIndex + 1) % graph.routes.length);
      if (!animation) animation = buildAnimation();
      lastPhase = ''; animation.play(); tick();
    }
    function manualStop() { userPlaying = false; reconcile(); }
    function selectNode(id, keyboard) {
      root.classList.toggle('af-instant', keyboard);
      manualStop(); cancel();
      const seq = route().nodes, onward = seq.indexOf(id, step), index = onward >= 0 ? onward : seq.indexOf(id);
      selectedOutside = index < 0; step = Math.max(0, index); showNode(id);
      status.textContent = '查看节点 · ' + name.textContent;
      announce(status.textContent + '。' + detail.textContent);
    }
    nodes.forEach(n => {
      listen(n.el, 'click', e => selectNode(n.id, e.detail === 0));
      listen(n.el, 'keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); selectNode(n.id, true); } });
    });
    listen(play, 'click', e => {
      root.classList.toggle('af-instant', e.detail === 0);
      if (userPlaying) { manualStop(); status.textContent = '已暂停 · ' + name.textContent; }
      else {
        userPlaying = true;
        if (selectedOutside) { step = 0; selectedOutside = false; }
        reconcile();
      }
      announce(userPlaying ? '已继续自动轮播' : '已暂停自动轮播');
    });
    listen(next, 'click', () => {
      root.classList.add('af-instant'); manualStop(); cancel();
      step = selectedOutside ? 0 : Math.min(step + 1, route().nodes.length - 1);
      selectedOutside = false; showNode(route().nodes[step]);
      status.textContent = '逐步查看 · ' + name.textContent; announce(status.textContent + '。' + detail.textContent);
    });
    listen(reset, 'click', () => { manualStop(); initRoute(routeIndex); announce('已重置并暂停。' + name.textContent); });
    routeButtons.forEach((b, i) => listen(b, 'click', e => {
      root.classList.toggle('af-instant', e.detail === 0); initRoute(i); userPlaying = true; reconcile(); announce('开始演示 · ' + route().name);
    }));
    listen(document, 'visibilitychange', reconcile);
    listen(reduced, 'change', () => {
      const time = animation ? Number(animation.currentTime || 0) : null;
      cancel();
      if (time !== null) { animation = buildAnimation(); animation.currentTime = time; }
      reconcile();
    });
    let observer;
    if ('IntersectionObserver' in window) {
      observer = new IntersectionObserver(entries => { inView = entries[0].isIntersecting; reconcile(); }, { threshold: 0 });
      observer.observe(root);
    }
    initRoute(0); reconcile();
    const handle = { destroy() {
      if (destroyed) return;
      destroyed = true; cancel(); observer?.disconnect(); cleanup.forEach(fn => fn()); root.remove();
      if (mounted.get(container) === handle) mounted.delete(container);
    } };
    mounted.set(container, handle);
    return handle;
  }
  window.AtlasFlow = { mount, thumbnail };
})();

/* Da Mario map: MapLibre + OpenFreeMap vector tiles (OpenStreetMap data), drawn in the site palette.
   Loaded on demand by main.js after maplibre-gl.js. Data comes from the #map-data JSON on the page. */
(() => {
  const C = {
    land: '#f7f2e8',      // linen
    building: '#efe8da',  // linen in shade
    buildingLine: '#e3d8c4',
    park: '#e3e3cc',
    water: '#bcd9ea',     // the logo's blue, washed out
    road: '#fffdf8',
    roadCase: '#e6dcc9',
    major: '#fffdf8',
    majorCase: '#cdbd9f',
    path: '#d3c6ae',
    rail: '#c9bca5',
    label: '#3a4148',
    labelSoft: '#8c8273',
    halo: '#f7f2e8',
    gold: '#9a7638',
    rosso: '#8f2520',
  };

  const name = ['coalesce', ['get', 'name:en'], ['get', 'name_en'], ['get', 'name']];
  // road width by zoom: [z14, z16, z18]
  const width = (a, b, c) => ['interpolate', ['exponential', 1.6], ['zoom'], 14, a, 16, b, 18, c];
  const major = ['match', ['get', 'class'], ['motorway', 'trunk', 'primary', 'secondary'], true, false];
  const minor = ['match', ['get', 'class'], ['tertiary', 'minor', 'service', 'street', 'residential'], true, false];

  const style = {
    version: 8,
    glyphs: 'https://tiles.openfreemap.org/fonts/{fontstack}/{range}.pbf',
    sources: {
      omt: { type: 'vector', url: 'https://tiles.openfreemap.org/planet' },
    },
    layers: [
      { id: 'land', type: 'background', paint: { 'background-color': C.land } },
      { id: 'park', type: 'fill', source: 'omt', 'source-layer': 'park', paint: { 'fill-color': C.park } },
      {
        id: 'green-landuse', type: 'fill', source: 'omt', 'source-layer': 'landuse',
        filter: ['match', ['get', 'class'], ['park', 'grass', 'cemetery', 'pitch', 'playground'], true, false],
        paint: { 'fill-color': C.park },
      },
      { id: 'water', type: 'fill', source: 'omt', 'source-layer': 'water', paint: { 'fill-color': C.water } },
      {
        id: 'building', type: 'fill', source: 'omt', 'source-layer': 'building', minzoom: 13,
        paint: { 'fill-color': C.building, 'fill-outline-color': C.buildingLine },
      },
      {
        id: 'path', type: 'line', source: 'omt', 'source-layer': 'transportation', minzoom: 15,
        filter: ['match', ['get', 'class'], ['path', 'track'], true, false],
        paint: { 'line-color': C.path, 'line-width': 1.2, 'line-dasharray': [2, 1.5] },
      },
      {
        id: 'rail', type: 'line', source: 'omt', 'source-layer': 'transportation',
        filter: ['match', ['get', 'class'], ['rail', 'transit'], true, false],
        paint: { 'line-color': C.rail, 'line-width': 1.2, 'line-dasharray': [3, 2] },
      },
      {
        id: 'road-case', type: 'line', source: 'omt', 'source-layer': 'transportation',
        filter: minor, layout: { 'line-cap': 'round', 'line-join': 'round' },
        paint: { 'line-color': C.roadCase, 'line-width': width(2.5, 7, 22) },
      },
      {
        id: 'major-case', type: 'line', source: 'omt', 'source-layer': 'transportation',
        filter: major, layout: { 'line-cap': 'round', 'line-join': 'round' },
        paint: { 'line-color': C.majorCase, 'line-width': width(4, 11, 32) },
      },
      {
        id: 'road', type: 'line', source: 'omt', 'source-layer': 'transportation',
        filter: minor, layout: { 'line-cap': 'round', 'line-join': 'round' },
        paint: { 'line-color': C.road, 'line-width': width(1.5, 5, 18) },
      },
      {
        id: 'major', type: 'line', source: 'omt', 'source-layer': 'transportation',
        filter: major, layout: { 'line-cap': 'round', 'line-join': 'round' },
        paint: { 'line-color': C.major, 'line-width': width(2.5, 8.5, 28) },
      },
      { id: 'rings', type: 'line', source: 'rings', paint: { 'line-color': C.gold, 'line-opacity': 0.55, 'line-width': 1.2, 'line-dasharray': [1, 3] } },
      {
        id: 'ring-label', type: 'symbol', source: 'ring-labels',
        layout: { 'text-field': ['get', 'label'], 'text-font': ['Noto Sans Regular'], 'text-size': 10, 'text-letter-spacing': 0.16 },
        paint: { 'text-color': C.gold, 'text-halo-color': C.halo, 'text-halo-width': 1.6 },
      },
      {
        id: 'road-label', type: 'symbol', source: 'omt', 'source-layer': 'transportation_name', minzoom: 15,
        layout: {
          'symbol-placement': 'line', 'text-field': ['upcase', name], 'text-font': ['Noto Sans Regular'],
          'text-size': ['interpolate', ['linear'], ['zoom'], 15, 8.5, 18, 11], 'text-letter-spacing': 0.14,
        },
        paint: { 'text-color': C.labelSoft, 'text-halo-color': C.halo, 'text-halo-width': 1.4 },
      },
      { id: 'route-case', type: 'line', source: 'route', layout: { 'line-cap': 'round' }, paint: { 'line-color': C.road, 'line-width': 6 } },
      { id: 'route', type: 'line', source: 'route', layout: { 'line-cap': 'round' }, paint: { 'line-color': C.rosso, 'line-width': 2.6, 'line-dasharray': [1.6, 1.6] } },
    ],
  };

  const zh = document.documentElement.lang.startsWith('zh');
  const locale = zh ? {
    'CooperativeGesturesHandler.WindowsHelpText': '按住 Ctrl 再捲動滑鼠來縮放地圖',
    'CooperativeGesturesHandler.MacHelpText': '按住 ⌘ 再捲動來縮放地圖',
    'CooperativeGesturesHandler.MobileHelpText': '用兩指移動地圖',
    'NavigationControl.ZoomIn': '放大',
    'NavigationControl.ZoomOut': '縮小',
  } : {};

  // circle of radius r metres around [lng, lat], as a closed line
  const circle = ([lng, lat], r, steps = 96) => {
    const dLat = r / 111320, dLng = r / (111320 * Math.cos(lat * Math.PI / 180));
    const pts = [];
    for (let i = 0; i <= steps; i++) { const a = (i / steps) * 2 * Math.PI; pts.push([lng + dLng * Math.cos(a), lat + dLat * Math.sin(a)]); }
    return pts;
  };
  const feature = (geometry, properties = {}) => ({ type: 'Feature', geometry, properties });
  const collection = (features) => ({ type: 'FeatureCollection', features });

  const el = (tag, className, html) => {
    const node = document.createElement(tag);
    node.className = className;
    if (html) node.innerHTML = html;
    return node;
  };

  window.daMarioMap = (container, data, onPick) => {
    const { maplibregl } = window;
    const home = [data.home.lng, data.home.lat];

    style.sources.rings = { type: 'geojson', data: collection(data.rings.map((m) => feature({ type: 'LineString', coordinates: circle(home, m * data.metresPerMin) }))) };
    style.sources['ring-labels'] = {
      type: 'geojson',
      // label each ring at its north-east point
      data: collection(data.rings.map((m) => feature({ type: 'Point', coordinates: circle(home, m * data.metresPerMin, 8)[1] }, { label: `${m} ${data.min}`.toUpperCase() }))),
    };
    style.sources.route = { type: 'geojson', data: collection([]) };

    const map = new maplibregl.Map({
      container,
      style,
      center: home,
      zoom: 15.6,
      maxZoom: 19,
      minZoom: 13,
      pitchWithRotate: false,
      dragRotate: false,
      // page scrolls normally; two fingers (or Ctrl/⌘ + wheel) move the map
      cooperativeGestures: true,
      attributionControl: { compact: true },
      locale,
    });
    map.touchZoomRotate.disableRotation();
    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-left');

    data.tubes.forEach((t) => {
      new maplibregl.Marker({ element: el('div', 'map-tube', `<span class="roundel"></span><span class="tube-name">${t.name}</span>`), anchor: 'center' })
        .setLngLat([t.lng, t.lat]).addTo(map);
    });

    const markers = {};
    data.theatres.forEach((t) => {
      const node = el('button', 'map-theatre', `<span class="dot"></span><span class="theatre-name">${t.name}</span>`);
      node.type = 'button';
      node.setAttribute('aria-label', `${t.name}, ${t.walk} ${data.min}`);
      node.addEventListener('click', () => onPick && onPick(t.id));
      markers[t.id] = new maplibregl.Marker({ element: node, anchor: 'center' }).setLngLat([t.lng, t.lat]).addTo(map);
    });

    new maplibregl.Marker({ element: el('div', 'map-home', '<span class="pin"><i>M</i></span><span class="pin-label">Da Mario</span>'), anchor: 'bottom' })
      .setLngLat(home).addTo(map);

    // frame every theatre on the list
    const bounds = new maplibregl.LngLatBounds(home, home);
    data.theatres.forEach((t) => bounds.extend([t.lng, t.lat]));
    data.tubes.forEach((t) => bounds.extend([t.lng, t.lat]));
    // leave room on the right for the labels of the eastern theatres
    const narrow = container.clientWidth < 560;
    map.fitBounds(bounds, { padding: narrow ? { top: 50, bottom: 40, left: 30, right: 40 } : { top: 60, bottom: 40, left: 40, right: 150 }, duration: 0 });

    let current = null;
    const draw = () => {
      const t = data.theatres.find((x) => x.id === current);
      if (!t || !map.getSource('route')) return;
      map.getSource('route').setData(collection([feature({ type: 'LineString', coordinates: [home, [t.lng, t.lat]] })]));
    };
    map.on('load', draw);

    /* Label placement: try right, left, above, below; if every spot collides,
       the label only shows on hover or when that theatre is selected. */
    const SPOTS = ['', 'label-left', 'label-top', 'label-bottom'];
    const overlaps = (a, b) => a.x1 < b.x2 && a.x2 > b.x1 && a.y1 < b.y2 && a.y2 > b.y1;
    const placeLabels = () => {
      const box = container.getBoundingClientRect();
      const rel = (r, pad = 2) => ({ x1: r.left - box.left - pad, y1: r.top - box.top - pad, x2: r.right - box.left + pad, y2: r.bottom - box.top + pad });
      const taken = [{ x1: 0, y1: 0, x2: 44, y2: 84 }]; // zoom buttons
      $$('.map-home .pin, .map-home .pin-label, .map-tube .roundel, .map-tube .tube-name, .map-theatre .dot', container).forEach((n) => {
        const r = n.getBoundingClientRect(); if (r.width) taken.push(rel(r));
      });
      const W = container.clientWidth, H = container.clientHeight - 24; // keep clear of the attribution
      const order = Object.keys(markers).sort((a, b) => (b === current) - (a === current));
      order.forEach((id) => {
        const node = markers[id].getElement();
        const label = node.querySelector('.theatre-name');
        SPOTS.concat('label-hidden').forEach((c) => c && node.classList.remove(c));
        const p = map.project(markers[id].getLngLat());
        const w = label.offsetWidth, h = label.offsetHeight;
        const rects = {
          '': { x1: p.x + 12, y1: p.y - h / 2, x2: p.x + 12 + w, y2: p.y + h / 2 },
          'label-left': { x1: p.x - 12 - w, y1: p.y - h / 2, x2: p.x - 12, y2: p.y + h / 2 },
          'label-top': { x1: p.x - w / 2, y1: p.y - 12 - h, x2: p.x + w / 2, y2: p.y - 12 },
          'label-bottom': { x1: p.x - w / 2, y1: p.y + 12, x2: p.x + w / 2, y2: p.y + 12 + h },
        };
        const fits = (r) => r.x1 >= 4 && r.y1 >= 4 && r.x2 <= W - 4 && r.y2 <= H && !taken.some((t) => overlaps(r, t));
        const spot = SPOTS.find((c) => fits(rects[c]));
        if (spot === undefined) {
          // the selected theatre always gets a label: pick the spot that stays inside the map
          const inside = SPOTS.find((c) => rects[c].x1 >= 4 && rects[c].x2 <= W - 4) ?? '';
          if (id === current) { if (inside) node.classList.add(inside); taken.push(rects[inside]); }
          else node.classList.add('label-hidden');
          return;
        }
        if (spot) node.classList.add(spot);
        taken.push(rects[spot]);
      });
    };
    const $$ = (s, r) => [...r.querySelectorAll(s)];
    map.on('load', placeLabels);
    map.on('moveend', placeLabels);

    return {
      select(id) {
        current = id;
        Object.entries(markers).forEach(([k, m]) => {
          const node = m.getElement();
          node.classList.toggle('is-active', k === id);
          node.setAttribute('aria-pressed', k === id);
        });
        draw();
        placeLabels();
      },
    };
  };
})();

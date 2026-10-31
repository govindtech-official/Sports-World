// Jersey design studio. Built on Fabric.js (MIT, vendored in /vendor) so shoppers can place, resize,
// rotate and edit text, uploads and graphics on the front, back and both sleeves of a jersey mockup.
import { Canvas, FabricImage, IText, Path, Point, Rect, StaticCanvas, cache, util } from './vendor/fabric-6.9.1.min.js';

const $ = (selector, parent = document) => parent.querySelector(selector);
const $$ = (selector, parent = document) => [...parent.querySelectorAll(selector)];
const W = 600, H = 680;
const VIEWS = ['front', 'back', 'left', 'right'];
const VIEW_LABELS = { front: 'Front', back: 'Back', left: 'Left sleeve', right: 'Right sleeve' };
const AREAS = { front: { l: 190, t: 190, w: 220, h: 290 }, back: { l: 180, t: 140, w: 240, h: 380 }, left: { l: 200, t: 230, w: 200, h: 220 }, right: { l: 200, t: 230, w: 200, h: 220 } };
const SAVED_PROPS = ['swRole', 'swLabel', 'swArc'];
const DRAFT_KEY = 'sports-world-jersey-draft';
const FONTS = ['Graduate', 'Bebas Neue', 'Anton', 'Teko', 'Russo One', 'Black Ops One', 'Oswald', 'Bungee', 'Permanent Marker', 'Pacifico', 'Barlow Condensed'];
const JERSEY_FONTS = ['Graduate', 'Bebas Neue', 'Teko', 'Russo One', 'Anton', 'Black Ops One'];
const BODY_COLORS = ['#196b41', '#0f2f5c', '#163d79', '#77b8f1', '#d51f32', '#7a1020', '#f28c28', '#f2c313', '#5a2d82', '#111318', '#6b6f76', '#f2f0e8'];
const ACCENT_COLORS = ['#f2f0e8', '#111318', '#f2c313', '#9be54b', '#d51f32', '#163d79', '#77b8f1', '#f28c28'];
const PATTERNS = ['plain', 'stripes', 'pinstripes', 'hoops', 'sash', 'halves', 'chevron', 'fade'];
const FITS = {
  match: { label: 'Match jersey', note: 'V-neck · athletic fit', neck: 'v', scale: 1 },
  training: { label: 'Training tee', note: 'Crew neck · regular fit', neck: 'crew', scale: .97 },
  oversized: { label: 'Oversized', note: 'Crew neck · relaxed fit', neck: 'crew', scale: 1.1 }
};
const CONTROLS = { transparentCorners: false, cornerColor: '#ffffff', cornerStrokeColor: '#1c6b40', borderColor: '#1c6b40', cornerStyle: 'circle', cornerSize: 13, padding: 6, borderScaleFactor: 1.5 };
// Simple 100×100 graphics drawn for Sports World, free to print.
const GRAPHICS = {
  Star: 'M50 5 61 38H96L68 59 79 93 50 72 21 93 32 59 4 38H39Z',
  Bolt: 'M58 4 18 56H46L38 96 82 40H54L62 4Z',
  Flame: 'M50 4C58 26 80 36 80 62 80 82 66 96 50 96 34 96 20 82 20 62 20 46 30 38 36 26 38 38 44 44 48 46 46 30 46 18 50 4Z',
  Crown: 'M8 76 14 30 34 52 50 18 66 52 86 30 92 76ZM10 82H90V94H10Z',
  Shield: 'M50 4 88 18V48C88 72 72 88 50 96 28 88 12 72 12 48V18Z',
  Heart: 'M50 92C20 70 6 52 6 34 6 18 18 8 32 8 40 8 46 12 50 20 54 12 60 8 68 8 82 8 94 18 94 34 94 52 80 70 50 92Z',
  Trophy: 'M30 8H70V30C70 46 62 56 54 58V72H66V84H34V72H46V58C38 56 30 46 30 30ZM30 14H14V26C14 38 22 44 30 44V36C24 36 20 32 20 26V20H30ZM70 14H86V26C86 38 78 44 70 44V36C76 36 80 32 80 26V20H70ZM28 88H72V96H28Z',
  Bat: 'M86 6 94 14 80 28 72 20ZM72 20 80 28 36 84C31 91 22 93 16 87 10 81 12 72 18 67ZM28 12A10 10 0 1 0 28.1 12Z',
  Ball: 'M50 4A46 46 0 1 1 49.9 4ZM50 12A38 38 0 1 0 50.1 12ZM50 28 68 41 61 62H39L32 41Z',
  Wing: 'M8 70C30 30 60 14 96 10 80 22 72 30 66 38 78 36 88 34 94 34 80 44 70 50 60 54 70 56 78 58 84 60 64 70 40 76 8 70Z',
  Paw: 'M50 50C64 50 76 64 76 78 76 90 64 94 50 88 36 94 24 90 24 78 24 64 36 50 50 50ZM22 30A10 13 0 1 0 22.1 30ZM40 14A10 13 0 1 0 40.1 14ZM60 14A10 13 0 1 0 60.1 14ZM78 30A10 13 0 1 0 78.1 30Z',
  Laurel: 'M30 90C14 72 10 50 18 26L24 28C17 50 21 70 36 86ZM70 90 64 86C79 70 83 50 76 28L82 26C90 50 86 72 70 90ZM16 40C6 36 4 26 6 18 14 22 18 30 16 40ZM14 60C4 58 0 48 0 40 8 42 14 50 14 60ZM24 78C14 78 8 70 6 62 14 62 22 70 24 78ZM84 40C94 36 96 26 94 18 86 22 82 30 84 40ZM86 60C96 58 100 48 100 40 92 42 86 50 86 60ZM76 78C86 78 92 70 94 62 86 62 78 70 76 78Z'
};

const hex = value => /^#[0-9a-f]{6}$/i.test(value || '') ? value.toLowerCase() : null;
const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
function shade(color, amount) {
  const value = parseInt(color.slice(1), 16);
  const channel = shift => clamp(Math.round(((value >> shift) & 255) * (1 + amount)), 0, 255);
  return `#${[16, 8, 0].map(channel).map(part => part.toString(16).padStart(2, '0')).join('')}`;
}
const isLight = color => { const value = parseInt(color.slice(1), 16); return ((value >> 16 & 255) * 299 + (value >> 8 & 255) * 587 + (value & 255) * 114) / 1000 > 150; };
const range = (from, to, step) => Array.from({ length: Math.floor((to - from) / step) + 1 }, (_, index) => from + index * step);

// ---------- Jersey artwork (SVG, drawn per view and per colour choice) ----------

const SLEEVE_LEFT = 'M128 126C95 140 72 190 52 262L120 300 150 276C152 220 146 160 128 126Z';
const SLEEVE_RIGHT = 'M472 126C505 140 528 190 548 262L480 300 450 276C448 220 454 160 472 126Z';
const SLEEVE_CLOSEUP = 'M150 150C230 118 370 118 450 150L520 560C380 592 220 592 80 560Z';
function necklines(view, neck) {
  if (view === 'back') return { edge: 'C262 116 338 116 368 96', trim: 'M232 96C262 116 338 116 368 96', inner: '' };
  if (neck === 'v') return { edge: 'L300 178 368 96', trim: 'M232 96 300 178 368 96', inner: 'M232 96C262 108 338 108 368 96L300 178Z' };
  return { edge: 'C258 146 342 146 368 96', trim: 'M232 96C258 146 342 146 368 96', inner: 'M232 96C262 108 338 108 368 96 342 146 258 146 232 96Z' };
}
const bodyPath = neckEdge => `M232 96${neckEdge}L472 126C505 140 528 190 548 262L480 300 452 276C446 400 448 520 450 640Q300 662 150 640C152 520 154 400 148 276L120 300 52 262C72 190 95 140 128 126Z`;
function patternMarkup(pattern, color) {
  switch (pattern) {
    case 'stripes': return range(100, 500, 64).map(x => `<rect x="${x}" y="60" width="30" height="640" fill="${color}"/>`).join('');
    case 'pinstripes': return range(96, 504, 22).map(x => `<rect x="${x}" y="60" width="4" height="640" fill="${color}"/>`).join('');
    case 'hoops': return range(160, 660, 84).map(y => `<rect x="0" y="${y}" width="600" height="42" fill="${color}"/>`).join('');
    case 'sash': return `<polygon points="110,110 200,110 500,660 410,660" fill="${color}"/>`;
    case 'halves': return `<rect x="300" y="60" width="300" height="640" fill="${color}"/>`;
    case 'chevron': return `<path d="M60 250 300 370 540 250V320L300 440 60 320Z" fill="${color}"/>`;
    case 'fade': return `<linearGradient id="fade" x1="0" y1="0" x2="0" y2="1"><stop offset=".25" stop-color="${color}" stop-opacity="0"/><stop offset="1" stop-color="${color}"/></linearGradient><rect x="0" y="60" width="600" height="640" fill="url(#fade)"/>`;
    default: return '';
  }
}
const fitTransform = fit => { const scale = FITS[fit].scale; return `translate(${300 - 300 * scale} 0) scale(${scale} 1)`; };
const svgDocument = content => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">${content}</svg>`;

function garmentBase(view, garment, withBackdrop = true) {
  const backdrop = withBackdrop ? `<rect width="${W}" height="${H}" fill="#eef0eb"/><ellipse cx="300" cy="652" rx="220" ry="16" fill="#000" opacity=".08"/>` : '';
  if (view === 'left' || view === 'right') {
    return svgDocument(`${backdrop}<path d="${SLEEVE_CLOSEUP}" fill="${garment.sleeves}"/><path d="M80 560C220 592 380 592 520 560" fill="none" stroke="${garment.trim}" stroke-width="26"/>`);
  }
  const neck = necklines(view, FITS[garment.fit].neck);
  const body = bodyPath(neck.edge);
  return svgDocument(`${backdrop}<defs><clipPath id="body"><path d="${body}"/></clipPath></defs>
    <g transform="${fitTransform(garment.fit)}">
      ${neck.inner ? `<path d="${neck.inner}" fill="${shade(garment.body, -.55)}"/>` : ''}
      <path d="${body}" fill="${garment.body}"/>
      <g clip-path="url(#body)">${patternMarkup(garment.pattern, garment.accent)}</g>
      <path d="${SLEEVE_LEFT}" fill="${garment.sleeves}"/><path d="${SLEEVE_RIGHT}" fill="${garment.sleeves}"/>
      <path d="${neck.trim}" fill="none" stroke="${garment.trim}" stroke-width="14" stroke-linejoin="round"/>
      <path d="M54 263 120 300M546 263 480 300" stroke="${garment.trim}" stroke-width="12"/>
    </g>`);
}

// Fabric folds, edge shading and stitching drawn over the print so designs look printed on cloth.
function garmentOverlay(view, garment) {
  const soft = '<filter id="soft" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="7"/></filter>';
  const side = '<linearGradient id="side" x1="0" x2="1"><stop offset="0" stop-color="#000" stop-opacity=".24"/><stop offset=".24" stop-color="#000" stop-opacity="0"/><stop offset=".76" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".24"/></linearGradient><linearGradient id="top" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".12"/><stop offset=".45" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".12"/></linearGradient>';
  if (view === 'left' || view === 'right') {
    return svgDocument(`<defs>${soft}${side}<clipPath id="clip"><path d="${SLEEVE_CLOSEUP}"/></clipPath></defs>
      <g clip-path="url(#clip)"><rect width="${W}" height="${H}" fill="url(#side)"/><rect width="${W}" height="${H}" fill="url(#top)"/>
        <g filter="url(#soft)" fill="none" stroke-linecap="round"><path d="M200 220C230 320 230 430 200 540" stroke="#000" stroke-opacity=".1" stroke-width="18"/><path d="M400 220C380 330 384 440 410 540" stroke="#fff" stroke-opacity=".12" stroke-width="14"/></g></g>
      <path d="M150 150C230 118 370 118 450 150" fill="none" stroke="#000" stroke-opacity=".3" stroke-width="2" stroke-dasharray="5 5"/>
      <path d="M92 538C226 566 374 566 508 538" fill="none" stroke="#000" stroke-opacity=".22" stroke-width="1.5" stroke-dasharray="4 4"/>
      <path d="${SLEEVE_CLOSEUP}" fill="none" stroke="#000" stroke-opacity=".28" stroke-width="2"/>`);
  }
  const neck = necklines(view, FITS[garment.fit].neck);
  const body = bodyPath(neck.edge);
  return svgDocument(`<defs>${soft}${side}<clipPath id="clip"><path d="${body}"/></clipPath></defs>
    <g transform="${fitTransform(garment.fit)}">
      <g clip-path="url(#clip)"><rect x="30" y="80" width="540" height="600" fill="url(#side)"/><rect x="30" y="80" width="540" height="600" fill="url(#top)"/>
        <g filter="url(#soft)" fill="none" stroke-linecap="round">
          <path d="M200 330C230 360 250 420 240 520" stroke="#000" stroke-opacity=".1" stroke-width="14"/>
          <path d="M400 340C380 400 372 460 380 560" stroke="#000" stroke-opacity=".09" stroke-width="16"/>
          <path d="M260 570C300 606 340 612 380 602" stroke="#000" stroke-opacity=".07" stroke-width="12"/>
          <path d="M214 300C244 330 258 380 252 450" stroke="#fff" stroke-opacity=".11" stroke-width="10"/>
          <path d="M152 276C172 250 162 200 140 150M448 276C428 250 438 200 460 150" stroke="#000" stroke-opacity=".14" stroke-width="10"/>
        </g></g>
      <g fill="none" stroke="#000" stroke-opacity=".24" stroke-width="1.5" stroke-dasharray="4 4"><path d="M150 276C152 220 146 160 128 126M450 276C448 220 454 160 472 126M156 626Q300 648 444 626M62 252 124 286M538 252 476 286"/></g>
      <path d="${body}" fill="none" stroke="#000" stroke-opacity=".28" stroke-width="2"/>
    </g>`);
}
const svgUrl = markup => `data:image/svg+xml;charset=utf-8,${encodeURIComponent(markup)}`;
const svgImage = markup => FabricImage.fromURL(svgUrl(markup));

// ---------- Studio ----------

export function mountCustomizer({ state, api, toast, money, openAuth, refreshCart }) {
  const root = $('#customize');
  const garment = { fit: 'match', pattern: 'plain', body: '#196b41', accent: '#f2f0e8', sleeves: '#196b41', trim: '#f2f0e8' };
  const views = { front: [], back: [], left: [], right: [] };
  const uploads = [];
  let current = 'front', muted = 0, size = 'M';
  const history = { past: [], future: [] };

  const fontsLink = document.createElement('link');
  fontsLink.rel = 'stylesheet';
  fontsLink.href = `https://fonts.googleapis.com/css2?${FONTS.filter(font => font !== 'Barlow Condensed').map(font => `family=${font.replace(/ /g, '+')}`).join('&')}&display=swap`;
  document.head.append(fontsLink);
  const fontsReady = new Promise(resolve => { fontsLink.onload = resolve; fontsLink.onerror = resolve; })
    .then(() => Promise.all(FONTS.map(font => document.fonts.load(`40px "${font}"`).catch(() => {}))))
    .then(() => { cache.clearFontCache(); canvas.getObjects().forEach(object => object.initDimensions?.()); canvas.requestRenderAll(); });

  const canvas = new Canvas($('#cz-canvas'), { width: W, height: H, preserveObjectStacking: true, selection: false, backgroundColor: '#eef0eb' });
  const printArea = new Rect({ ...areaBox(current), fill: 'transparent', stroke: '#ffffff', strokeWidth: 1.5, strokeDashArray: [7, 6], selectable: false, evented: false, excludeFromExport: true, swHelper: true, opacity: .7 });
  canvas.add(printArea);

  function areaBox(view) { const area = AREAS[view]; return { left: area.l, top: area.t, width: area.w, height: area.h }; }
  const clipFor = view => new Rect({ ...areaBox(view), absolutePositioned: true });
  const designObjects = () => canvas.getObjects().filter(object => !object.swHelper);
  const serialize = () => designObjects().map(object => object.toObject(SAVED_PROPS));
  const allViews = () => ({ ...views, [current]: serialize() });
  const prepare = object => { object.set({ ...CONTROLS, originX: 'center', originY: 'center' }); object.setControlsVisibility?.({ mt: false, mb: false, ml: false, mr: false }); return object; };

  // ----- price -----
  function template() { return state.templates[0]; }
  function templateConfig() { try { return JSON.parse(template()?.config || '{}'); } catch { return {}; } }
  function priceLines(designs = allViews()) {
    const config = templateConfig(), cents = (key, fallback) => Number.isInteger(config[key]) ? config[key] : fallback;
    const lines = [['Base jersey', template()?.base_price_cents ?? 79900]];
    if (designs.front.length) lines.push(['Front print', cents('frontPrintCents', 10000)]);
    if (designs.back.length) lines.push(['Back print', cents('backPrintCents', 10000)]);
    if (designs.left.length) lines.push(['Left sleeve print', cents('sleevePrintCents', 7500)]);
    if (designs.right.length) lines.push(['Right sleeve print', cents('sleevePrintCents', 7500)]);
    return lines;
  }
  function renderPrice() {
    const lines = priceLines(), total = lines.reduce((sum, [, cents]) => sum + cents, 0);
    $('#cz-price-lines').innerHTML = lines.map(([label, cents], index) => `<div><span>${label}</span><b>${index ? '+ ' : ''}${money(cents)}</b></div>`).join('');
    $('#cz-total').textContent = money(total);
    $('#cz-cart-price').textContent = money(total);
  }

  // ----- views -----
  let paintToken = 0;
  async function paintGarment() {
    const token = ++paintToken;
    const [base, overlay] = await Promise.all([svgImage(garmentBase(current, garment)), svgImage(garmentOverlay(current, garment))]);
    if (token !== paintToken) return;
    printArea.set('stroke', isLight(current === 'left' || current === 'right' ? garment.sleeves : garment.body) ? '#111318' : '#ffffff');
    canvas.backgroundImage = base;
    canvas.overlayImage = overlay;
    canvas.requestRenderAll();
  }
  async function loadView(view) {
    muted++;
    canvas.discardActiveObject();
    designObjects().forEach(object => canvas.remove(object));
    current = view;
    printArea.set(areaBox(view)).setCoords();
    const objects = await util.enlivenObjects(views[view]);
    objects.forEach(object => canvas.add(prepare(object)));
    canvas.bringObjectToFront(printArea);
    await paintGarment();
    $$('[data-cz-view]').forEach(button => button.classList.toggle('active', button.dataset.czView === view));
    $('#cz-view-name').textContent = VIEW_LABELS[view];
    muted--;
    renderLayers();
    renderSelection();
  }
  async function switchView(view) {
    if (view === current) return;
    views[current] = serialize();
    await loadView(view);
  }

  async function renderView(view, multiplier = 1, format = 'png') {
    const element = document.createElement('canvas');
    const scene = new StaticCanvas(element, { width: W, height: H, enableRetinaScaling: false, renderOnAddRemove: false });
    const [base, overlay, objects] = await Promise.all([svgImage(garmentBase(view, garment)), svgImage(garmentOverlay(view, garment)), util.enlivenObjects(allViews()[view])]);
    scene.backgroundImage = base;
    scene.overlayImage = overlay;
    objects.forEach(object => scene.add(object));
    scene.renderAll();
    const url = scene.toDataURL({ format, quality: .9, multiplier });
    scene.dispose();
    return url;
  }
  let thumbTimer;
  function refreshThumbs() {
    clearTimeout(thumbTimer);
    thumbTimer = setTimeout(async () => {
      for (const view of VIEWS) {
        const image = $(`[data-cz-view="${view}"] img`);
        if (image) image.src = await renderView(view, .2);
      }
    }, 250);
  }

  // ----- history and drafts -----
  const snapshot = () => JSON.stringify({ views: allViews(), garment });
  function changed() {
    if (muted) return;
    history.past.push(snapshot());
    if (history.past.length > 50) history.past.shift();
    history.future = [];
    afterChange();
  }
  function afterChange() {
    $('#cz-undo').disabled = history.past.length < 2;
    $('#cz-redo').disabled = !history.future.length;
    renderPrice();
    renderLayers();
    refreshThumbs();
    try { localStorage.setItem(DRAFT_KEY, history.past.at(-1)); } catch { /* Large uploads can exceed browser storage; the draft is a convenience. */ }
  }
  async function restore(serialized) {
    const data = JSON.parse(serialized);
    Object.assign(views, data.views);
    Object.assign(garment, data.garment);
    syncGarmentControls();
    await loadView(current);
    afterChange();
  }
  async function undo() { if (history.past.length < 2) return; history.future.push(history.past.pop()); await restore(history.past.at(-1)); }
  async function redo() { const next = history.future.pop(); if (!next) return; history.past.push(next); await restore(next); }

  // ----- adding things -----
  function place(object, { view = current, y } = {}) {
    const area = AREAS[view], slot = [.5, .3, .72, .4, .6][designObjects().length % 5];
    prepare(object);
    object.set({ left: area.l + area.w / 2, top: y ?? area.t + area.h * slot, clipPath: clipFor(view) });
    canvas.add(object);
    canvas.bringObjectToFront(printArea);
    canvas.setActiveObject(object);
    canvas.requestRenderAll();
    changed();
    return object;
  }
  function fitInto(object, share = .7) {
    const area = AREAS[current], scale = Math.min((area.w * share) / object.width, (area.h * share) / object.height, 1.5);
    object.set({ scaleX: scale, scaleY: scale });
    return object;
  }
  function textObject(text, options = {}) {
    return new IText(text, { fontFamily: 'Bebas Neue', fontSize: 48, fill: '#ffffff', textAlign: 'center', paintFirst: 'stroke', strokeLineJoin: 'round', swRole: 'text', ...options });
  }
  function addText() {
    const value = $('#cz-text-input').value.trim() || 'YOUR TEXT';
    const object = textObject(value, { fontFamily: $('#cz-text-panel .cz-font.active')?.dataset.font || 'Bebas Neue', fill: $('#cz-text-color').value });
    place(fitInto(object, .9));
    $('#cz-text-input').value = '';
  }
  function addGraphic(name) {
    const object = new Path(GRAPHICS[name], { fill: $('#cz-graphic-color').value, swRole: 'graphic', swLabel: name });
    place(fitInto(object, .45));
  }
  async function readUpload(file) {
    if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type) || file.size > 4_000_000) throw new Error('Choose a PNG, JPG or WebP image up to 4 MB.');
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, 900 / Math.max(bitmap.width, bitmap.height));
    const element = document.createElement('canvas');
    element.width = Math.round(bitmap.width * scale);
    element.height = Math.round(bitmap.height * scale);
    element.getContext('2d').drawImage(bitmap, 0, 0, element.width, element.height);
    const webp = element.toDataURL('image/webp', .9);
    return webp.startsWith('data:image/webp') ? webp : element.toDataURL('image/png');
  }
  async function addImage(url) {
    const image = await FabricImage.fromURL(url);
    image.set({ swRole: 'image', swLabel: 'Image' });
    place(fitInto(image, .75));
  }

  // ----- name and number (back of the jersey, optional number on the front) -----
  function curvePath(object, amount) {
    object.set('path', undefined);
    object.initDimensions();
    if (!amount) return;
    const width = object.width * 1.08;
    object.set({ path: new Path(`M ${-width / 2} 0 Q 0 ${-amount * width / 120} ${width / 2} 0`, { visible: false, fill: '', stroke: '' }), pathAlign: 'center' });
    object.initDimensions();
  }
  function setArc(object, amount) {
    const center = object.getCenterPoint();
    object.swArc = amount;
    curvePath(object, amount);
    object.setPositionByOrigin(center, 'center', 'center');
    object.setCoords();
    canvas.requestRenderAll();
  }
  function jerseyTextOptions(role) {
    const outline = $('#cz-nn-outline').value, sizes = { name: 46, number: 190, 'front-number': 86 };
    return { fontFamily: $('#cz-nn-font').value, fill: $('#cz-nn-color').value, stroke: outline, strokeWidth: role === 'name' ? 5 : 8, fontSize: sizes[role], charSpacing: role === 'name' ? 80 : 0, swRole: role, swLabel: role === 'name' ? 'Player name' : role === 'number' ? 'Number' : 'Front number' };
  }
  async function applyNameNumber() {
    const name = $('#cz-nn-name').value.trim().toUpperCase(), number = $('#cz-nn-number').value.replace(/\D/g, '').slice(0, 2);
    if (current !== 'back') await switchView('back');
    muted++;
    const upsert = (role, text, y) => {
      let object = designObjects().find(item => item.swRole === role);
      if (!text) { if (object) canvas.remove(object); return; }
      if (!object) { object = textObject(text, jerseyTextOptions(role)); place(object, { y }); }
      object.set({ ...jerseyTextOptions(role), text });
      if (role === 'name') setArc(object, $('#cz-nn-arch').checked ? 45 : 0); else { object.initDimensions(); object.setCoords(); }
    };
    upsert('name', name, 190);
    upsert('number', number, 330);
    muted--;
    // The optional front number lives on the front view, which is stored as JSON while the back is on screen.
    const front = views.front.filter(item => item.swRole !== 'front-number');
    if (number && $('#cz-nn-front').checked) {
      const object = prepare(textObject(number, jerseyTextOptions('front-number')));
      object.set({ left: 300, top: 300, clipPath: clipFor('front') });
      front.push(object.toObject(SAVED_PROPS));
    }
    views.front = front;
    canvas.discardActiveObject();
    canvas.requestRenderAll();
    changed();
  }

  // ----- selection tools -----
  const active = () => canvas.getActiveObject();
  function renderSelection() {
    const object = active(), bar = $('#cz-object-bar');
    bar.hidden = !object;
    if (!object) return;
    const isText = object instanceof IText;
    $$('.cz-text-only', bar).forEach(element => { element.hidden = !isText; });
    $('#cz-sel-color').parentElement.hidden = object instanceof FabricImage;
    if (isText) {
      $('#cz-sel-font').value = object.fontFamily;
      $('#cz-sel-outline').value = hex(object.stroke) || '#111318';
      $('#cz-sel-arc').value = object.swArc || 0;
    }
    if (typeof object.fill === 'string' && hex(object.fill)) $('#cz-sel-color').value = object.fill;
  }
  function editSelected(action) {
    const object = active();
    if (!object) return;
    action(object);
    object.setCoords();
    canvas.requestRenderAll();
    changed();
  }
  async function duplicateSelected() {
    const object = active();
    if (!object) return;
    const copy = await object.clone(SAVED_PROPS);
    prepare(copy).set({ left: object.left + 16, top: object.top + 16, clipPath: clipFor(current) });
    canvas.add(copy);
    canvas.bringObjectToFront(printArea);
    canvas.setActiveObject(copy);
    changed();
  }
  function removeSelected() { const object = active(); if (object) { canvas.remove(object); canvas.discardActiveObject(); canvas.requestRenderAll(); changed(); } }

  // ----- layers -----
  function layerName(object) {
    if (object.text) return `“${object.text.slice(0, 18)}”`;
    return object.swLabel || (object instanceof FabricImage ? 'Image' : 'Graphic');
  }
  function renderLayers() {
    const list = $('#cz-layers'), objects = designObjects().reverse();
    list.replaceChildren();
    if (!objects.length) { list.innerHTML = `<p class="cz-empty">Nothing on the ${VIEW_LABELS[current].toLowerCase()} yet.</p>`; return; }
    for (const object of objects) {
      const row = document.createElement('div');
      row.className = `cz-layer${object === active() ? ' active' : ''}`;
      const label = document.createElement('button');
      label.type = 'button';
      label.textContent = layerName(object);
      label.onclick = () => { canvas.setActiveObject(object); canvas.requestRenderAll(); renderLayers(); renderSelection(); };
      row.append(label);
      for (const [symbol, title, action] of [['↑', 'Move up', () => canvas.bringObjectForward(object)], ['↓', 'Move down', () => canvas.sendObjectBackwards(object)], ['✕', 'Remove', () => canvas.remove(object)]]) {
        const button = document.createElement('button');
        button.type = 'button';
        button.textContent = symbol;
        button.title = title;
        button.setAttribute('aria-label', `${title}: ${layerName(object)}`);
        button.onclick = () => { action(); canvas.bringObjectToFront(printArea); canvas.requestRenderAll(); changed(); };
        row.append(button);
      }
      list.append(row);
    }
  }

  // ----- garment controls -----
  function swatches(target, colors, onPick) {
    target.innerHTML = colors.map(color => `<button type="button" class="cz-swatch" style="--swatch:${color}" data-color="${color}" aria-label="Colour ${color}"></button>`).join('');
    $$('button', target).forEach(button => button.onclick = () => onPick(button.dataset.color));
  }
  function setGarment(key, value) {
    garment[key] = value;
    syncGarmentControls();
    paintGarment();
    changed();
  }
  function syncGarmentControls() {
    for (const [key, input] of [['body', '#cz-body-color'], ['accent', '#cz-accent-color'], ['sleeves', '#cz-sleeve-color'], ['trim', '#cz-trim-color']]) $(input).value = garment[key];
    $$('[data-cz-fit]').forEach(button => button.classList.toggle('active', button.dataset.czFit === garment.fit));
    $$('[data-cz-pattern]').forEach(button => button.classList.toggle('active', button.dataset.czPattern === garment.pattern));
    $('#cz-fit-name').textContent = FITS[garment.fit].label;
    renderPatternTiles();
  }
  function renderPatternTiles() {
    $$('[data-cz-pattern] img').forEach(image => {
      const preview = { ...garment, pattern: image.parentElement.dataset.czPattern };
      image.src = svgUrl(garmentBase('front', preview, false));
    });
  }

  // ----- saving -----
  async function save(addToCart) {
    if (!state.user) { openAuth('login'); return; }
    if (!template()) { toast('The jersey studio is not available right now.'); return; }
    const buttons = [$('#cz-save'), $('#cz-cart')];
    buttons.forEach(button => { button.disabled = true; });
    try {
      canvas.discardActiveObject();
      const designs = allViews();
      if (!VIEWS.some(view => designs[view].length) && !confirm('Your jersey has no print yet. Save the plain jersey anyway?')) return;
      const previews = {};
      for (const view of VIEWS) previews[view] = await renderView(view, 1, 'webp');
      const result = await api('/api/designs', { method: 'POST', body: JSON.stringify({ templateId: template().id, name: $('#cz-design-name').value.trim() || 'My jersey', size, fit: garment.fit, garment, views: designs, frontDesign: designs.front, backDesign: designs.back, previews }) });
      if (addToCart) {
        await api('/api/cart/items', { method: 'POST', body: JSON.stringify({ productId: result.productId, quantity: 1 }) });
        await refreshCart();
        toast('Your custom jersey is in the cart.');
        location.hash = '#cart';
      } else toast('Design saved to your account.');
    } catch (error) { toast(error.message); } finally { buttons.forEach(button => { button.disabled = false; }); }
  }
  async function downloadPreview() {
    canvas.discardActiveObject();
    const link = document.createElement('a');
    link.href = await renderView(current, 2);
    link.download = `sports-world-jersey-${current}.png`;
    link.click();
  }

  // ----- wiring -----
  $$('[data-cz-tool]').forEach(button => button.onclick = () => {
    $$('[data-cz-tool]').forEach(tool => tool.classList.toggle('active', tool === button));
    $$('[data-cz-panel]').forEach(panel => { panel.hidden = panel.dataset.czPanel !== button.dataset.czTool; });
    if (button.dataset.czTool === 'number') switchView('back');
  });
  $$('[data-cz-view]').forEach(button => button.onclick = () => switchView(button.dataset.czView));
  $$('[data-cz-fit]').forEach(button => button.onclick = () => setGarment('fit', button.dataset.czFit));
  $$('[data-cz-pattern]').forEach(button => button.onclick = () => setGarment('pattern', button.dataset.czPattern));
  swatches($('#cz-body-swatches'), BODY_COLORS, color => { garment.sleeves = garment.sleeves === garment.body ? color : garment.sleeves; setGarment('body', color); });
  swatches($('#cz-accent-swatches'), ACCENT_COLORS, color => setGarment('accent', color));
  swatches($('#cz-sleeve-swatches'), BODY_COLORS, color => setGarment('sleeves', color));
  swatches($('#cz-trim-swatches'), ACCENT_COLORS, color => setGarment('trim', color));
  for (const [key, input] of [['body', '#cz-body-color'], ['accent', '#cz-accent-color'], ['sleeves', '#cz-sleeve-color'], ['trim', '#cz-trim-color']]) $(input).addEventListener('change', event => setGarment(key, event.target.value));

  $('#cz-text-panel .cz-fonts').innerHTML = FONTS.map((font, index) => `<button type="button" class="cz-font${index === 1 ? ' active' : ''}" data-font="${font}" style="font-family:'${font}'">${font}</button>`).join('');
  $$('#cz-text-panel .cz-font').forEach(button => button.onclick = () => {
    $$('#cz-text-panel .cz-font').forEach(font => font.classList.toggle('active', font === button));
    const object = active();
    if (object instanceof IText) editSelected(item => { item.set('fontFamily', button.dataset.font); setArc(item, item.swArc || 0); });
  });
  swatches($('#cz-text-swatches'), ['#ffffff', ...ACCENT_COLORS.slice(1)], color => { $('#cz-text-color').value = color; if (active() instanceof IText) editSelected(item => item.set('fill', color)); });
  $('#cz-add-text').onclick = addText;
  $('#cz-text-input').addEventListener('keydown', event => { if (event.key === 'Enter') addText(); });

  $('#cz-sel-font').innerHTML = FONTS.map(font => `<option value="${font}">${font}</option>`).join('');
  $('#cz-nn-font').innerHTML = JERSEY_FONTS.map(font => `<option value="${font}">${font}</option>`).join('');
  for (const id of ['#cz-nn-name', '#cz-nn-number']) $(id).addEventListener('input', applyNameNumber);
  for (const id of ['#cz-nn-font', '#cz-nn-color', '#cz-nn-outline', '#cz-nn-arch', '#cz-nn-front']) $(id).addEventListener('change', applyNameNumber);

  $('#cz-graphics').innerHTML = Object.entries(GRAPHICS).map(([name, path]) => `<button type="button" data-graphic="${name}" title="${name}" aria-label="Add ${name}"><svg viewBox="0 0 100 100"><path d="${path}"/></svg></button>`).join('');
  $$('[data-graphic]').forEach(button => button.onclick = () => addGraphic(button.dataset.graphic));
  swatches($('#cz-graphic-swatches'), ['#ffffff', ...ACCENT_COLORS.slice(1)], color => { $('#cz-graphic-color').value = color; if (active() instanceof Path) editSelected(item => item.set('fill', color)); });

  $('#cz-upload').addEventListener('change', async event => {
    const file = event.target.files[0];
    event.target.value = '';
    if (!file) return;
    try {
      const url = await readUpload(file);
      uploads.unshift(url);
      $('#cz-uploads').innerHTML = uploads.slice(0, 6).map((src, index) => `<button type="button" data-upload="${index}" aria-label="Add this upload again"><img src="${src}" alt=""></button>`).join('');
      $$('[data-upload]').forEach(button => button.onclick = () => addImage(uploads[Number(button.dataset.upload)]));
      await addImage(url);
    } catch (error) { toast(error.message || 'That image could not be read.'); }
  });

  $('#cz-sel-color').addEventListener('input', event => editSelected(item => item.set('fill', event.target.value)));
  $('#cz-sel-outline').addEventListener('input', event => editSelected(item => item.set({ stroke: event.target.value, strokeWidth: item.strokeWidth || 4 })));
  $('#cz-sel-font').addEventListener('change', event => editSelected(item => { item.set('fontFamily', event.target.value); setArc(item, item.swArc || 0); }));
  $('#cz-sel-arc').addEventListener('input', event => { const object = active(); if (object) setArc(object, Number(event.target.value)); });
  $('#cz-sel-arc').addEventListener('change', () => changed());
  $('#cz-sel-center').onclick = () => editSelected(item => { const area = AREAS[current]; item.setPositionByOrigin(new Point(area.l + area.w / 2, item.getCenterPoint().y), 'center', 'center'); });
  $('#cz-sel-forward').onclick = () => editSelected(item => { canvas.bringObjectForward(item); canvas.bringObjectToFront(printArea); });
  $('#cz-sel-back').onclick = () => editSelected(item => canvas.sendObjectBackwards(item));
  $('#cz-sel-flip').onclick = () => editSelected(item => item.set('flipX', !item.flipX));
  $('#cz-sel-copy').onclick = duplicateSelected;
  $('#cz-sel-delete').onclick = removeSelected;
  $('#cz-undo').onclick = undo;
  $('#cz-redo').onclick = redo;
  $('#cz-reset').onclick = async () => {
    if (!confirm('Clear every design from all four sides?')) return;
    VIEWS.forEach(view => { views[view] = []; });
    await loadView(current);
    changed();
  };
  $('#cz-download').onclick = downloadPreview;
  $('#cz-save').onclick = () => save(false);
  $('#cz-cart').onclick = () => save(true);
  $$('[data-cz-size]').forEach(button => button.onclick = () => {
    size = button.dataset.czSize;
    $$('[data-cz-size]').forEach(option => option.classList.toggle('active', option === button));
  });

  canvas.on('object:moving', ({ target }) => {
    const area = AREAS[current], center = target.getCenterPoint();
    const x = clamp(center.x, area.l, area.l + area.w), y = clamp(center.y, area.t, area.t + area.h);
    if (x !== center.x || y !== center.y) target.setPositionByOrigin(new Point(x, y), 'center', 'center');
  });
  canvas.on('object:modified', changed);
  canvas.on('text:editing:exited', ({ target }) => { if (target.swArc) setArc(target, target.swArc); changed(); });
  for (const event of ['selection:created', 'selection:updated', 'selection:cleared']) canvas.on(event, () => { renderSelection(); renderLayers(); });
  root.addEventListener('keydown', event => {
    if (event.target.closest('input, textarea, select') || active()?.isEditing) return;
    if ((event.key === 'Delete' || event.key === 'Backspace') && active()) { event.preventDefault(); removeSelected(); }
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'z') { event.preventDefault(); event.shiftKey ? redo() : undo(); }
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'y') { event.preventDefault(); redo(); }
  });

  // Scale the 600×680 design surface to whatever room the stage has.
  const wrap = $('#cz-canvas-wrap');
  const fit = () => {
    const width = Math.min(wrap.clientWidth, (window.innerHeight - 150) * W / H, W);
    if (width > 0) canvas.setDimensions({ width: `${width}px`, height: `${width * H / W}px` }, { cssOnly: true });
  };
  new ResizeObserver(fit).observe(wrap);

  async function start() {
    let draft = null;
    try { draft = localStorage.getItem(DRAFT_KEY); } catch { /* Storage can be unavailable in private browsing. */ }
    if (draft) {
      try { const data = JSON.parse(draft); Object.assign(views, data.views); Object.assign(garment, data.garment); } catch { /* Ignore a damaged draft. */ }
    }
    syncGarmentControls();
    await loadView('front');
    history.past = [snapshot()];
    afterChange();
    await fontsReady;
  }
  const ready = start();
  return { refresh: () => ready.then(fit) };
}

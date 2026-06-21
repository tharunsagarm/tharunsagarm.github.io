/**
 * AutoFlow — Free Automation Workflow Creator
 * Full application logic: canvas, nodes, connections, execution engine, localStorage persistence
 */

/* ══════════════════════════════════
   CONFIGURATION & CONSTANTS
══════════════════════════════════ */
const NODE_DEFS = {
  /* TRIGGERS */
  'trigger-manual': {
    label: 'Manual Run', category: 'trigger', icon: 'fa-hand-pointer',
    desc: 'Start manually',
    fields: [
      { key: 'payload', label: 'Trigger Payload / Input Text', type: 'textarea',
        placeholder: 'Enter sample input data for this workflow run...',
        default: 'Hello! I need help with a refund for order #A4829. I placed the order 3 days ago but have not received a confirmation email yet. Can you assist? — Maria' }
    ]
  },
  'trigger-schedule': {
    label: 'Schedule', category: 'trigger', icon: 'fa-clock',
    desc: 'Run on a schedule',
    fields: [
      { key: 'cron',    label: 'Cron Expression', type: 'text', placeholder: '0 9 * * 1-5', default: '0 9 * * 1-5' },
      { key: 'payload', label: 'Data Payload', type: 'textarea', placeholder: 'Scheduled run data...', default: 'Weekly sales report generation triggered.' }
    ]
  },
  'trigger-webhook': {
    label: 'Webhook', category: 'trigger', icon: 'fa-link',
    desc: 'HTTP endpoint trigger',
    fields: [
      { key: 'endpoint', label: 'Webhook URL (auto-generated)', type: 'text', placeholder: 'https://autoflow.io/hook/...', default: 'https://autoflow.io/hook/wh_f8a9c21b', readonly: true },
      { key: 'payload',  label: 'Sample JSON Body', type: 'textarea', placeholder: '{"name": "John"}', default: '{"event":"user.signup","email":"john@acme.com","name":"John Doe","plan":"pro"}' }
    ]
  },
  'trigger-email': {
    label: 'Email Received', category: 'trigger', icon: 'fa-envelope-open-text',
    desc: 'On new email',
    fields: [
      { key: 'from',    label: 'Filter: From (leave blank for any)', type: 'text', placeholder: '*@domain.com', default: '' },
      { key: 'subject', label: 'Filter: Subject Contains', type: 'text', placeholder: 'urgent, order, refund', default: '' },
      { key: 'payload', label: 'Sample Email Content', type: 'textarea', default: 'Subject: Order issue\nFrom: customer@example.com\n\nHi, I ordered product SKU-502 yesterday and got the wrong item.' }
    ]
  },
  'trigger-form': {
    label: 'Form Submit', category: 'trigger', icon: 'fa-wpforms',
    desc: 'On form submission',
    fields: [
      { key: 'formId',  label: 'Form ID / Name', type: 'text', placeholder: 'contact-form', default: 'contact-form' },
      { key: 'payload', label: 'Sample Submission', type: 'textarea', default: '{"name":"Alice Smith","email":"alice@startup.io","message":"I want a demo of your enterprise plan for 200 seats."}' }
    ]
  },

  /* AI ENGINES */
  'ai-generate': {
    label: 'Generate Text', category: 'ai', icon: 'fa-wand-magic-sparkles',
    desc: 'AI text generation',
    fields: [
      { key: 'prompt', label: 'Prompt (use {{input}} for upstream data)', type: 'textarea',
        default: 'Write a professional, helpful customer support reply for the following request. Be concise and empathetic.\n\nRequest: {{input}}' },
      { key: 'tone', label: 'Tone', type: 'select', options: ['Professional', 'Friendly', 'Formal', 'Technical', 'Concise'], default: 'Professional' },
      { key: 'maxWords', label: 'Max Words', type: 'number', min: 20, max: 1000, default: 150 }
    ]
  },
  'ai-summarize': {
    label: 'Summarize', category: 'ai', icon: 'fa-compress',
    desc: 'Condense long text',
    fields: [
      { key: 'input',  label: 'Input Source', type: 'text', placeholder: '{{input}}', default: '{{input}}' },
      { key: 'style',  label: 'Summary Style', type: 'select', options: ['Bullet Points', 'One Sentence', 'Short Paragraph', 'Executive Brief'], default: 'Short Paragraph' },
      { key: 'length', label: 'Max Length (chars)', type: 'number', min: 50, max: 1000, default: 200 }
    ]
  },
  'ai-classify': {
    label: 'Classify / Tag', category: 'ai', icon: 'fa-tags',
    desc: 'Categorize content',
    fields: [
      { key: 'input',      label: 'Input', type: 'text', default: '{{input}}' },
      { key: 'categories', label: 'Categories (comma-separated)', type: 'text', default: 'billing, technical, sales, general, urgent' }
    ]
  },
  'ai-sentiment': {
    label: 'Sentiment Check', category: 'ai', icon: 'fa-face-smile-beam',
    desc: 'Analyse emotion/tone',
    fields: [
      { key: 'input', label: 'Text Input', type: 'text', default: '{{input}}' }
    ]
  },
  'ai-translate': {
    label: 'Translate', category: 'ai', icon: 'fa-language',
    desc: 'Language translation',
    fields: [
      { key: 'input',  label: 'Text to Translate', type: 'text', default: '{{input}}' },
      { key: 'target', label: 'Target Language', type: 'select', options: ['English','Spanish','French','German','Portuguese','Japanese','Chinese','Arabic','Hindi','Russian'], default: 'English' }
    ]
  },
  'ai-extract': {
    label: 'Data Extractor', category: 'ai', icon: 'fa-scissors',
    desc: 'Pull fields from text',
    fields: [
      { key: 'input',  label: 'Source Text', type: 'text', default: '{{input}}' },
      { key: 'fields', label: 'Fields to Extract (comma-separated)', type: 'text', default: 'name, email, phone, order_id, issue_type' }
    ]
  },

  /* LOGIC */
  'logic-condition': {
    label: 'Condition (If/Else)', category: 'logic', icon: 'fa-code-branch',
    desc: 'Branch workflow',
    fields: [
      { key: 'value',    label: 'Value to Check', type: 'text', default: '{{input}}' },
      { key: 'operator', label: 'Operator', type: 'select', options: ['contains','equals','not equals','greater than','less than','starts with','ends with','is empty','is not empty'], default: 'contains' },
      { key: 'compare',  label: 'Compare With', type: 'text', default: 'urgent' }
    ]
  },
  'logic-delay': {
    label: 'Delay / Wait', category: 'logic', icon: 'fa-hourglass-half',
    desc: 'Pause execution',
    fields: [
      { key: 'duration', label: 'Duration (ms)', type: 'number', min: 100, max: 30000, default: 1000 },
      { key: 'reason',   label: 'Reason / Label', type: 'text', default: 'Waiting before next step...' }
    ]
  },
  'logic-loop': {
    label: 'Loop / Iterator', category: 'logic', icon: 'fa-arrows-spin',
    desc: 'Repeat for each item',
    fields: [
      { key: 'input',    label: 'Items (comma-separated or JSON array)', type: 'textarea', default: 'item1, item2, item3' },
      { key: 'variable', label: 'Loop Variable Name', type: 'text', default: 'item' }
    ]
  },
  'logic-merge': {
    label: 'Merge Data', category: 'logic', icon: 'fa-code-merge',
    desc: 'Combine multiple inputs',
    fields: [
      { key: 'separator', label: 'Join Separator', type: 'text', default: '\n---\n' },
      { key: 'label',     label: 'Merged Output Label', type: 'text', default: 'combined_data' }
    ]
  },
  'logic-filter': {
    label: 'Filter', category: 'logic', icon: 'fa-filter',
    desc: 'Keep matching items only',
    fields: [
      { key: 'input',    label: 'Input List', type: 'text', default: '{{input}}' },
      { key: 'keyword',  label: 'Keep items that contain', type: 'text', default: 'urgent' }
    ]
  },

  /* ACTIONS */
  'action-email': {
    label: 'Send Email', category: 'action', icon: 'fa-envelope',
    desc: 'Draft & send email',
    fields: [
      { key: 'to',      label: 'To (Email Address)', type: 'text', placeholder: 'support@acme.com', default: 'customer@example.com' },
      { key: 'subject', label: 'Subject', type: 'text', default: 'Re: Your request' },
      { key: 'body',    label: 'Body (use {{input}} for AI output)', type: 'textarea', default: '{{input}}\n\nKind regards,\nAutoFlow Support' }
    ]
  },
  'action-slack': {
    label: 'Slack Message', category: 'action', icon: 'fa-slack',
    desc: 'Post to Slack channel',
    fields: [
      { key: 'channel', label: 'Channel', type: 'text', placeholder: '#support', default: '#support-alerts' },
      { key: 'message', label: 'Message (use {{input}})', type: 'textarea', default: ':robot_face: *AutoFlow Alert:*\n{{input}}' }
    ]
  },
  'action-sheets': {
    label: 'Google Sheets', category: 'action', icon: 'fa-table-cells-large',
    desc: 'Append row',
    fields: [
      { key: 'sheetId',  label: 'Sheet ID / Name', type: 'text', default: 'Automation_Log' },
      { key: 'columns',  label: 'Columns (comma-separated)', type: 'text', default: 'timestamp, status, summary, category' },
      { key: 'values',   label: 'Values Template', type: 'textarea', default: '{{timestamp}}, success, {{input}}, {{category}}' }
    ]
  },
  'action-http': {
    label: 'HTTP Request', category: 'action', icon: 'fa-cloud-arrow-up',
    desc: 'Call external API',
    fields: [
      { key: 'url',     label: 'Endpoint URL', type: 'text', default: 'https://api.example.com/webhook' },
      { key: 'method',  label: 'Method', type: 'select', options: ['POST','GET','PUT','PATCH','DELETE'], default: 'POST' },
      { key: 'headers', label: 'Headers (JSON)', type: 'textarea', default: '{"Content-Type":"application/json","Authorization":"Bearer YOUR_TOKEN"}' },
      { key: 'body',    label: 'Request Body', type: 'textarea', default: '{"data": "{{input}}"}' }
    ]
  },
  'action-database': {
    label: 'Save to DB', category: 'action', icon: 'fa-database',
    desc: 'Write to local store',
    fields: [
      { key: 'table',  label: 'Collection / Table Name', type: 'text', default: 'automation_runs' },
      { key: 'record', label: 'Record Template', type: 'textarea', default: '{"run_at":"{{timestamp}}","result":"{{input}}","workflow":"{{workflow_name}}"}' }
    ]
  },
  'action-notification': {
    label: 'Browser Alert', category: 'action', icon: 'fa-bell',
    desc: 'Show notification',
    fields: [
      { key: 'title',   label: 'Notification Title', type: 'text', default: '✅ Workflow Complete' },
      { key: 'message', label: 'Message (use {{input}})', type: 'textarea', default: 'AutoFlow finished processing:\n\n{{input}}' }
    ]
  },

  /* TRANSFORM */
  'transform-format': {
    label: 'Text Formatter', category: 'transform', icon: 'fa-align-left',
    desc: 'Clean & transform text',
    fields: [
      { key: 'input',  label: 'Input', type: 'text', default: '{{input}}' },
      { key: 'ops',    label: 'Operations', type: 'select', options: ['Trim whitespace','To uppercase','To lowercase','Remove special chars','Capitalize words','Slugify'], default: 'Trim whitespace' }
    ]
  },
  'transform-json': {
    label: 'JSON Parser', category: 'transform', icon: 'fa-brackets-curly',
    desc: 'Extract JSON field',
    fields: [
      { key: 'input',    label: 'JSON Input', type: 'text', default: '{{input}}' },
      { key: 'jsonPath', label: 'Field Path (e.g. user.email)', type: 'text', default: 'email' }
    ]
  },
  'transform-math': {
    label: 'Math Operation', category: 'transform', icon: 'fa-calculator',
    desc: 'Arithmetic on values',
    fields: [
      { key: 'valueA', label: 'Value A', type: 'text', default: '{{input}}' },
      { key: 'op',     label: 'Operation', type: 'select', options: ['+','-','×','÷','% modulo','^ power', 'Round', 'Floor', 'Ceil', 'Abs'], default: '+' },
      { key: 'valueB', label: 'Value B', type: 'text', default: '10' }
    ]
  }
};

const CATEGORY_INFO = {
  trigger:   { color: 'var(--c-trigger)',   cls: 'fn-trigger',   bg: 'trigger-bg',   arrowId: 'trigger'   },
  ai:        { color: 'var(--c-ai)',        cls: 'fn-ai',        bg: 'ai-bg',        arrowId: 'ai'        },
  logic:     { color: 'var(--c-logic)',     cls: 'fn-logic',     bg: 'logic-bg',     arrowId: 'logic'     },
  action:    { color: 'var(--c-action)',    cls: 'fn-action',    bg: 'action-bg',    arrowId: 'action'    },
  transform: { color: 'var(--c-transform)', cls: 'fn-transform', bg: 'transform-bg', arrowId: 'transform' }
};

/* ══════════════════════════════════
   APPLICATION STATE
══════════════════════════════════ */
let state = {
  nodes: [],       // { id, type, x, y, params, zIndex }
  connections: [], // { id, from, to }
  nextZ: 10,
  selectedId: null,

  // Pan/zoom
  pan: { x: 0, y: 0 },
  zoom: 1,

  // Connection drag
  linking: false,
  linkFrom: null, // nodeId

  // Node drag
  dragging: null,
  dragOff: { x: 0, y: 0 },

  // Canvas pan
  panning: false,
  panStart: { x: 0, y: 0 },
  panFrom: { x: 0, y: 0 },

  // Undo/redo
  history: [],
  historyIndex: -1,

  isRunning: false,
  runOutputs: {},
  showGrid: true,
  showMinimap: false
};

/* ══════════════════════════════════
   DOM REFS
══════════════════════════════════ */
const $ = id => document.getElementById(id);
const surface    = $('canvas-surface');
const connSvg    = $('conn-svg');
const canvasWrap = $('canvas-wrap');
const configBody = $('config-panel-body');
const configPanel = $('config-panel');
const consoleBody = $('console-body');
const runBadge   = $('run-badge');
const btnRun     = $('btn-run');
const emptyState = $('canvas-empty');

/* ══════════════════════════════════
   INIT
══════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  setupEvents();
  applyTransform();
  log('AutoFlow ready — free, local, no account required', 'system');
});

/* ══════════════════════════════════
   EVENT SETUP
══════════════════════════════════ */
function setupEvents() {
  // Library drag
  document.querySelectorAll('.lib-node').forEach(el => {
    el.addEventListener('dragstart', e => e.dataTransfer.setData('ntype', el.dataset.type));
  });

  // Canvas: drop
  canvasWrap.addEventListener('dragover', e => e.preventDefault());
  canvasWrap.addEventListener('drop', onCanvasDrop);

  // Canvas: pan (middle mouse or right drag)
  canvasWrap.addEventListener('mousedown', onCanvasPanStart);
  document.addEventListener('mousemove', onMouseMove);
  document.addEventListener('mouseup', onMouseUp);

  // Canvas: wheel zoom
  canvasWrap.addEventListener('wheel', onWheel, { passive: false });

  // Canvas: deselect on background click
  canvasWrap.addEventListener('click', e => {
    if (e.target === canvasWrap || e.target === surface || e.target === connSvg) {
      deselectAll();
      if (state.linking) cancelLink();
    }
  });

  // Toolbar buttons
  $('btn-run').addEventListener('click', runWorkflow);
  $('btn-clear').addEventListener('click', clearAll);
  $('btn-save').addEventListener('click', saveWorkflow);
  $('btn-load').addEventListener('click', openLoadModal);
  $('btn-export').addEventListener('click', exportWorkflow);
  $('btn-undo').addEventListener('click', undo);
  $('btn-redo').addEventListener('click', redo);
  $('btn-zoom-in').addEventListener('click', () => changeZoom(0.15));
  $('btn-zoom-out').addEventListener('click', () => changeZoom(-0.15));
  $('btn-fit').addEventListener('click', fitToScreen);
  $('cv-zoom-in').addEventListener('click', () => changeZoom(0.15));
  $('cv-zoom-out').addEventListener('click', () => changeZoom(-0.15));
  $('cv-fit').addEventListener('click', fitToScreen);
  $('btn-grid').addEventListener('click', toggleGrid);
  $('btn-minimap').addEventListener('click', toggleMinimap);
  $('btn-collapse-library').addEventListener('click', collapseLibrary);
  $('btn-close-config').addEventListener('click', closeConfig);
  $('btn-clear-log').addEventListener('click', clearLog);
  $('btn-toggle-console').addEventListener('click', toggleConsole);

  // Load modal
  $('btn-close-load').addEventListener('click', () => $('load-modal').style.display = 'none');

  // Templates
  document.querySelectorAll('.tmpl-chip').forEach(el => {
    el.addEventListener('click', () => loadTemplate(el.dataset.template));
  });

  // Library search
  $('library-search').addEventListener('input', filterLibrary);

  // Keyboard shortcuts
  document.addEventListener('keydown', onKeyDown);
}

/* ══════════════════════════════════
   PAN / ZOOM
══════════════════════════════════ */
function onCanvasPanStart(e) {
  if (e.button === 1 || e.button === 2 || (e.button === 0 && e.target === canvasWrap && !state.linking)) {
    state.panning = true;
    state.panStart = { x: e.clientX, y: e.clientY };
    state.panFrom  = { ...state.pan };
    e.preventDefault();
  }
}

function onWheel(e) {
  e.preventDefault();
  const rect = canvasWrap.getBoundingClientRect();
  const mx = e.clientX - rect.left;
  const my = e.clientY - rect.top;

  const delta = e.deltaY < 0 ? 0.1 : -0.1;
  const newZoom = Math.min(3, Math.max(0.2, state.zoom + delta));

  state.pan.x = mx - (mx - state.pan.x) * (newZoom / state.zoom);
  state.pan.y = my - (my - state.pan.y) * (newZoom / state.zoom);
  state.zoom = newZoom;

  applyTransform();
}

function changeZoom(delta) {
  const rect = canvasWrap.getBoundingClientRect();
  const cx = rect.width / 2, cy = rect.height / 2;
  const newZoom = Math.min(3, Math.max(0.2, state.zoom + delta));
  state.pan.x = cx - (cx - state.pan.x) * (newZoom / state.zoom);
  state.pan.y = cy - (cy - state.pan.y) * (newZoom / state.zoom);
  state.zoom = newZoom;
  applyTransform();
}

function applyTransform() {
  surface.style.transform = `translate(${state.pan.x}px, ${state.pan.y}px) scale(${state.zoom})`;
  $('zoom-label').textContent = Math.round(state.zoom * 100) + '%';
  redrawConnections();
}

function fitToScreen() {
  if (state.nodes.length === 0) { state.pan = { x: 0, y: 0 }; state.zoom = 1; applyTransform(); return; }
  const rect = canvasWrap.getBoundingClientRect();
  const xs = state.nodes.map(n => n.x);
  const ys = state.nodes.map(n => n.y);
  const minX = Math.min(...xs), maxX = Math.max(...xs) + 220;
  const minY = Math.min(...ys), maxY = Math.max(...ys) + 100;
  const ww = maxX - minX, wh = maxY - minY;
  const zx = (rect.width  - 80) / ww;
  const zy = (rect.height - 80) / wh;
  state.zoom = Math.min(1, Math.min(zx, zy));
  state.pan.x = (rect.width  - ww * state.zoom) / 2 - minX * state.zoom;
  state.pan.y = (rect.height - wh * state.zoom) / 2 - minY * state.zoom;
  applyTransform();
}

function toggleGrid() {
  state.showGrid = !state.showGrid;
  canvasWrap.style.backgroundImage = state.showGrid
    ? 'radial-gradient(rgba(255,255,255,0.035) 1.5px, transparent 1.5px)'
    : 'none';
  $('btn-grid').dataset.active = String(state.showGrid);
}

function toggleMinimap() {
  state.showMinimap = !state.showMinimap;
  const mm = $('minimap-canvas');
  mm.style.display = state.showMinimap ? 'block' : 'none';
  if (state.showMinimap) drawMinimap();
}

/* ══════════════════════════════════
   MOUSE MOVE / UP (unified handler)
══════════════════════════════════ */
function onMouseMove(e) {
  if (state.panning) {
    state.pan.x = state.panFrom.x + (e.clientX - state.panStart.x);
    state.pan.y = state.panFrom.y + (e.clientY - state.panStart.y);
    applyTransform();
  }
  if (state.dragging) {
    const rect = canvasWrap.getBoundingClientRect();
    let nx = (e.clientX - rect.left - state.pan.x) / state.zoom - state.dragOff.x;
    let ny = (e.clientY - rect.top  - state.pan.y) / state.zoom - state.dragOff.y;
    nx = Math.max(0, nx); ny = Math.max(0, ny);
    const node = state.nodes.find(n => n.id === state.dragging);
    if (node) { node.x = nx; node.y = ny; }
    const el = document.getElementById(state.dragging);
    if (el) { el.style.left = nx + 'px'; el.style.top = ny + 'px'; }
    redrawConnections();
    if (state.showMinimap) drawMinimap();
  }
}

function onMouseUp(e) {
  if (state.dragging) { pushHistory(); state.dragging = null; }
  if (state.panning) state.panning = false;
}

/* ══════════════════════════════════
   DROP NODE FROM LIBRARY
══════════════════════════════════ */
function onCanvasDrop(e) {
  e.preventDefault();
  const type = e.dataTransfer.getData('ntype');
  if (!type || !NODE_DEFS[type]) return;
  const rect = canvasWrap.getBoundingClientRect();
  const x = (e.clientX - rect.left - state.pan.x) / state.zoom - 110;
  const y = (e.clientY - rect.top  - state.pan.y) / state.zoom - 40;
  createNode(type, Math.max(0, x), Math.max(0, y));
  pushHistory();
}

/* ══════════════════════════════════
   NODE CREATION
══════════════════════════════════ */
let _nodeSeq = 0;
function uid() { return 'n' + (++_nodeSeq) + '_' + Math.random().toString(36).substr(2, 5); }
let _connSeq = 0;
function cuid() { return 'c' + (++_connSeq) + '_' + Math.random().toString(36).substr(2, 5); }

function createNode(type, x, y) {
  const def = NODE_DEFS[type];
  const params = {};
  (def.fields || []).forEach(f => { params[f.key] = f.default !== undefined ? f.default : ''; });

  const node = { id: uid(), type, x, y, params, zIndex: state.nextZ++ };
  state.nodes.push(node);
  renderNode(node);
  updateEmptyState();
  return node;
}

function renderNode(node) {
  const def = NODE_DEFS[node.type];
  const cat = CATEGORY_INFO[def.category];

  const el = document.createElement('div');
  el.className = `flow-node ${cat.cls}`;
  el.id = node.id;
  el.style.left = node.x + 'px';
  el.style.top  = node.y + 'px';
  el.style.zIndex = node.zIndex;

  // Preview text
  const previewText = getPreview(node);

  el.innerHTML = `
    <div class="node-header" data-id="${node.id}">
      <div class="node-hdr-icon ${cat.bg}"><i class="fa-solid ${def.icon}"></i></div>
      <span class="node-hdr-label">${def.label}</span>
      <span class="node-status-dot"></span>
    </div>
    <div class="node-divider"></div>
    <div class="node-body">
      <div class="node-preview" id="prev_${node.id}">${previewText}</div>
    </div>
    ${def.category !== 'trigger' ? `<div class="port port-in" data-node="${node.id}" data-dir="in"></div>` : ''}
    <div class="port port-out" data-node="${node.id}" data-dir="out"></div>
  `;

  // Drag on header
  el.querySelector('.node-header').addEventListener('mousedown', e => startNodeDrag(e, node.id));

  // Click to select
  el.addEventListener('click', e => {
    if (!e.target.classList.contains('port')) {
      e.stopPropagation();
      selectNode(node.id);
    }
  });

  // Ports
  el.querySelectorAll('.port').forEach(p => {
    p.addEventListener('click', e => { e.stopPropagation(); handlePortClick(p); });
  });

  surface.appendChild(el);
  redrawConnections();
}

function getPreview(node) {
  const def = NODE_DEFS[node.type];
  const f = def.fields?.[0];
  if (!f) return def.desc;
  const val = (node.params[f.key] || '').toString();
  const short = val.length > 42 ? val.substring(0, 42) + '…' : val;
  return short || def.desc;
}

/* ══════════════════════════════════
   NODE DRAGGING
══════════════════════════════════ */
function startNodeDrag(e, id) {
  if (e.button !== 0) return;
  e.stopPropagation();
  state.dragging = id;
  const el = document.getElementById(id);
  const rect = canvasWrap.getBoundingClientRect();
  const nodeX = (e.clientX - rect.left - state.pan.x) / state.zoom;
  const nodeY = (e.clientY - rect.top  - state.pan.y) / state.zoom;
  const node = state.nodes.find(n => n.id === id);
  state.dragOff = { x: nodeX - node.x, y: nodeY - node.y };
  // Bring to front
  node.zIndex = state.nextZ++;
  el.style.zIndex = node.zIndex;
}

/* ══════════════════════════════════
   PORT CONNECTIONS
══════════════════════════════════ */
function handlePortClick(port) {
  const nodeId = port.dataset.node;
  const dir = port.dataset.dir;

  if (!state.linking) {
    // Must start from output port
    if (dir === 'out') {
      state.linking = true;
      state.linkFrom = nodeId;
      port.style.boxShadow = '0 0 0 3px var(--accent)';
      canvasWrap.classList.add('connecting');
      log(`Linking from "${NODE_DEFS[getNodeType(nodeId)].label}" — now click an input port to connect`, 'info');
    }
  } else {
    if (dir === 'in' && nodeId !== state.linkFrom) {
      // Check no duplicate
      const exists = state.connections.some(c => c.from === state.linkFrom && c.to === nodeId);
      if (!exists) {
        state.connections.push({ id: cuid(), from: state.linkFrom, to: nodeId });
        log(`Connected: "${NODE_DEFS[getNodeType(state.linkFrom)].label}" → "${NODE_DEFS[getNodeType(nodeId)].label}"`, 'success');
        redrawConnections();
        pushHistory();
      } else {
        log('Connection already exists between these nodes.', 'warn');
      }
    }
    cancelLink();
  }
}

function cancelLink() {
  state.linking = false;
  state.linkFrom = null;
  canvasWrap.classList.remove('connecting');
  document.querySelectorAll('.port').forEach(p => p.style.boxShadow = '');
}

/* ══════════════════════════════════
   CONNECTION DRAWING (SVG)
══════════════════════════════════ */
function redrawConnections() {
  connSvg.querySelectorAll('.dyn-path').forEach(p => p.remove());

  state.connections.forEach(conn => {
    const fromEl = document.getElementById(conn.from);
    const toEl   = document.getElementById(conn.to);
    if (!fromEl || !toEl) return;

    const fromPort = fromEl.querySelector('.port-out');
    const toPort   = toEl.querySelector('.port-in');
    if (!fromPort || !toPort) return;

    const svgRect  = connSvg.getBoundingClientRect();
    const fr = fromPort.getBoundingClientRect();
    const tr = toPort.getBoundingClientRect();

    const x1 = fr.left - svgRect.left + fr.width / 2;
    const y1 = fr.top  - svgRect.top  + fr.height / 2;
    const x2 = tr.left - svgRect.left + tr.width / 2;
    const y2 = tr.top  - svgRect.top  + tr.height / 2;

    const dx = Math.max(60, Math.abs(x2 - x1) * 0.5);
    const d = `M${x1},${y1} C${x1+dx},${y1} ${x2-dx},${y2} ${x2},${y2}`;

    const fromType = getNodeType(conn.from);
    const cat = CATEGORY_INFO[NODE_DEFS[fromType]?.category] || CATEGORY_INFO.action;

    // Invisible wide hit target
    const hit = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    hit.setAttribute('d', d);
    hit.setAttribute('class', 'conn-path-hover dyn-path');
    hit.addEventListener('click', () => removeConnection(conn.id));
    hit.setAttribute('title', 'Click to remove this connection');

    // Visible path
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', d);
    path.setAttribute('class', `conn-path dyn-path${state.isRunning ? ' active-flow' : ''}`);
    path.setAttribute('id', 'cp_' + conn.id);
    path.style.stroke = cat.color;
    path.setAttribute('marker-end', `url(#arrow-${cat.arrowId})`);

    connSvg.appendChild(hit);
    connSvg.appendChild(path);
  });
}

function removeConnection(id) {
  state.connections = state.connections.filter(c => c.id !== id);
  redrawConnections();
  pushHistory();
  log('Connection removed', 'info');
}

/* ══════════════════════════════════
   NODE SELECTION & CONFIG
══════════════════════════════════ */
function selectNode(id) {
  deselectAll();
  state.selectedId = id;
  document.getElementById(id)?.classList.add('selected');
  openConfigPanel(id);
}

function deselectAll() {
  if (state.selectedId) document.getElementById(state.selectedId)?.classList.remove('selected');
  state.selectedId = null;
}

function openConfigPanel(id) {
  const node = state.nodes.find(n => n.id === id);
  if (!node) return;
  const def = NODE_DEFS[node.type];
  const cat = CATEGORY_INFO[def.category];

  configBody.innerHTML = '';
  configPanel.classList.add('open');

  // Title
  const title = document.createElement('div');
  title.className = 'cfg-section-title';
  title.innerHTML = `<i class="fa-solid ${def.icon}" style="color:${cat.color}"></i> ${def.label}`;
  configBody.appendChild(title);

  // Fields
  (def.fields || []).forEach(field => {
    const grp = document.createElement('div');
    grp.className = 'cfg-group';

    const lbl = document.createElement('label');
    lbl.className = 'cfg-label';
    lbl.textContent = field.label;
    grp.appendChild(lbl);

    let inp;
    if (field.type === 'textarea') {
      inp = document.createElement('textarea');
      inp.className = 'cfg-textarea';
      inp.value = node.params[field.key] ?? '';
    } else if (field.type === 'select') {
      inp = document.createElement('select');
      inp.className = 'cfg-select';
      (field.options || []).forEach(opt => {
        const o = document.createElement('option');
        o.value = opt; o.textContent = opt;
        if ((node.params[field.key] ?? field.default) === opt) o.selected = true;
        inp.appendChild(o);
      });
    } else {
      inp = document.createElement('input');
      inp.type = field.type || 'text';
      inp.className = 'cfg-input';
      inp.value = node.params[field.key] ?? '';
      if (field.placeholder) inp.placeholder = field.placeholder;
      if (field.min !== undefined) inp.min = field.min;
      if (field.max !== undefined) inp.max = field.max;
      if (field.readonly) inp.readOnly = true;
    }

    inp.addEventListener('input', () => {
      node.params[field.key] = field.type === 'number' ? parseFloat(inp.value) : inp.value;
      updatePreview(node);
    });
    grp.appendChild(inp);

    if (field.key === 'payload' || field.key === 'prompt' || field.key === 'body') {
      const help = document.createElement('div');
      help.className = 'cfg-help';
      help.textContent = 'Use {{input}} to reference the previous node\'s output. Use {{timestamp}}, {{workflow_name}} for metadata.';
      grp.appendChild(help);
    }

    configBody.appendChild(grp);
  });

  // Delete button
  const row = document.createElement('div');
  row.className = 'cfg-btn-row';
  const delBtn = document.createElement('button');
  delBtn.className = 'cfg-btn danger';
  delBtn.innerHTML = '<i class="fa-solid fa-trash-can"></i> Delete Node';
  delBtn.addEventListener('click', () => { deleteNode(id); closeConfig(); });
  row.appendChild(delBtn);

  const dupBtn = document.createElement('button');
  dupBtn.className = 'cfg-btn';
  dupBtn.innerHTML = '<i class="fa-solid fa-copy"></i> Duplicate';
  dupBtn.addEventListener('click', () => duplicateNode(id));
  row.appendChild(dupBtn);

  configBody.appendChild(row);
}

function updatePreview(node) {
  const el = document.getElementById('prev_' + node.id);
  if (el) el.textContent = getPreview(node);
}

function closeConfig() {
  configPanel.classList.remove('open');
  deselectAll();
}

function deleteNode(id) {
  state.connections = state.connections.filter(c => c.from !== id && c.to !== id);
  state.nodes = state.nodes.filter(n => n.id !== id);
  document.getElementById(id)?.remove();
  redrawConnections();
  updateEmptyState();
  pushHistory();
  log('Node deleted', 'info');
}

function duplicateNode(id) {
  const orig = state.nodes.find(n => n.id === id);
  if (!orig) return;
  const newNode = createNode(orig.type, orig.x + 30, orig.y + 30);
  newNode.params = JSON.parse(JSON.stringify(orig.params));
  updatePreview(newNode);
  pushHistory();
}

/* ══════════════════════════════════
   LIBRARY SEARCH / FILTER
══════════════════════════════════ */
function filterLibrary() {
  const q = $('library-search').value.toLowerCase().trim();
  document.querySelectorAll('.lib-node').forEach(el => {
    const name = el.querySelector('.lib-node-name')?.textContent.toLowerCase() || '';
    const desc = el.querySelector('.lib-node-desc')?.textContent.toLowerCase() || '';
    el.style.display = (!q || name.includes(q) || desc.includes(q)) ? '' : 'none';
  });
  document.querySelectorAll('.lib-group').forEach(grp => {
    const anyVisible = [...grp.querySelectorAll('.lib-node')].some(el => el.style.display !== 'none');
    grp.style.display = anyVisible ? '' : 'none';
  });
}

/* ══════════════════════════════════
   KEYBOARD SHORTCUTS
══════════════════════════════════ */
function onKeyDown(e) {
  if (e.target.matches('input, textarea, select')) return;
  if ((e.ctrlKey || e.metaKey) && e.key === 'z') { e.preventDefault(); undo(); }
  if ((e.ctrlKey || e.metaKey) && e.key === 'y') { e.preventDefault(); redo(); }
  if ((e.ctrlKey || e.metaKey) && e.key === 's') { e.preventDefault(); saveWorkflow(); }
  if (e.key === 'Escape') { cancelLink(); closeConfig(); }
  if (e.key === 'Delete' && state.selectedId) deleteNode(state.selectedId);
}

/* ══════════════════════════════════
   UNDO / REDO
══════════════════════════════════ */
function pushHistory() {
  const snapshot = JSON.stringify({ nodes: state.nodes, connections: state.connections });
  state.history = state.history.slice(0, state.historyIndex + 1);
  state.history.push(snapshot);
  if (state.history.length > 60) state.history.shift();
  state.historyIndex = state.history.length - 1;
}

function undo() {
  if (state.historyIndex <= 0) return;
  state.historyIndex--;
  restoreSnapshot(JSON.parse(state.history[state.historyIndex]));
}

function redo() {
  if (state.historyIndex >= state.history.length - 1) return;
  state.historyIndex++;
  restoreSnapshot(JSON.parse(state.history[state.historyIndex]));
}

function restoreSnapshot(snap) {
  surface.innerHTML = '';
  state.nodes = snap.nodes;
  state.connections = snap.connections;
  state.nodes.forEach(n => renderNode(n));
  redrawConnections();
  updateEmptyState();
}

/* ══════════════════════════════════
   TEMPLATES
══════════════════════════════════ */
const TEMPLATES = {
  'email-ai': {
    name: 'AI Email Reply',
    nodes: [
      { type: 'trigger-email', x: 60,  y: 160, params: { from: '', subject: 'support, help, issue', payload: 'Subject: Urgent - Payment failed\nFrom: bob@company.com\n\nHi, my payment failed for order #7823 but money was deducted. Please help immediately.' } },
      { type: 'ai-sentiment',  x: 360, y: 60,  params: { input: '{{input}}' } },
      { type: 'ai-classify',   x: 360, y: 240, params: { input: '{{input}}', categories: 'billing, technical, urgent, general' } },
      { type: 'ai-generate',   x: 660, y: 160, params: { prompt: 'Write a professional support reply for this {{input}} message. Acknowledge sentiment: {{input}}. Category: {{input}}', tone: 'Professional', maxWords: 120 } },
      { type: 'action-email',  x: 960, y: 160, params: { to: 'bob@company.com', subject: 'Re: Your Support Request', body: '{{input}}\n\nBest regards,\nSupport Team' } }
    ],
    connections: [[0,1],[0,2],[0,3],[3,4]]
  },
  'lead-score': {
    name: 'Lead Scoring',
    nodes: [
      { type: 'trigger-webhook', x: 60,  y: 180, params: { endpoint: 'https://autoflow.io/hook/leads', payload: '{"name":"Sarah Johnson","company":"TechCorp","employees":250,"email":"sarah@techcorp.com","message":"We need enterprise automation for 200 agents"}' } },
      { type: 'ai-extract',      x: 360, y: 80,  params: { input: '{{input}}', fields: 'name, company, email, employees, message' } },
      { type: 'ai-classify',     x: 360, y: 280, params: { input: '{{input}}', categories: 'Hot Lead, Warm Lead, Cold Lead, Not Qualified' } },
      { type: 'action-slack',    x: 660, y: 80,  params: { channel: '#sales-alerts', message: ':tada: New Lead Alert!\n*Company:* {{input}}\n*Score:* {{input}}' } },
      { type: 'action-sheets',   x: 660, y: 280, params: { sheetId: 'CRM_Leads_2024', columns: 'timestamp, name, company, score, email', values: '{{timestamp}}, {{input}}, {{input}}, {{input}}, {{input}}' } }
    ],
    connections: [[0,1],[0,2],[1,3],[2,3],[1,4],[2,4]]
  },
  'content-pipeline': {
    name: 'Content Pipeline',
    nodes: [
      { type: 'trigger-form',    x: 60,  y: 180, params: { formId: 'blog-request', payload: '{"topic":"AI automation trends in 2025","keywords":"workflow, automation, productivity, tools","audience":"tech entrepreneurs","length":"medium"}' } },
      { type: 'ai-generate',     x: 360, y: 80,  params: { prompt: 'Write a compelling blog post outline for topic: {{input}}. 5 sections with bullet points.', tone: 'Professional', maxWords: 400 } },
      { type: 'ai-generate',     x: 360, y: 300, params: { prompt: 'Write 5 catchy social media captions for content about: {{input}}', tone: 'Friendly', maxWords: 200 } },
      { type: 'action-database', x: 660, y: 80,  params: { table: 'content_drafts', record: '{"created_at":"{{timestamp}}","type":"blog_outline","content":"{{input}}"}' } },
      { type: 'action-slack',    x: 660, y: 300, params: { channel: '#content-team', message: ':pencil: *New content ready!*\n\n{{input}}' } }
    ],
    connections: [[0,1],[0,2],[1,3],[2,4]]
  },
  'data-clean': {
    name: 'Data Cleaner',
    nodes: [
      { type: 'trigger-manual',    x: 60,  y: 180, params: { payload: 'John doe  |  JOHNDOE@gmail.com  |  +1 (555) 867-5309  |  acme corp' } },
      { type: 'transform-format',  x: 360, y: 80,  params: { input: '{{input}}', ops: 'Trim whitespace' } },
      { type: 'ai-extract',        x: 360, y: 280, params: { input: '{{input}}', fields: 'name, email, phone, company' } },
      { type: 'transform-json',    x: 660, y: 180, params: { input: '{{input}}', jsonPath: 'email' } },
      { type: 'action-database',   x: 960, y: 180, params: { table: 'clean_contacts', record: '{"name":"{{input}}","email":"{{input}}","cleaned_at":"{{timestamp}}"}' } }
    ],
    connections: [[0,1],[0,2],[1,3],[2,3],[3,4]]
  }
};

function loadTemplate(key) {
  const tmpl = TEMPLATES[key];
  if (!tmpl) return;
  clearAll(true);
  $('workflow-name').value = tmpl.name;

  const created = [];
  tmpl.nodes.forEach(nd => {
    const node = createNode(nd.type, nd.x, nd.y);
    node.params = { ...node.params, ...nd.params };
    updatePreview(node);
    created.push(node.id);
  });

  (tmpl.connections || []).forEach(([fi, ti]) => {
    if (created[fi] && created[ti]) {
      state.connections.push({ id: cuid(), from: created[fi], to: created[ti] });
    }
  });

  redrawConnections();
  pushHistory();
  setTimeout(fitToScreen, 50);
  log(`Loaded template: "${tmpl.name}"`, 'success');
}

/* ══════════════════════════════════
   CLEAR / EMPTY STATE
══════════════════════════════════ */
function clearAll(silent = false) {
  state.nodes.forEach(n => document.getElementById(n.id)?.remove());
  state.nodes = [];
  state.connections = [];
  state.runOutputs = {};
  connSvg.querySelectorAll('.dyn-path').forEach(p => p.remove());
  closeConfig();
  updateEmptyState();
  if (!silent) { pushHistory(); log('Canvas cleared.', 'system'); }
}

function updateEmptyState() {
  emptyState.classList.toggle('hidden', state.nodes.length > 0);
}

/* ══════════════════════════════════
   SAVE / LOAD / EXPORT
══════════════════════════════════ */
function saveWorkflow() {
  const name = $('workflow-name').value.trim() || 'Unnamed Workflow';
  const key  = 'autoflow_' + name.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
  const data = {
    name, savedAt: new Date().toISOString(),
    nodes: state.nodes, connections: state.connections
  };
  localStorage.setItem(key, JSON.stringify(data));
  $('workflow-status').innerHTML = '<i class="fa-solid fa-circle-check"></i> Saved locally';
  log(`Workflow "${name}" saved to local storage.`, 'success');
}

function openLoadModal() {
  const modal = $('load-modal');
  const list  = $('saved-list');
  list.innerHTML = '';

  const keys = Object.keys(localStorage).filter(k => k.startsWith('autoflow_'));
  if (keys.length === 0) {
    list.innerHTML = '<p class="muted-text">No saved workflows found. Use Save first!</p>';
  } else {
    keys.forEach(key => {
      try {
        const data = JSON.parse(localStorage.getItem(key));
        const row = document.createElement('div');
        row.className = 'saved-row';
        const date = new Date(data.savedAt).toLocaleString();
        row.innerHTML = `
          <div>
            <div class="saved-row-name">${data.name || key}</div>
            <div class="saved-row-meta">${data.nodes?.length || 0} nodes · Saved ${date}</div>
          </div>
          <div class="saved-row-actions">
            <button class="saved-row-btn" data-action="load" data-key="${key}">Load</button>
            <button class="saved-row-btn del" data-action="del" data-key="${key}">Delete</button>
          </div>`;
        row.querySelectorAll('[data-action]').forEach(btn => {
          btn.addEventListener('click', () => {
            if (btn.dataset.action === 'load') {
              loadSavedWorkflow(key);
              modal.style.display = 'none';
            } else {
              localStorage.removeItem(key);
              row.remove();
              log(`Deleted saved workflow "${data.name}"`, 'info');
            }
          });
        });
        list.appendChild(row);
      } catch (_) {}
    });
  }
  modal.style.display = 'flex';
}

function loadSavedWorkflow(key) {
  try {
    const data = JSON.parse(localStorage.getItem(key));
    clearAll(true);
    $('workflow-name').value = data.name;
    _nodeSeq = 0; _connSeq = 0;
    data.nodes.forEach(n => {
      const node = { ...n };
      state.nodes.push(node);
      renderNode(node);
    });
    state.connections = data.connections || [];
    redrawConnections();
    updateEmptyState();
    pushHistory();
    setTimeout(fitToScreen, 80);
    log(`Loaded workflow: "${data.name}"`, 'success');
  } catch (e) {
    log('Failed to load workflow: ' + e.message, 'error');
  }
}

function exportWorkflow() {
  const name = $('workflow-name').value.trim() || 'workflow';
  const data = {
    name, exportedAt: new Date().toISOString(),
    nodes: state.nodes, connections: state.connections
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href = url; a.download = name.replace(/\s+/g, '_') + '.autoflow.json';
  a.click(); URL.revokeObjectURL(url);
  log(`Exported workflow as JSON file.`, 'success');
}

/* ══════════════════════════════════
   EXECUTION ENGINE
══════════════════════════════════ */
async function runWorkflow() {
  if (state.isRunning) return;
  if (state.nodes.length === 0) { log('Add nodes to the canvas first!', 'warn'); return; }

  const triggers = state.nodes.filter(n => NODE_DEFS[n.type].category === 'trigger');
  if (triggers.length === 0) { log('No trigger node found. Add a Trigger to start the workflow.', 'error'); return; }

  // Reset node states
  state.nodes.forEach(n => {
    const el = document.getElementById(n.id);
    el?.classList.remove('running', 'success', 'error');
  });
  state.runOutputs = {};
  state.isRunning = true;

  btnRun.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i><span>Running…</span>';
  btnRun.classList.add('running');
  runBadge.textContent = '● Running';
  runBadge.className = 'run-badge running';

  log('══════════ WORKFLOW STARTED ══════════', 'running');
  redrawConnections(); // activate animated dashes

  try {
    const order = topSort();
    for (const nodeId of order) {
      await executeNode(nodeId);
    }
    log('══════════ WORKFLOW COMPLETE ══════════', 'success');
    runBadge.textContent = '● Success'; runBadge.className = 'run-badge success';
  } catch (err) {
    log('Workflow failed: ' + err.message, 'error');
    runBadge.textContent = '● Error'; runBadge.className = 'run-badge error';
  } finally {
    state.isRunning = false;
    btnRun.innerHTML = '<i class="fa-solid fa-play"></i><span>Run Workflow</span>';
    btnRun.classList.remove('running');
    redrawConnections();
  }
}

function topSort() {
  const visited = new Set(), order = [];
  const visit = id => {
    if (visited.has(id)) return;
    visited.add(id);
    order.push(id);
    state.connections.filter(c => c.from === id).forEach(c => visit(c.to));
  };
  state.nodes.filter(n => NODE_DEFS[n.type].category === 'trigger').forEach(n => visit(n.id));
  return order;
}

async function executeNode(nodeId) {
  const node = state.nodes.find(n => n.id === nodeId);
  if (!node) return;
  const def = NODE_DEFS[node.type];
  const el  = document.getElementById(nodeId);

  el?.classList.add('running');
  log(`▶ Running: ${def.label}`, 'running');

  await sleep(600); // visual pause

  // Gather upstream outputs
  const inputs = state.connections
    .filter(c => c.to === nodeId)
    .map(c => state.runOutputs[c.from] || '')
    .filter(Boolean);
  const upstream = inputs.join('\n\n');

  let output = '';

  try {
    switch (node.type) {
      /* TRIGGERS */
      case 'trigger-manual':
      case 'trigger-schedule':
      case 'trigger-webhook':
      case 'trigger-email':
      case 'trigger-form':
        output = resolveVars(node.params.payload || '', node);
        log(`  Payload: "${output.substring(0, 80)}${output.length > 80 ? '…' : ''}"`, 'info');
        break;

      /* AI */
      case 'ai-generate': {
        const prompt = resolveVars(node.params.prompt, node, upstream);
        const tone = node.params.tone || 'Professional';
        const maxW = node.params.maxWords || 150;
        log(`  Generating text (tone: ${tone}, max: ${maxW} words)…`, 'info');
        await sleep(1200);
        output = simulateLLM(prompt, tone, maxW, upstream);
        log(`  Generated ${countWords(output)} words.`, 'success');
        break;
      }

      case 'ai-summarize': {
        const text = resolveVars(node.params.input, node, upstream);
        const style = node.params.style || 'Short Paragraph';
        const maxLen = node.params.length || 200;
        log(`  Summarizing (style: ${style})…`, 'info');
        await sleep(900);
        output = simulateSummarize(text, style, maxLen);
        log(`  Summary: "${output.substring(0, 60)}…"`, 'success');
        break;
      }

      case 'ai-classify': {
        const text = resolveVars(node.params.input, node, upstream);
        const cats = (node.params.categories || 'general').split(',').map(s => s.trim());
        log(`  Classifying into: [${cats.join(', ')}]…`, 'info');
        await sleep(700);
        output = simulateClassify(text, cats);
        log(`  Category: "${output}"`, 'success');
        break;
      }

      case 'ai-sentiment': {
        const text = resolveVars(node.params.input, node, upstream);
        log(`  Analyzing sentiment…`, 'info');
        await sleep(600);
        output = simulateSentiment(text);
        log(`  Sentiment: "${output}"`, 'success');
        break;
      }

      case 'ai-translate': {
        const text = resolveVars(node.params.input, node, upstream);
        const lang = node.params.target || 'English';
        log(`  Translating to ${lang}…`, 'info');
        await sleep(800);
        output = `[Translated to ${lang}]: ${text.substring(0, 200)}`;
        log(`  Translation complete.`, 'success');
        break;
      }

      case 'ai-extract': {
        const text = resolveVars(node.params.input, node, upstream);
        const fields = (node.params.fields || 'name, email').split(',').map(s => s.trim());
        log(`  Extracting fields: [${fields.join(', ')}]…`, 'info');
        await sleep(700);
        output = simulateExtract(text, fields);
        log(`  Extracted: ${output}`, 'success');
        break;
      }

      /* LOGIC */
      case 'logic-condition': {
        const val    = resolveVars(node.params.value, node, upstream).toLowerCase();
        const op     = node.params.operator || 'contains';
        const cmp    = (node.params.compare || '').toLowerCase();
        let result;
        switch(op) {
          case 'contains':    result = val.includes(cmp); break;
          case 'equals':      result = val === cmp; break;
          case 'not equals':  result = val !== cmp; break;
          case 'starts with': result = val.startsWith(cmp); break;
          case 'ends with':   result = val.endsWith(cmp); break;
          case 'is empty':    result = val.length === 0; break;
          case 'is not empty':result = val.length > 0; break;
          case 'greater than':result = parseFloat(val) > parseFloat(cmp); break;
          case 'less than':   result = parseFloat(val) < parseFloat(cmp); break;
          default: result = false;
        }
        output = result ? 'TRUE' : 'FALSE';
        log(`  Condition "${val}" ${op} "${cmp}" → ${output}`, result ? 'success' : 'warn');
        break;
      }

      case 'logic-delay': {
        const ms = node.params.duration || 1000;
        log(`  Waiting ${ms}ms — ${node.params.reason || ''}`, 'info');
        await sleep(Math.min(ms, 3000)); // cap at 3s for demo
        output = upstream || 'delay complete';
        log(`  Delay complete.`, 'success');
        break;
      }

      case 'logic-loop': {
        const items = (node.params.input || '').split(',').map(s => s.trim()).filter(Boolean);
        log(`  Iterating over ${items.length} items…`, 'info');
        await sleep(400);
        output = items.map((item, i) => `[${i+1}] ${item}`).join('\n');
        log(`  Loop processed ${items.length} items.`, 'success');
        break;
      }

      case 'logic-merge': {
        const sep = node.params.separator || '\n---\n';
        output = inputs.join(sep);
        log(`  Merged ${inputs.length} inputs.`, 'success');
        break;
      }

      case 'logic-filter': {
        const kw = (node.params.keyword || '').toLowerCase();
        const lines = (upstream || '').split('\n').filter(l => l.toLowerCase().includes(kw));
        output = lines.join('\n') || '(no matches)';
        log(`  Filtered: kept ${lines.length} matching lines.`, 'success');
        break;
      }

      /* ACTIONS */
      case 'action-email': {
        const to   = resolveVars(node.params.to, node, upstream);
        const subj = resolveVars(node.params.subject, node, upstream);
        const body = resolveVars(node.params.body, node, upstream);
        log(`  📧 Sending email to: <${to}>`, 'info');
        log(`     Subject: "${subj}"`, 'info');
        log(`     Body preview: "${body.substring(0, 100)}…"`, 'info');
        await sleep(500);
        output = `Email sent to ${to}. Subject: "${subj}"`;
        log(`  Email dispatched successfully!`, 'success');
        break;
      }

      case 'action-slack': {
        const channel = node.params.channel || '#general';
        const msg = resolveVars(node.params.message, node, upstream);
        log(`  💬 Posting to Slack channel ${channel}…`, 'info');
        await sleep(400);
        log(`     Message: "${msg.substring(0, 80)}"`, 'info');
        output = `Slack message sent to ${channel}.`;
        log(`  Slack notification sent!`, 'success');
        break;
      }

      case 'action-sheets': {
        const sheet = node.params.sheetId || 'Sheet1';
        log(`  📊 Appending row to Google Sheets: "${sheet}"…`, 'info');
        await sleep(500);
        const rowId = Math.floor(Math.random() * 10000) + 100;
        output = `Row #${rowId} appended to "${sheet}".`;
        log(`  Sheet updated. Row ID: ${rowId}`, 'success');
        break;
      }

      case 'action-http': {
        const url    = resolveVars(node.params.url, node, upstream);
        const method = node.params.method || 'POST';
        log(`  🌐 ${method} request → ${url}`, 'info');
        await sleep(700);
        const statusCodes = [200, 200, 200, 201, 202];
        const code = statusCodes[Math.floor(Math.random() * statusCodes.length)];
        output = `HTTP ${code} OK — Request to ${url} succeeded.`;
        log(`  Response: HTTP ${code} OK`, 'success');
        break;
      }

      case 'action-database': {
        const table = node.params.table || 'records';
        log(`  🗄️  Writing to local DB table: "${table}"…`, 'info');
        await sleep(350);
        // Actually persist to localStorage
        const records = JSON.parse(localStorage.getItem('autoflow_db_' + table) || '[]');
        const record = resolveVars(node.params.record, node, upstream);
        records.push({ _id: Date.now(), _data: record });
        localStorage.setItem('autoflow_db_' + table, JSON.stringify(records));
        output = `Record #${records.length} saved to "${table}".`;
        log(`  DB write successful. Total records: ${records.length}`, 'success');
        break;
      }

      case 'action-notification': {
        const title = resolveVars(node.params.title, node, upstream);
        const msg   = resolveVars(node.params.message, node, upstream);
        log(`  🔔 Sending browser notification: "${title}"`, 'info');
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification(title, { body: msg });
        } else if ('Notification' in window && Notification.permission !== 'denied') {
          await Notification.requestPermission().then(p => {
            if (p === 'granted') new Notification(title, { body: msg });
          });
        }
        // In-app fallback
        showToast(title, msg);
        output = `Notification shown: "${title}"`;
        log(`  Notification dispatched!`, 'success');
        break;
      }

      /* TRANSFORM */
      case 'transform-format': {
        let text = resolveVars(node.params.input, node, upstream);
        const op = node.params.ops;
        switch(op) {
          case 'Trim whitespace':      text = text.trim().replace(/\s+/g, ' '); break;
          case 'To uppercase':         text = text.toUpperCase(); break;
          case 'To lowercase':         text = text.toLowerCase(); break;
          case 'Remove special chars': text = text.replace(/[^a-zA-Z0-9\s]/g, ''); break;
          case 'Capitalize words':     text = text.replace(/\b\w/g, c => c.toUpperCase()); break;
          case 'Slugify':              text = text.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''); break;
        }
        output = text;
        log(`  Text formatted (${op}).`, 'success');
        break;
      }

      case 'transform-json': {
        const src = resolveVars(node.params.input, node, upstream);
        const path = node.params.jsonPath || '';
        try {
          let obj = JSON.parse(src);
          const parts = path.split('.');
          for (const p of parts) { obj = obj?.[p]; }
          output = String(obj ?? '');
          log(`  Extracted "${path}": "${output}"`, 'success');
        } catch {
          output = '(Invalid JSON or field not found)';
          log(`  JSON parse failed.`, 'warn');
        }
        break;
      }

      case 'transform-math': {
        const a = parseFloat(resolveVars(node.params.valueA, node, upstream)) || 0;
        const b = parseFloat(node.params.valueB) || 0;
        const op = node.params.op || '+';
        let res;
        switch(op) {
          case '+': res = a + b; break; case '-': res = a - b; break;
          case '×': res = a * b; break; case '÷': res = b !== 0 ? a / b : 0; break;
          case '% modulo': res = a % b; break; case '^ power': res = Math.pow(a, b); break;
          case 'Round': res = Math.round(a); break; case 'Floor': res = Math.floor(a); break;
          case 'Ceil':  res = Math.ceil(a); break; case 'Abs': res = Math.abs(a); break;
          default: res = a;
        }
        output = String(res);
        log(`  Math: ${a} ${op} ${b} = ${res}`, 'success');
        break;
      }

      default:
        output = upstream || '(no output)';
    }

    state.runOutputs[nodeId] = output;
    el?.classList.remove('running');
    el?.classList.add('success');

  } catch (err) {
    el?.classList.remove('running');
    el?.classList.add('error');
    log(`  ERROR in ${def.label}: ${err.message}`, 'error');
    throw err;
  }
}

/* ══════════════════════════════════
   AI SIMULATION HELPERS
══════════════════════════════════ */
function simulateLLM(prompt, tone, maxWords, input) {
  const lower = (prompt + input).toLowerCase();

  if (lower.includes('support') || lower.includes('refund') || lower.includes('payment') || lower.includes('issue')) {
    const responses = {
      'Professional': `Thank you for reaching out to us. I sincerely apologize for the inconvenience you've experienced. I've reviewed your request and have escalated it to our billing team immediately. You can expect a full resolution within 24 hours, and if a refund is applicable, it will be processed within 3-5 business days. Please don't hesitate to contact us if you need further assistance.`,
      'Friendly': `Hey there! 👋 So sorry to hear you're having trouble! Don't worry — we're on it! I've flagged your case as high priority and our team will sort this out super quickly. You'll hear back from us within 24 hours. We really appreciate your patience! 😊`,
      'Formal': `Dear Valued Customer, I write to acknowledge receipt of your communication dated herein. Your matter has been duly reviewed and escalated to the appropriate department for immediate resolution. Please be advised that a formal response shall be issued within one business day.`
    };
    return (responses[tone] || responses['Professional']).split(' ').slice(0, maxWords).join(' ');
  }

  if (lower.includes('sales') || lower.includes('enterprise') || lower.includes('license') || lower.includes('demo')) {
    return `Thank you for your interest in our enterprise offering! I'd love to set up a personalized demo to show how AutoFlow can streamline your team's workflows. We offer volume pricing for teams of 50+ with dedicated onboarding support. Our enterprise plan includes unlimited automations, priority support, and custom integrations. I'll have our solutions team reach out within 1 business day to discuss your specific requirements.`.split(' ').slice(0, maxWords).join(' ');
  }

  if (lower.includes('blog') || lower.includes('content') || lower.includes('article') || lower.includes('write')) {
    return `## Blog Outline\n\n**Introduction**\n- Hook with a compelling statistic or question\n- Define the problem space\n\n**Section 1: The Current Landscape**\n- State of the industry today\n- Pain points for users\n\n**Section 2: The Solution**\n- How automation addresses these challenges\n- Real-world examples\n\n**Section 3: Implementation Guide**\n- Step-by-step approach\n- Best practices\n\n**Section 4: Results & ROI**\n- Case studies\n- Measurable outcomes\n\n**Conclusion**\n- Call to action\n- Next steps`.split(' ').slice(0, maxWords).join(' ');
  }

  return `This is a simulated AI output for your workflow. In a production environment, this would connect to a live LLM API (such as Gemini or GPT-4) to generate contextual, high-quality responses based on your prompt template and the upstream data passed through your workflow pipeline.`.split(' ').slice(0, maxWords).join(' ');
}

function simulateSummarize(text, style, maxLen) {
  const sentences = text.split(/[.!\n]+/).map(s => s.trim()).filter(s => s.length > 5);
  switch(style) {
    case 'One Sentence':
      return (sentences[0] || text).substring(0, maxLen) + '.';
    case 'Bullet Points':
      return sentences.slice(0, 4).map(s => `• ${s}`).join('\n').substring(0, maxLen);
    case 'Executive Brief':
      return `EXECUTIVE SUMMARY:\n${sentences.slice(0, 2).join('. ')}.\n\nKey Points: ${sentences.length} total items identified.`.substring(0, maxLen);
    default:
      return sentences.slice(0, 3).join('. ').substring(0, maxLen) + '.';
  }
}

function simulateClassify(text, categories) {
  const lower = text.toLowerCase();
  const scores = categories.map(cat => {
    const catWords = cat.toLowerCase().replace(/-/g, ' ').split(' ');
    let score = 0;
    if (lower.includes(cat.toLowerCase())) score += 10;
    catWords.forEach(w => { if (lower.includes(w)) score += 3; });
    // Heuristics
    if (cat.toLowerCase().includes('urgent') && (lower.includes('urgent') || lower.includes('immediately') || lower.includes('asap'))) score += 8;
    if (cat.toLowerCase().includes('billing') && (lower.includes('pay') || lower.includes('invoice') || lower.includes('charge') || lower.includes('refund'))) score += 8;
    if (cat.toLowerCase().includes('technical') && (lower.includes('error') || lower.includes('bug') || lower.includes('code') || lower.includes('api'))) score += 8;
    if (cat.toLowerCase().includes('sales') && (lower.includes('buy') || lower.includes('price') || lower.includes('demo') || lower.includes('enterprise'))) score += 8;
    if (cat.toLowerCase().includes('hot') && (lower.includes('enterprise') || lower.includes('200') || lower.includes('500') || lower.includes('urgent'))) score += 6;
    return { cat, score };
  });
  const best = scores.sort((a, b) => b.score - a.score)[0];
  return best.cat;
}

function simulateSentiment(text) {
  const lower = text.toLowerCase();
  const negative = ['fail', 'error', 'wrong', 'bad', 'terrible', 'worst', 'angry', 'frustrated', 'broken', 'scam', 'useless', 'ridiculous', 'urgent', 'immediately', 'demand'];
  const positive = ['great', 'good', 'love', 'excellent', 'perfect', 'amazing', 'happy', 'thanks', 'appreciate', 'wonderful', 'fantastic'];
  const neutral  = ['question', 'help', 'info', 'how', 'what', 'can you', 'please'];

  let neg = 0, pos = 0;
  negative.forEach(w => { if (lower.includes(w)) neg += 2; });
  positive.forEach(w => { if (lower.includes(w)) pos += 2; });

  if (neg > pos + 2) return neg > 6 ? 'VERY NEGATIVE 😡' : 'NEGATIVE 😞';
  if (pos > neg + 2) return pos > 6 ? 'VERY POSITIVE 😄' : 'POSITIVE 🙂';
  return 'NEUTRAL 😐';
}

function simulateExtract(text, fields) {
  const result = {};
  fields.forEach(field => {
    const f = field.toLowerCase();
    if (f === 'email') {
      const m = text.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/);
      result[field] = m ? m[1] : 'N/A';
    } else if (f === 'phone') {
      const m = text.match(/(\+?[\d\s\-().]{7,15})/);
      result[field] = m ? m[1].trim() : 'N/A';
    } else if (f === 'name') {
      const m = text.match(/(?:name[:\s]+)([A-Z][a-z]+ [A-Z][a-z]+)/);
      result[field] = m ? m[1] : (text.match(/\b([A-Z][a-z]+ [A-Z][a-z]+)\b/) || [,'N/A'])[1];
    } else if (f === 'company' || f === 'organization') {
      const m = text.match(/(?:company|org|corp)[:\s]+([^\n,]+)/i);
      result[field] = m ? m[1].trim() : 'N/A';
    } else {
      // Generic extraction
      const re = new RegExp(field + '[:\\s]+([^\\n,]+)', 'i');
      const m = text.match(re);
      result[field] = m ? m[1].trim() : 'N/A';
    }
  });
  return JSON.stringify(result, null, 2);
}

/* ══════════════════════════════════
   UTILITY
══════════════════════════════════ */
function resolveVars(template, node, upstream = '') {
  if (!template) return upstream || '';
  return template
    .replace(/\{\{input\}\}/g, upstream || '')
    .replace(/\{\{timestamp\}\}/g, new Date().toISOString())
    .replace(/\{\{workflow_name\}\}/g, $('workflow-name')?.value || 'Workflow')
    .replace(/\{\{category\}\}/g, node?.params?.categories || '');
}

function getNodeType(id) {
  return state.nodes.find(n => n.id === id)?.type || '';
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }
function countWords(str) { return str.trim().split(/\s+/).length; }

/* ══════════════════════════════════
   CONSOLE LOG
══════════════════════════════════ */
function log(msg, type = 'info') {
  const ts = new Date().toLocaleTimeString('en-US', { hour12: false });
  const el = document.createElement('div');
  el.className = `log-entry ${type}`;
  el.textContent = `[${ts}] ${msg}`;
  consoleBody.appendChild(el);
  consoleBody.scrollTop = consoleBody.scrollHeight;
}

function clearLog() {
  consoleBody.innerHTML = '';
  log('Log cleared.', 'system');
}

/* ══════════════════════════════════
   PANEL TOGGLES
══════════════════════════════════ */
function collapseLibrary() {
  const p = document.querySelector('.library-panel');
  p.classList.toggle('collapsed');
  $('btn-collapse-library').textContent = p.classList.contains('collapsed') ? '›' : '‹';
}

function toggleConsole() {
  const p = document.querySelector('.console-panel');
  p.classList.toggle('collapsed');
  $('btn-toggle-console').querySelector('i').classList.toggle('fa-chevron-up');
  $('btn-toggle-console').querySelector('i').classList.toggle('fa-chevron-down');
}

/* ══════════════════════════════════
   TOAST NOTIFICATION (in-app fallback)
══════════════════════════════════ */
function showToast(title, msg) {
  const toast = document.createElement('div');
  toast.style.cssText = `
    position:fixed; top:80px; right:20px; z-index:9999;
    background:#1a1c2e; border:1px solid rgba(255,255,255,0.12);
    border-left:3px solid var(--success); border-radius:10px;
    padding:14px 18px; max-width:300px; box-shadow:0 8px 32px rgba(0,0,0,0.6);
    animation:slideIn 0.3s ease; font-family:var(--font);
  `;
  toast.innerHTML = `<div style="font-weight:700;font-size:13px;margin-bottom:4px;">${title}</div>
    <div style="font-size:12px;color:#9498b0;">${msg.substring(0,100)}</div>`;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 4500);
}

/* ══════════════════════════════════
   MINIMAP
══════════════════════════════════ */
function drawMinimap() {
  const mm = $('minimap-canvas');
  if (!mm || mm.style.display === 'none') return;
  const W = 150, H = 100;
  mm.width = W; mm.height = H;
  const ctx = mm.getContext('2d');
  ctx.clearRect(0, 0, W, H);
  ctx.fillStyle = '#0d0e18';
  ctx.fillRect(0, 0, W, H);

  if (state.nodes.length === 0) return;
  const xs = state.nodes.map(n => n.x), ys = state.nodes.map(n => n.y);
  const minX = Math.min(...xs), maxX = Math.max(...xs) + 220;
  const minY = Math.min(...ys), maxY = Math.max(...ys) + 100;
  const scaleX = (W - 10) / (maxX - minX || 1);
  const scaleY = (H - 10) / (maxY - minY || 1);
  const scale = Math.min(scaleX, scaleY, 0.2);

  state.nodes.forEach(n => {
    const def = NODE_DEFS[n.type];
    const cat = def?.category;
    const colors = { trigger:'#ff8c42', ai:'#a855f7', logic:'#22d3ee', action:'#34d399', transform:'#f59e0b' };
    ctx.fillStyle = colors[cat] || '#555';
    ctx.beginPath();
    ctx.roundRect(5 + (n.x - minX) * scale, 5 + (n.y - minY) * scale, 220 * scale, 80 * scale, 2);
    ctx.fill();
  });
}

/* ══════════════════════════════════
   INITIAL PUSH HISTORY STATE
══════════════════════════════════ */
pushHistory(); // baseline

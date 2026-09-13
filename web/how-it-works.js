// Owned illustration data only. This page never fetches scans or sends notifications.
const NS = 'http://www.w3.org/2000/svg';
const make = (name, attrs = {}, content) => {
  const element = document.createElementNS(NS, name);
  for (const [key, value] of Object.entries(attrs)) element.setAttribute(key, value);
  if (content !== undefined) element.textContent = content;
  return element;
};
const text = (x, y, content, kind = 'scene-label', anchor = 'start') => make('text', {x, y, class: kind, 'text-anchor': anchor}, content);
const rect = (x, y, width, height, kind = 'scene-box', radius = 5) => make('rect', {x, y, width, height, rx: radius, class: kind});
const line = (x1, y1, x2, y2, kind = 'scene-line') => make('line', {x1, y1, x2, y2, class: kind});
const path = (d, kind = 'scene-line') => make('path', {d, class: kind});
const dot = (cx, cy, kind = 'scene-dot', r = 4) => make('circle', {cx, cy, r, class: kind});
const group = (...children) => { const element = make('g'); element.append(...children); return element; };
const box = (x, y, width, height, label, sublabel = '', kind = '') => group(rect(x, y, width, height, `scene-box ${kind}`), text(x + 14, y + (sublabel ? 27 : height / 2 + 4), label), ...(sublabel ? [text(x + 14, y + 47, sublabel, 'scene-small')] : []));
const check = (x, y) => path(`M${x} ${y} l4 4 l8 -9`, 'scene-check');

const slides = [
  {
    title: "Tool output changes mid-session",
    bullets: ["The first description covers one point in the session.", "Later responses can introduce new instructions."],
    draw: () => [
      text(26, 31, 'ONE MCP SESSION', 'scene-title'),
      box(26, 57, 190, 78, 'First connection', 'Read a support ticket'),
      box(330, 57, 190, 78, 'Later in the session', 'A new instruction appears', 'strong'),
      line(216, 96, 330, 96, 'scene-line flow-line'), dot(222, 96, 'scene-packet travel', 2.5),
      line(45, 210, 502, 210),
      ...[70, 205, 340, 475].flatMap((x, i) => [dot(x, 210), text(x, 239, i === 3 ? 'Discover again' : `Tool call ${i + 1}`, 'scene-small', 'middle')]),
      path('M340 205 V160 H422 V135', 'scene-line dashed'),
    ]
  },
  {
    title: "Output is not authority",
    bullets: ["MCP output is untrusted input.", "Server code controls recipients and delivery settings."],
    draw: () => [
      box(24, 86, 168, 96, 'MCP tool output', 'Untrusted text'),
      line(192, 134, 308, 134, 'scene-line flow-line'), dot(195, 134, 'scene-packet travel', 2.5),
      line(263, 47, 263, 243, 'scene-line dashed'), text(263, 29, 'TRUST BOUNDARY', 'scene-title', 'middle'),
      box(311, 72, 210, 124, 'Model assessment', 'Read evidence; return JSON', 'strong'),
      text(325, 166, 'No action privileges', 'scene-mono'),
    ]
  },
  {
    title: "Six calls per test",
    bullets: ["Three reads, a repeated request, a comment and a readback.", "An exposed export tool gets one additional test call."],
    draw: () => [
      text(27, 32, 'OFFICIAL MCP CLIENT', 'scene-title'),
      line(100, 95, 450, 95, 'scene-line flow-line'), path('M450 95 V185 H100', 'scene-line flow-line'),
      ...[[30,60,'1','Read'],[207,60,'2','Read'],[384,60,'3','Read'],[384,150,'4','Repeat'],[207,150,'5','Comment'],[30,150,'6','Readback']].map(([x,y,n,label], index) => {
        const item = group(rect(x,y,137,70),text(x+13,y+23,n,'scene-mono'),text(x+13,y+49,label));
        item.setAttribute('class', `step-${index % 3 + 1}`); return item;
      }),
      rect(30, 251, 491, 37, 'scene-box dashed'), text(275, 275, '7 · Export if exposed', 'scene-small', 'middle')
    ]
  },
  {
    title: "Run in local Wasmer",
    bullets: ["A fresh guest receives explicit synthetic files.", "No host mounts or credentials; guest networking is disabled."],
    draw: () => [
      rect(119, 35, 401, 226, 'scene-box dashed'), text(137, 61, 'WASMER GUEST', 'scene-title'),
      box(155, 87, 328, 70, 'Owned MCP fixture', 'Python 3.13.5'),
      rect(155, 180, 328, 47), text(175, 209, 'Synthetic tickets + synthetic files', 'scene-mono'),
      box(25, 106, 72, 55, 'Files'), line(97, 133, 155, 133, 'scene-line flow-line'),
      text(120, 289, 'SDK 0.11.0', 'scene-mono'), text(335, 289, 'Node 24 bridge', 'scene-mono'),
      line(172, 236, 467, 236, 'scene-line pulse')
    ]
  },
  {
    title: "Collect the evidence",
    bullets: ["Keep discovery snapshots, repeated outputs and write readback.", "Preserve evidence IDs for the assessor\u2019s citations."],
    draw: () => [
      text(32, 31, 'COLLECTED OBSERVATIONS', 'scene-title'),
      ...[['Tool descriptions','Before / after'],['Repeated output','Same request / later response'],['Write readback','Acknowledgment / stored result']].map(([label,detail], i) => {
        const y=52+i*75;
        const item=group(rect(30,y,329,60),text(45,y+24,label),text(45,y+44,detail,'scene-small'),line(359,y+30,405,y+30,'scene-line flow-line'));
        item.setAttribute('class',`step-${i+1}`); return item;
      }),
      path('M405 82 V232 M405 157 H429', 'scene-line'), rect(429,118,96,78,'scene-box strong'),
      text(477,150,'Evidence','scene-label','middle'), text(477,171,'IDs preserved','scene-small','middle'),

    ]
  },
  {
    title: "Review a description change",
    bullets: ["The description adds a ticket-ID clarification.", "The ticket-reading task stays the same."],
    draw: () => [
      text(28,33,'SYNTHETIC FIXTURE','scene-title'),
      rect(27,53,491,76),text(43,77,'Before','scene-small'),text(43,105,'Read a ticket.'),
      rect(27,150,491,76,'scene-box strong'),text(43,174,'After','scene-small'),text(43,202,'Read a ticket by its ticket ID.'),
      path('M273 129 V150', 'scene-line flow-line'),
      line(44,263,493,263), dot(71,263),dot(273,263),dot(468,263),
      text(71,289,'Change observed','scene-small','middle'),text(273,289,'Review','scene-small','middle'),text(468,289,'No alert expected','scene-small','middle'),
      check(461,246)
    ]
  },
  {
    title: "Review a credential request",
    bullets: ["The synthetic fixture requests credential material.", "A newly exposed export tool adds evidence for review."],
    draw: () => [
      box(26,55,194,70,'Expected task','Read a support ticket'),
      box(26,172,194,70,'New tool instruction','Send credential material','strong'),
      line(220,89,278,89),path('M278 89 V207 H220','scene-line'),
      line(278,149,348,149,'scene-line flow-line'),dot(283,149,'scene-packet travel-short',2.5),
      rect(350,87,172,126,'scene-box strong'),text(365,115,'Security review'),
      text(365,143,'Unexpected request','scene-small'),text(365,165,'Export capability','scene-small'),text(365,189,'Cited evidence IDs','scene-mono'),

    ]
  },
  {
    title: "Save the assessment",
    bullets: ["One model returns severity, rationale and evidence IDs.", "Validate JSON and citations, then save flagged findings."],
    draw: () => [
      rect(27,31,226,139),text(43,57,'Model judgment'),
      text(43,83,'flag · severity · rationale','scene-mono'),text(43,107,'evidence IDs · recommendation','scene-mono'),
      rect(43,64,193,19,'scene-fill read-scan',2),text(43,145,'Schema + citation validation','scene-small'),
      line(253,101,314,101,'scene-line flow-line'),
      box(316,59,205,83,'SQLite alert','Evidence stays inspectable','strong'),
      line(47,260,500,260),dot(69,260),dot(245,260),dot(477,260),
      path('M245 260 V208 H353', 'timeline-warning timeline-reveal'),dot(353,208,'timeline-warning-dot',4),
      text(367,212,'Finding','scene-small'),text(69,287,'Collected','scene-small','middle'),text(245,287,'Assessed','scene-small','middle'),text(477,287,'Human triage','scene-small','middle'),
      text(358,238,'Acknowledge / resolve','scene-small')
    ]
  },
  {
    title: "Preview notifications",
    bullets: ["SMS and Telegram use configured recipients.", "Sending requires credentials and explicit enablement."],
    draw: () => [
      box(27,72,202,79,'High / critical alert','Live model assessment'),
      rect(27,186,202,57,'scene-box dashed'),text(42,211,'Configured recipient','scene-small'),text(42,230,'Server settings','scene-mono'),
      line(229,110,351,110,'scene-line dashed'), path('M229 213 H287 V110','scene-line dashed'),
      rect(353,25,168,270,'scene-box strong',17),rect(410,37,54,4,'scene-fill',2),
      text(437,71,'SMS PREVIEW','scene-title','middle'),rect(367,96,139,106),
      text(379,123,'MCP Sentinel','scene-small'),text(379,150,'HIGH · Alert <id>'),text(379,178,'Alert summary only','scene-small'),
      text(437,241,'Preview only','scene-mono','middle'),line(415,277,459,277),
    ]
  },
  {
    title: "What runs today",
    bullets: ["Local Wasmer, one model assessment and saved alert review.", "Scans cover the owned fixture; model reliability is still limited."],
    draw: () => [
      text(29,31,'IMPLEMENTED','scene-title'),
      ...[['Local sandbox','Real Wasmer execution'],['Model review','One aggregate assessment'],['Investigation','SQLite events + alert lifecycle']].map(([label,detail],i) => group(rect(28,49+i*66,493,52),check(45,76+i*66),text(76,72+i*66,label),text(260,72+i*66,detail,'scene-small'))),
    ]
  }
];

const stage = document.querySelector('#slide-stage');
const progress = document.querySelector('#slide-progress');
const count = document.querySelector('#slide-count');
const previous = document.querySelector('#previous-slide');
const next = document.querySelector('#next-slide');
const motionToggle = document.querySelector('#motion-toggle');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
let index = 0;
let motionPaused = reducedMotion.matches;

const element = (tag, className, content) => {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (content !== undefined) node.textContent = content;
  return node;
};

const sections = slides.map((slide, position) => {
  const section = element('article', 'slide');
  section.hidden = position !== 0;
  section.setAttribute('role', 'group');
  section.setAttribute('aria-roledescription', 'slide');
  section.setAttribute('aria-label', `${position + 1} of ${slides.length}: ${slide.title}`);
  const copy = element('div', 'slide-copy');
  const heading = element('h3', '', slide.title);
  heading.id = `slide-heading-${position + 1}`;
  const points = element('ul', 'slide-description');
  for (const point of slide.bullets) points.append(element('li', '', point));
  copy.append(heading, points);
  const figure = element('figure', 'slide-visual');
  const svg = make('svg', {viewBox: '0 0 550 320', role: 'img', 'aria-labelledby': `scene-title-${position + 1}`});
  svg.append(make('title', {id: `scene-title-${position + 1}`}, slide.title), ...slide.draw());
  figure.append(svg);
  section.append(copy, figure);
  stage.append(section);
  const button = element('button', 'progress-button');
  button.type = 'button';
  button.setAttribute('aria-label', `Slide ${position + 1}: ${slide.title}`);
  button.setAttribute('aria-controls', heading.id);
  button.addEventListener('click', () => showSlide(position));
  progress.append(button);
  return section;
});

function showSlide(position) {
  index = Math.max(0, Math.min(slides.length - 1, position));
  sections.forEach((section, number) => {
    section.hidden = number !== index;
    section.classList.toggle('slide-enter', number === index);
  });
  [...progress.children].forEach((button, number) => {
    if (number === index) button.setAttribute('aria-current', 'step');
    else button.removeAttribute('aria-current');
  });
  count.textContent = `${String(index + 1).padStart(2, '0')} / ${slides.length}`;
  previous.disabled = index === 0;
  next.disabled = index === slides.length - 1;
}

function updateMotion() {
  document.body.classList.toggle('motion-paused', motionPaused);
  motionToggle.textContent = reducedMotion.matches ? 'Reduced motion' : motionPaused ? 'Play motion' : 'Pause motion';
  motionToggle.setAttribute('aria-pressed', String(motionPaused));
  motionToggle.disabled = reducedMotion.matches;
  motionToggle.title = reducedMotion.matches ? 'Your system preference disables animation.' : '';
}

previous.addEventListener('click', () => showSlide(index - 1));
next.addEventListener('click', () => showSlide(index + 1));
motionToggle.addEventListener('click', () => { motionPaused = !motionPaused; updateMotion(); });
reducedMotion.addEventListener('change', () => { motionPaused = reducedMotion.matches; updateMotion(); });
document.addEventListener('keydown', (event) => {
  if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
  if (event.target.closest('input, textarea, select, [contenteditable="true"]')) return;
  if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
    // Keep native horizontal scrolling available for the architecture strip.
    if (event.target.closest('.architecture-scroll')) return;
    event.preventDefault();
    showSlide(index + (event.key === 'ArrowRight' ? 1 : -1));
  }
});
showSlide(0);
updateMotion();

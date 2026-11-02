// The briefing frame's renderer, loaded by frame.html after the vendored
// templates. Ours, not vendored: copied into public/ by fetch-briefing-editions.mjs.
'use strict';

/** Each list the sidebar edits, and where it lives on ed; the weekly reads ed.week, not the day. */
const DAILY_SECTIONS = {
  decisions: (ed) => ed.content.decisions,
  today: (ed) => ed.content.today,
  overnight: (ed) => ed.content.overnight,
  running: (ed) => ed.content.running,
};
const WEEKLY_SECTIONS = {
  decisions: (ed) => ed.content.decisions,
  ahead: (ed) => ed.week.ahead,
  shipped: (ed) => ed.week.shipped,
  handled: (ed) => ed.week.handled,
};

/**
 * Where each edition writes its section headings. A section's heading is the
 * nearest match before its first item with no other section's item in between,
 * so a section without one (The Menu's courses) is left alone. `whole`: the
 * heading is one phrase with its count inside ("Two things need your call");
 * otherwise only the heading's own words change and its numerals stay.
 */
const HEADINGS = {
  band: { selector: "section > h2", whole: true },
  playfair: { selector: "h2 > span" },
  broadsheet: { selector: "h3.sech" },
  gradient: { selector: "h2" },
  exhibition: { selector: "h3" },
  weekly: { selector: "h2" },
  librarycard: { selector: ".sl" },
  menu: { selector: "h2" },
  invoice: { selector: "h2" },
  postal: { selector: "h3.blabel" },
  swiss: { selector: "h2" },
  memo: { selector: "section > h3" },
  almanac: { selector: "h2.sc" },
  receipt: { selector: "p.sec" },
  flightplan: { selector: "h2.lbl > span:first-child" },
  instrument: { selector: ".head > .lbl:first-child" },
  metromap: { selector: ".chip", whole: true },
  boardingpass: { selector: ".lbl:not(.it *)", whole: true },
};

const root = document.getElementById("root");

function textNodes(within) {
  const walker = document.createTreeWalker(within, NodeFilter.SHOW_TEXT, {
    acceptNode: (n) =>
      n.data.trim() ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT,
  });
  const nodes = [];
  while (walker.nextNode()) nodes.push(walker.currentNode);
  return nodes;
}

const labelOf = (item) => (typeof item === "string" ? item : item.label);

/** The heading's own words: its first text node with letters, else (or when whole) all of it. */
function wordsNode(el, whole) {
  if (whole) return null;
  return textNodes(el).find((n) => /\p{L}{2}/u.test(n.data)) ?? null;
}

function findHeadings(family, ed) {
  const spec = HEADINGS[family];
  if (!spec)
    throw new Error(`no heading selector for edition family: ${family}`);
  const nodes = textNodes(root);
  const position = new Map(nodes.map((n, i) => [n, i]));
  const itemsAt = {};
  for (const [section, list] of Object.entries(
    ed.week ? WEEKLY_SECTIONS : DAILY_SECTIONS,
  )) {
    // Some editions set their rows in capitals (The Receipt).
    const labels = list(ed)
      .map(labelOf)
      .filter(Boolean)
      .map((l) => l.toLowerCase());
    itemsAt[section] = nodes.flatMap((n, i) =>
      labels.some((l) => n.data.toLowerCase().includes(l)) ? [i] : [],
    );
  }
  const candidates = [...root.querySelectorAll(spec.selector)]
    .map((el) => ({ el, at: position.get(textNodes(el)[0]) }))
    .filter((c) => c.at !== undefined);

  const found = {};
  for (const [section, at] of Object.entries(itemsAt)) {
    if (!at.length) continue;
    const first = at[0];
    const others = Object.entries(itemsAt).flatMap(([s, ats]) =>
      s === section ? [] : ats,
    );
    const heading = candidates
      .filter((c) => c.at < first && !others.some((o) => o > c.at && o < first))
      .pop();
    if (heading) found[section] = heading.el;
  }
  return { found, whole: Boolean(spec.whole) };
}

window.briefing = {
  templates: TEMPLATES.map(({ id, name, axes }) => ({ id, name, axes })),
  /** Render one edition, renaming section headings by `overrides`; returns its height and own headings. */
  render(family, skin, pageEd, overrides = {}) {
    const tpl = TEMPLATES.find((t) => t.id === family);
    if (!tpl) throw new Error(`edition family not registered: ${family}`);
    // This frame has an opaque origin, so it uses the images it carries (frame.html).
    const ed = {
      ...pageEd,
      assets: { ...FRAME_ASSETS, ...pageEd.assets },
      art: { ...pageEd.art, src: INLINE_ART[pageEd.art.src] ?? pageEd.art.src },
    };
    document.getElementById("tpl-css").textContent = tpl.css;
    root.innerHTML = tpl.render(ed, skin);

    const { found, whole } = findHeadings(family, ed);
    const headings = {};
    for (const [section, el] of Object.entries(found)) {
      const words = wordsNode(el, whole);
      headings[section] = (words ? words.data : el.textContent)
        .replace(/\s+/g, " ")
        .trim();
      const override = overrides[section];
      if (!override) continue;
      if (words) words.data = override;
      else el.textContent = override;
    }
    return { height: root.scrollHeight, headings };
  },
};

// The page talks to this sandboxed (opaque-origin) frame by message only:
// hello -> ready {templates}; render -> rendered {height, headings}; resizes -> height.
const post = (message) => parent.postMessage(message, "*");
addEventListener("message", (event) => {
  if (event.source !== parent) return;
  const message = event.data;
  if (message?.type === "hello") {
    post({ type: "ready", templates: window.briefing.templates });
  } else if (message?.type === "render") {
    const { family, skin, ed, overrides } = message;
    post({ type: "rendered", ...window.briefing.render(family, skin, ed, overrides) });
  }
});
new ResizeObserver(() => post({ type: "height", height: root.scrollHeight })).observe(root);

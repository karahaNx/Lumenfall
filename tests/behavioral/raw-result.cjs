'use strict';
// Read the browser's serialized result without treating script/comment contents
// as elements. Quoted attributes may contain '>'; text entities are decoded.
function decodeEntities(text) {
  const named = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: '\u00a0' };
  return text.replace(/&(#x[0-9a-f]+|#\d+|amp|lt|gt|quot|apos|nbsp);/gi, (whole, name) => {
    if (name[0] !== '#') return named[name] ?? whole;
    const point = name[1].toLowerCase() === 'x' ? parseInt(name.slice(2), 16) : Number(name.slice(1));
    return point > 0 && point <= 0x10ffff && !(point >= 0xd800 && point <= 0xdfff) ? String.fromCodePoint(point) : '\ufffd';
  });
}
function parseResults(dom) {
  const results = [], runtimeMarkers = [];
  let current = null, at = 0, rawTag = null;
  const text = data => { if (current) current.text += decodeEntities(data); };
  while (at < dom.length) {
    if (rawTag) {
      const expression = new RegExp('</' + rawTag + '\\s*>', 'ig'); expression.lastIndex = at;
      const close = expression.exec(dom);
      if (!close) { at = dom.length; break; }
      at = close.index; rawTag = null;
    }
    const next = dom.indexOf('<', at);
    if (next < 0) { text(dom.slice(at)); break; }
    text(dom.slice(at, next));
    if (dom.startsWith('<!--', next)) {
      const end = dom.indexOf('-->', next + 4); at = end < 0 ? dom.length : end + 3; continue;
    }
    let end = next + 1, quote = null;
    for (; end < dom.length; end++) {
      const ch = dom[end];
      if (quote) { if (ch === quote) quote = null; }
      else if (ch === '"' || ch === "'") quote = ch;
      else if (ch === '>') break;
    }
    if (end === dom.length) { text(dom.slice(next)); break; }
    const token = dom.slice(next + 1, end), closing = /^\/\s*([a-z][\w:-]*)\s*$/i.exec(token);
    at = end + 1;
    if (closing) {
      if (current && closing[1].toLowerCase() === current.tag) { current.closed = true; current = null; }
      continue;
    }
    const opening = /^([a-z][\w:-]*)(?=\s|\/|$)/i.exec(token);
    if (!opening) continue;
    const tag = opening[1].toLowerCase(), attrs = Object.create(null);
    const expression = /([^\s=/>]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+)))?/g;
    expression.lastIndex = opening[0].length;
    for (let match; (match = expression.exec(token));) attrs[match[1].toLowerCase()] = decodeEntities(match[2] ?? match[3] ?? match[4] ?? '');
    if ('data-qa-runtime-error' in attrs) runtimeMarkers.push(attrs['data-qa-runtime-error']);
    if (attrs.id === 'qa-result') { current = { tag, attrs, text: '', closed: false }; results.push(current); }
    if (tag === 'script' || tag === 'style') rawTag = tag;
  }
  return { results, runtimeMarkers };
}
function rawQaObservation(dom, scenario) {
  const { results, runtimeMarkers } = parseResults(dom);
  const observation = { qa_count: results.length, qa_status: null, qa_scenario: null, json_status: null,
    json_scenario: null, runtime_markers: runtimeMarkers, runtime_error_count: null, json_error: null, valid: false };
  let payload = null;
  if (results.length !== 1) { observation.json_error = 'Expected exactly one completed QA result'; return { observation, payload }; }
  const result = results[0];
  observation.qa_status = result.attrs['data-status'] ?? null;
  observation.qa_scenario = result.attrs['data-scenario'] ?? null;
  if (result.tag !== 'pre' || !result.closed) { observation.json_error = 'QA result is not a completed pre element'; return { observation, payload }; }
  try {
    payload = JSON.parse(result.text);
    if (!payload || typeof payload !== 'object' || Array.isArray(payload)) throw Error('QA JSON must be an object');
    observation.json_status = payload.status ?? null;
    observation.json_scenario = payload.scenario ?? null;
    if (!Array.isArray(payload.runtimeErrors)) throw Error('QA runtimeErrors must be an array');
    observation.runtime_error_count = payload.runtimeErrors.length;
    if (payload.scenario !== scenario) throw Error('QA JSON scenario does not match requested scenario');
    if (!['pass', 'fail'].includes(payload.status) || payload.status !== observation.qa_status) throw Error('QA JSON status does not match QA tag');
    if (observation.qa_scenario !== null && observation.qa_scenario !== scenario) throw Error('QA tag scenario does not match requested scenario');
    observation.valid = true;
  } catch (error) { observation.json_error = error.message; }
  return { observation, payload };
}
module.exports = { rawQaObservation };

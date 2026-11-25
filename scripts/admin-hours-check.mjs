import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const engine = require('../data/hours.js');
const context = vm.createContext({ window: { OXENTE_HOURS: engine }, document: { addEventListener: () => {} }, Intl, Date });
vm.runInContext(await readFile(new URL('../admin/hours-panel.js', import.meta.url), 'utf8'), context);
const panel = context.window.OXENTE_ADMIN_HOURS;
const markup = panel.render({ hours: engine.OFFICIAL }, (title, description) => `<h2>${title}</h2><p>${description}</p>`);
assert.match(markup, /Horário de Funcionamento/);
assert.match(markup, /America\/Bahia/);
assert.equal((markup.match(/class="hours-day"/g) || []).length, 7);
assert.match(markup, /Feriados e horários especiais/);
assert.match(markup, /Restaurar funcionamento automático/);

const weekly = engine.OFFICIAL.days.map((day, index) => ({
  dataset: { day: String(index) },
  querySelector: selector => {
    if (selector === '[name="day-open"]') return { checked: day.open };
    const match = /\[name="day-(start|end)-(\d)"\]/.exec(selector);
    return { value: day.intervals[Number(match[2])]?.[match[1]] || '' };
  }
}));
const special = {
  querySelector: selector => ({
    '[name="special-open"]': { checked: false },
    '[name="special-date"]': { value: '2026-12-25' },
    '[name="special-label"]': { value: 'Natal' }
  }[selector] || { value: '' })
};
const form = {
  elements: { manual: { value: 'auto' }, manualUntil: { value: '' }, notice: { value: '' } },
  querySelectorAll: selector => selector === '.hours-day' ? weekly : selector === '.hours-special' ? [special] : []
};
const payload = panel.parse(form);
assert.equal(payload.timezone, 'America/Bahia');
assert.equal(payload.days[5].intervals[0].end, '00:00');
assert.equal(payload.specials[0].open, false);
form.elements.manual.value = 'open';
assert.throws(() => panel.parse(form), /validade futura/);
console.log('Painel de horários aprovado: 7 dias, fuso oficial, feriado, meia-noite e validade obrigatória.');

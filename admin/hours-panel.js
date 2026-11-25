/* Central de horários: salva apenas public.opening_hours via RPC autorizado. */
(() => {
  const e = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
  const days = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
  const timeFields = (prefix, intervals = []) => [0, 1].map(index => `<div class="hours-interval"><label>${index + 1}º intervalo <input type="time" name="${prefix}-start-${index}" value="${e(intervals[index]?.start || '')}"></label><span>até</span><label>Encerramento <input type="time" name="${prefix}-end-${index}" value="${e(intervals[index]?.end || '')}"></label></div>`).join('');
  const specialRow = (special = {}, index = '') => `<div class="hours-special" data-special><div class="hours-special-head"><label>Data <input type="date" name="special-date" value="${e(special.date || '')}" required></label><label>Motivo (opcional) <input name="special-label" maxlength="80" value="${e(special.label || '')}" placeholder="Feriado, evento ou extensão"></label><label class="check"><input type="checkbox" name="special-open" ${special.open ? 'checked' : ''}>Aberto</label><button type="button" data-hours-remove aria-label="Remover data especial ${index}">Remover</button></div><div class="hours-special-intervals">${timeFields('special', special.intervals)}</div></div>`;
  const localUntil = value => {
    if (!value || !Number.isFinite(Date.parse(value))) return '';
    const parts = new Intl.DateTimeFormat('sv-SE', { timeZone: 'America/Bahia', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false }).format(new Date(value));
    return parts.replace(' ', 'T');
  };
  function render(state, header) {
    const h = state.hours || window.OXENTE_HOURS.OFFICIAL;
    return header('Horário de Funcionamento', 'Horários semanais, abertura manual e datas especiais. Fuso oficial: America/Bahia.') +
      `<form id="hoursForm" class="panel hours-panel"><div class="hours-toolbar"><p>O fechamento às <strong>00h00</strong> ocorre na meia-noite do dia seguinte.</p><a href="../" target="_blank" rel="noopener">Ver página do cliente ↗</a></div>` +
      `<h3>Semana regular</h3><div class="hours-week">${days.map((name, index) => { const day = h.days?.[index] || { open: false, intervals: [] }; return `<div class="hours-day" data-day="${index}"><div class="hours-day-head"><strong>${name}</strong><label class="check"><input type="checkbox" name="day-open" ${day.open ? 'checked' : ''}>Aberto</label></div>${timeFields('day', day.intervals)}</div>`; }).join('')}</div>` +
      `<h3>Ajuste temporário</h3><div class="form-grid"><label class="field">Estado<select name="manual"><option value="auto" ${h.manual === 'auto' ? 'selected' : ''}>Funcionamento automático</option><option value="open" ${h.manual === 'open' ? 'selected' : ''}>Abrir manualmente</option><option value="closed" ${h.manual === 'closed' ? 'selected' : ''}>Fechar manualmente</option></select></label><label class="field">Válido até (America/Bahia)<input type="datetime-local" name="manualUntil" value="${e(localUntil(h.manualUntil))}"></label></div><p class="muted">O ajuste termina automaticamente na data informada. Depois, a semana regular e as datas especiais voltam a valer.</p><button type="button" class="ghost" data-hours-auto>Restaurar funcionamento automático</button>` +
      `<h3>Feriados e horários especiais</h3><p class="muted">Cada data substitui a programação semanal daquele dia. Use “Fechado” para feriados sem atendimento; use um intervalo diferente para estender ou encerrar mais cedo.</p><div id="hoursSpecials">${(h.specials || []).map(specialRow).join('')}</div><button type="button" class="ghost" data-hours-add>＋ Adicionar data especial</button>` +
      `<div class="form-grid hours-extra"><label class="field full">Aviso público opcional<textarea name="notice">${e(h.notice || '')}</textarea></label></div><div class="form-actions"><button class="primary" type="submit">SALVAR HORÁRIOS</button><span id="hoursSaveStatus" role="status" aria-live="polite"></span></div></form>`;
  }
  function intervals(row, prefix, requireOne) {
    const list = [0, 1].map(index => {
      const start = row.querySelector(`[name="${prefix}-start-${index}"]`)?.value || '';
      const end = row.querySelector(`[name="${prefix}-end-${index}"]`)?.value || '';
      if (!start && !end) return null;
      if (!start || !end || start === end) throw new Error('Preencha início e fim diferentes em cada intervalo.');
      return { start, end };
    }).filter(Boolean);
    if (requireOne && !list.length) throw new Error('Informe pelo menos um intervalo para cada dia aberto.');
    if (list.length === 2) {
      const min = window.OXENTE_HOURS.minutes;
      if (min(list[0].end) <= min(list[0].start) || min(list[1].start) < min(list[0].end) || min(list[1].start) <= min(list[0].start)) throw new Error('Os dois intervalos devem estar em ordem e sem sobreposição.');
    }
    return list;
  }
  function parse(form) {
    const manual = form.elements.manual.value;
    const untilLocal = form.elements.manualUntil.value;
    if (manual !== 'auto' && (!untilLocal || Date.parse(`${untilLocal}:00-03:00`) <= Date.now())) throw new Error('Defina uma validade futura para o ajuste manual.');
    const manualUntil = manual === 'auto' ? '' : new Date(`${untilLocal}:00-03:00`).toISOString();
    const weekly = [...form.querySelectorAll('.hours-day')].map(row => { const open = row.querySelector('[name="day-open"]').checked; return { day: days[Number(row.dataset.day)], open, intervals: open ? intervals(row, 'day', true) : [] }; });
    const specials = [...form.querySelectorAll('.hours-special')].map(row => { const open = row.querySelector('[name="special-open"]').checked; const date = row.querySelector('[name="special-date"]').value; if (!date) throw new Error('Informe a data especial.'); return { date, label: row.querySelector('[name="special-label"]').value.trim(), open, intervals: open ? intervals(row, 'special', true) : [] }; });
    if (new Set(specials.map(item => item.date)).size !== specials.length) throw new Error('Há datas especiais repetidas.');
    return { timezone: 'America/Bahia', manual, manualUntil, temporaryClosed: false, notice: form.elements.notice.value.trim(), days: weekly, specials };
  }
  document.addEventListener('click', event => {
    if (event.target.closest('[data-hours-add]')) { event.preventDefault();document.querySelector('#hoursSpecials')?.insertAdjacentHTML('beforeend', specialRow()); }
    if (event.target.closest('[data-hours-remove]')) { event.preventDefault();event.target.closest('.hours-special')?.remove(); }
    if (event.target.closest('[data-hours-auto]')) { event.preventDefault();const form = event.target.closest('form');form.elements.manual.value = 'auto';form.elements.manualUntil.value = '';form.requestSubmit(); }
  }, true);
  document.addEventListener('submit', async event => {
    if (event.target.id !== 'hoursForm') return;
    event.preventDefault();event.stopImmediatePropagation();
    const form = event.target, message = form.querySelector('#hoursSaveStatus'), button = form.querySelector('[type="submit"]');
    try { const payload = parse(form);button.disabled = true;message.textContent = 'Salvando…';await window.TR.saveHours(payload);message.textContent = 'Horários salvos e sincronizados.'; }
    catch (error) { message.textContent = error.message || 'Não foi possível salvar os horários.'; }
    finally { button.disabled = false; }
  }, true);
  window.OXENTE_ADMIN_HOURS = { render, parse };
})();

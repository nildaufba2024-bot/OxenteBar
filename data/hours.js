/* Horários do Oxente: cálculo puro a partir do relógio confirmado pelo servidor. */
(function (root) {
  const DAY_MS = 86_400_000;
  const DAY_NAMES = ['domingo', 'segunda-feira', 'terça-feira', 'quarta-feira', 'quinta-feira', 'sexta-feira', 'sábado'];
  const OFFICIAL = {
    timezone: 'America/Bahia', manual: 'auto', manualUntil: '', temporaryClosed: false, notice: '', specials: [],
    days: [
      { day: 'Domingo', open: true, intervals: [{ start: '12:00', end: '22:00' }] },
      { day: 'Segunda', open: false, intervals: [] },
      { day: 'Terça', open: true, intervals: [{ start: '16:00', end: '22:00' }] },
      { day: 'Quarta', open: true, intervals: [{ start: '16:00', end: '22:00' }] },
      { day: 'Quinta', open: true, intervals: [{ start: '16:00', end: '23:00' }] },
      { day: 'Sexta', open: true, intervals: [{ start: '15:00', end: '00:00' }] },
      { day: 'Sábado', open: true, intervals: [{ start: '12:00', end: '00:00' }] }
    ]
  };
  const clone = value => JSON.parse(JSON.stringify(value));
  const minutes = value => {
    const match = /^([01]\d|2[0-3]):([0-5]\d)$/.exec(value || '');
    return match ? Number(match[1]) * 60 + Number(match[2]) : NaN;
  };
  const clock = value => value === '00:00' ? 'meia-noite' : value.replace(':', 'h');
  function localParts(epoch, timezone) {
    const parts = Object.fromEntries(new Intl.DateTimeFormat('en-CA', {
      timeZone: timezone, year: 'numeric', month: '2-digit', day: '2-digit',
      weekday: 'short', hour: '2-digit', minute: '2-digit', hour12: false
    }).formatToParts(new Date(epoch)).map(part => [part.type, part.value]));
    const weekday = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 }[parts.weekday];
    if (weekday === undefined) throw new Error('Dia inválido');
    const ordinal = Math.floor(Date.UTC(Number(parts.year), Number(parts.month) - 1, Number(parts.day)) / DAY_MS);
    return { ordinal, weekday, minute: (Number(parts.hour) % 24) * 60 + Number(parts.minute), date: `${parts.year}-${parts.month}-${parts.day}` };
  }
  const dateFromOrdinal = ordinal => new Date(ordinal * DAY_MS).toISOString().slice(0, 10);
  function windows(hours, today) {
    const result = [];
    for (let offset = -1; offset < 8; offset++) {
      const ordinal = today.ordinal + offset;
      const weekday = (today.weekday + offset + 7) % 7;
      const date = dateFromOrdinal(ordinal);
      const special = (hours.specials || []).find(item => item.date === date);
      const day = special || hours.days?.[weekday];
      if (!day?.open || !Array.isArray(day.intervals)) continue;
      for (const interval of day.intervals) {
        const start = minutes(interval.start), end = minutes(interval.end);
        if (!Number.isFinite(start) || !Number.isFinite(end) || start === end) continue;
        const begins = ordinal * 1440 + start;
        result.push({ begins, ends: ordinal * 1440 + end + (end <= start ? 1440 : 0), start: interval.start, end: interval.end, weekday, date });
      }
    }
    return result.sort((a, b) => a.begins - b.begins);
  }
  function unavailable() { return { open: false, label: 'HORÁRIO TEMPORARIAMENTE INDISPONÍVEL', tone: 'unavailable', hint: '', minutesToChange: null }; }
  function status(hours, serverNowMs) {
    if (!hours || !Number.isFinite(serverNowMs)) return unavailable();
    try {
      const today = localParts(serverNowMs, hours.timezone || OFFICIAL.timezone);
      const now = today.ordinal * 1440 + today.minute;
      const calendar = windows(hours, today);
      const manualUntil = hours.manualUntil ? Date.parse(hours.manualUntil) : NaN;
      const manualActive = hours.manual !== 'auto' && (!Number.isFinite(manualUntil) || serverNowMs < manualUntil);
      const manualRemaining = Number.isFinite(manualUntil) ? Math.max(0, Math.ceil((manualUntil - serverNowMs) / 60_000)) : null;
      if (hours.temporaryClosed && !manualActive) return { open: false, label: 'FECHADO AGORA', tone: 'closed', hint: 'Funcionamento temporariamente suspenso', minutesToChange: null };
      if (manualActive && hours.manual === 'open') {
        const regularAfterOverride = manualRemaining === null ? null : calendar.find(item => item.begins <= now + manualRemaining && now + manualRemaining < item.ends);
        const remaining = regularAfterOverride ? regularAfterOverride.ends - now : manualRemaining;
        const ending = remaining !== null && remaining <= 30;
        const endText = regularAfterOverride ? clock(regularAfterOverride.end) : remaining === null ? '' : new Intl.DateTimeFormat('pt-BR', { timeZone: hours.timezone || OFFICIAL.timezone, hour: '2-digit', minute: '2-digit' }).format(new Date(manualUntil)).replace(':', 'h');
        return { open: true, label: ending ? 'ENCERRANDO EM BREVE' : 'ABERTO AGORA', tone: ending ? 'ending' : 'open', hint: remaining === null ? 'Aberto por ajuste manual' : ending ? `${remaining === 1 ? 'Falta 1 minuto' : `Faltam ${remaining} minutos`} para fecharmos` : `Estamos abertos até ${endText === 'meia-noite' ? endText : `às ${endText}`}`, minutesToChange: remaining };
      }
      const active = calendar.find(item => item.begins <= now && now < item.ends);
      const closedByManual = manualActive && hours.manual === 'closed';
      if (active && !closedByManual) {
        const remaining = active.ends - now;
        const ending = remaining <= 30;
        return { open: true, label: ending ? 'ENCERRANDO EM BREVE' : 'ABERTO AGORA', tone: ending ? 'ending' : 'open', hint: ending ? `${remaining === 1 ? 'Falta 1 minuto' : `Faltam ${remaining} minutos`} para fecharmos` : `Estamos abertos até ${clock(active.end) === 'meia-noite' ? 'meia-noite' : `às ${clock(active.end)}`}`, minutesToChange: remaining };
      }
      if (closedByManual && manualRemaining === null) return { open: false, label: 'FECHADO AGORA', tone: 'closed', hint: 'Fechado por ajuste manual', minutesToChange: null };
      const firstPossible = closedByManual ? now + manualRemaining : now;
      const future = calendar.find(item => item.begins > now && item.begins >= firstPossible);
      const resumed = closedByManual && active && active.ends > firstPossible ? { ...active, begins: firstPossible, start: null } : null;
      const next = resumed && (!future || resumed.begins < future.begins) ? resumed : future;
      if (!next) return { open: false, label: 'FECHADO AGORA', tone: 'closed', hint: 'Consulte os próximos horários de funcionamento', minutesToChange: null };
      const remaining = next.begins - now;
      const soon = remaining <= 30;
      let hint;
      if (soon) hint = `${remaining === 1 ? 'Falta 1 minuto' : `Faltam ${remaining} minutos`} para abrirmos`;
      else if (next.begins === firstPossible && next.start === null) hint = `Voltamos em ${remaining} minutos`;
      else {
        const dayOffset = Math.floor(next.begins / 1440) - today.ordinal;
        const at = clock(next.start);
        const todayRule = (hours.specials || []).find(item => item.date === today.date) || hours.days?.[today.weekday];
        const closedToday = !todayRule?.open;
        hint = dayOffset === 0 ? `Abrimos hoje às ${at}` : dayOffset === 1 && !closedToday ? `Voltamos amanhã às ${at}` : `Voltamos ${DAY_NAMES[next.weekday]} às ${at}`;
        if (dayOffset > 0 && closedToday) hint = `Hoje estamos fechados. ${hint}`;
      }
      return { open: false, label: soon ? 'ABRIMOS EM BREVE' : 'FECHADO AGORA', tone: soon ? 'opening' : 'closed', hint, minutesToChange: remaining };
    } catch { return unavailable(); }
  }
  const api = { OFFICIAL, clone, status, localParts, minutes };
  root.OXENTE_HOURS = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);

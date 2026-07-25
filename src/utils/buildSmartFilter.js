export const buildSmartFilter = (query, configs) => {
  const filter = {};

  for (const [queryKey, config] of Object.entries(configs)) {
    const raw = query[queryKey];
    if (raw === undefined || raw === null || raw === '') continue;

    const values = String(raw)
      .split(',')
      .map((v) => v.trim())
      .filter(Boolean);

    if (values.length === 0) continue;

    const cast = (v) => {
      if (config.type === 'number')  return Number(v);
      if (config.type === 'boolean') return v === 'true';
      return v;
    };

    const parsed = values.map(cast);
    const targetField = config.field ?? queryKey;

    filter[targetField] = parsed.length === 1 ? parsed[0] : { $in: parsed };
  }

  return filter;
};

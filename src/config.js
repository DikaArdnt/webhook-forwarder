import 'dotenv/config';

const list = (v) =>
  (v || '')
    .split(',')
    .map(x => x.trim())
    .filter(Boolean);

const bool = (v) => v === 'true';

export function loadProviders() {
  const providers = [];

  for (const key of Object.keys(process.env)) {
    if (!key.endsWith('_ENABLED')) continue;

    const prefix = key.replace('_ENABLED', '');

    if (!bool(process.env[key])) continue;

    const path = process.env[`${prefix}_PATH`];
    const targets = list(process.env[`${prefix}_TARGETS`]);

    if (!path || !targets.length) continue;

    providers.push({
      id: prefix.toLowerCase(),
      name: process.env[`${prefix}_ALIAS`] || prefix.toLowerCase(),
      plugin: process.env[`${prefix}_PLUGIN`] || 'default',
      path,
      targets,
      timeout: Number(process.env[`${prefix}_TIMEOUT`] || 25000)
    });
  }

  return providers;
}

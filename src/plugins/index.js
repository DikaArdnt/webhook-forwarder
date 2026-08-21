import defaultPlugin from './default.js';
import midtrans from './midtrans.js';

const plugins = {
  default: defaultPlugin,
  midtrans,
};

export function getPlugin(name) {
  return plugins[name] || plugins.default;
}

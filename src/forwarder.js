import axios from 'axios';
import { getPlugin } from './plugins/index.js';

export async function forwardWebhook(provider, body, headers, source) {
	const plugin = getPlugin(provider.plugin);

	const verified = await plugin.verify(body, headers);
	if (!verified) {
		return {
			provider: provider.name,
			status: 'rejected',
			reason: 'verification_failed',
		};
	}

	const payload = await plugin.beforeForward(body);

	const errors = [];

	for (const target of provider.targets) {
		try {
			const url = new URL(target);

			await axios.post(target, payload, {
				timeout: provider.timeout,
				headers: {
					...headers,
					'Content-Type': 'application/json',
					Host: url.host,
					Origin: url.origin,
					Referer: target,
					'X-Forwarded-By': 'Webhook-Forwarder',
					'X-Provider': provider.name,
					'X-Source': source,
				},
			});
		} catch (e) {
			errors.push({ target, error: e.message });
		}
	}

	return plugin.afterForward({
		provider: provider.name,
		forwarded: provider.targets.length,
		errors,
	});
}

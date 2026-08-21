import { Hono } from 'hono';
import { loadProviders } from './config.js';
import { forwardWebhook } from './forwarder.js';

const app = new Hono();

const providers = loadProviders();

app.get('*', c => c.text('Hello Everynyan!'));

for (const provider of providers) {
  app.post(provider.path, async c => {
    const body = await c.req.json();
    const headers = c.req.header();

    return c.json(
      await forwardWebhook(
        provider,
        body,
        headers,
        c.req.url
      )
    );
  });
}

export default app;

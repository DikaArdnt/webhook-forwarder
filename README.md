# Dynamic Pluginable Webhook Forwarder (Hono + Wrangler)

A lightweight and extensible webhook forwarding gateway built with:

- Node.js
- Hono
- Cloudflare Wrangler
- Axios
- Environment-based dynamic provider discovery
- Plugin-based provider customization

This project receives webhook events from external providers (Midtrans, Xendit, etc.) and forwards them to configured
destinations.

Providers are automatically detected from environment variables, while custom provider behavior can be handled using plugins.

---

# Features

## Dynamic Provider Configuration

No need to modify source code when adding a new webhook provider.

Providers are detected automatically using:

```env
PROVIDER_ENABLED
PROVIDER_PATH
PROVIDER_TARGETS
```

Example:

```env
MIDTRANS_ENABLED=true
MIDTRANS_PATH=/midtrans/webhook
MIDTRANS_TARGETS=https://example.com/payment
```

Automatically creates:

```
POST /midtrans/webhook
```

and forwards requests to:

```
https://example.com/payment
```

---

## Plugin System

Providers can have custom logic using plugins.

Example use cases:

- Signature verification
- Payload transformation
- Custom validation
- Logging
- Response handling

Plugin lifecycle:

```
Webhook Request
       |
       v
plugin.verify()
       |
       v
plugin.beforeForward()
       |
       v
Forward Request
       |
       v
plugin.afterForward()
```

---

# Requirements

Install:

- Node.js >= 18
- npm
- Cloudflare account (for deployment)

Check Node version:

```bash
node -v
```

---

# Installation

Clone repository:

```bash
git clone https://github.com/DikaArdnt/webhook-forwarder

cd webhook-forwarder
```

Install dependencies:

```bash
npm install
```

---

# Environment Configuration

Create environment file:

```bash
cp .env.example .env
```

Example:

```env
MIDTRANS_ENABLED=true
MIDTRANS_PLUGIN=midtrans
MIDTRANS_ALIAS=Midtrans Payment
MIDTRANS_PATH=/midtrans/webhook
MIDTRANS_TARGETS=https://your-app.com/webhook

MIDTRANS_TIMEOUT=25000

MIDTRANS_SERVER_KEY=your-midtrans-server-key
```

---

# Provider Configuration

Every provider follows this pattern:

```env
NAME_ENABLED=true
NAME_PLUGIN=plugin-name
NAME_ALIAS=Display Name
NAME_PATH=/webhook/path
NAME_TARGETS=https://target-one.com,https://target-two.com
NAME_TIMEOUT=25000
```

## Configuration Reference

| Variable       | Required | Description               |
| -------------- | -------- | ------------------------- |
| `NAME_ENABLED` | Yes      | Enable provider           |
| `NAME_PLUGIN`  | No       | Plugin name               |
| `NAME_ALIAS`   | No       | Provider display name     |
| `NAME_PATH`    | Yes      | Incoming webhook endpoint |
| `NAME_TARGETS` | Yes      | Forward destination URLs  |
| `NAME_TIMEOUT` | No       | Request timeout           |

---

# Example Midtrans Setup

Environment:

```env
MIDTRANS_ENABLED=true
MIDTRANS_PLUGIN=midtrans
MIDTRANS_ALIAS=Midtrans Payment

MIDTRANS_PATH=/midtrans/webhook

MIDTRANS_TARGETS=https://api.example.com/payment/webhook

MIDTRANS_SERVER_KEY=Mid-server-example
```

Incoming webhook:

```
POST /midtrans/webhook
```

Processing:

```
Midtrans
    |
    v
verify signature
    |
    v
normalize payload
    |
    v
forward request
```

---

# Plugin Development

Plugins are located in:

```
src/plugins/
```

Example:

```
src/plugins/
|
├── default.js
├── midtrans.js
└── custom.js
```

Plugin format:

```javascript
export default {
	async verify(payload, headers) {
		return true;
	},

	async beforeForward(payload) {
		return payload;
	},

	async afterForward(result) {
		return result;
	},
};
```

---

# Adding New Plugin

Create:

```
src/plugins/xendit.js
```

Example:

```javascript
export default {
	async verify(payload) {
		// custom validation

		return true;
	},

	async beforeForward(payload) {
		return {
			data: payload,
		};
	},

	async afterForward(result) {
		console.log(result);

		return result;
	},
};
```

Register:

```
src/plugins/index.js
```

Add:

```javascript
import xendit from './xendit.js';

const plugins = {
	default: defaultPlugin,
	midtrans,
	xendit,
};
```

Environment:

```env
XENDIT_ENABLED=true
XENDIT_PLUGIN=xendit
XENDIT_PATH=/xendit/webhook
XENDIT_TARGETS=https://example.com/xendit
```

---

# Local Development

Run Wrangler development server:

```bash
npm run dev
```

Default URL:

```
http://localhost:8787
```

Test:

```bash
curl \
-X POST \
http://localhost:8787/midtrans/webhook \
-H "Content-Type: application/json" \
-d '{
    "order_id":"TEST-001",
    "transaction_status":"settlement"
}'
```

---

# Cloudflare Deployment

Login Wrangler:

```bash
npx wrangler login
```

Deploy:

```bash
npm run deploy
```

After deployment:

```
https://your-worker.workers.dev
```

Your webhook endpoint:

```
https://your-worker.workers.dev/midtrans/webhook
```

---

# Wrangler Configuration

Example `wrangler.jsonc`:

```jsonc
{
  "name": "webhook-forwarder",
  "main": "src/index.js",
  "compatibility_date": "2026-08-21",
  "compatibility_flags": [
    "nodejs_compat"
  ]
}
```

---

```
compatibility_date = "2026-08-21"

is the date when the worker is compatible with the Cloudflare runtime. It ensures that the worker uses the features and behavior of the runtime as of that date.

```

---

# Environment Variables on Cloudflare

For production, do not upload `.env`.

Use Wrangler secrets:

Example:

```bash
npx wrangler secret put MIDTRANS_SERVER_KEY
```

Then enter:

```
Mid-server-xxxxxxxx
```

---

# Production Recommendations

## Idempotency

Payment providers may resend webhook events.

Recommended:

```
Webhook received

        |
        v

Check event/order_id

        |
        +---- Already processed
        |
        +---- Process event
```

---

## Retry Queue

For critical payment events:

Recommended architecture:

```
Webhook
   |
   v
Cloudflare Worker
   |
   v
Queue
   |
   v
Forward Worker
   |
   v
Destination API
```

---

## Logging

Add:

- Request ID
- Provider name
- Order ID
- Forward result
- Response status

---

# Project Structure

```
webhook-forwarder

├── src
├── index.js
├── config.js
├── forwarder.js
└── plugins
    |
    ├── index.js
    ├── default.js
    └── midtrans.js

├── .env.example
├── package.json
└── wrangler.jsonrc
```

---

# License

MIT License

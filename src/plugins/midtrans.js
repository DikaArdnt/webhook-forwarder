import crypto from 'node:crypto';

export default {
	/**
	 * Validate Midtrans signature_key
	 *
	 * Midtrans:
	 * signature_key =
	 * SHA512(order_id + status_code + gross_amount + server_key)
	 */
	async verify(payload) {
		const serverKey = process.env.MIDTRANS_SERVER_KEY;
		if (!serverKey) {
			console.warn('MIDTRANS_SERVER_KEY not configured, skip verification');

			return true;
		}

		const { order_id, status_code, gross_amount, signature_key } = payload;
		if (!order_id || !status_code || !gross_amount || !signature_key) {
			return false;
		}

		const raw = order_id + status_code + gross_amount + serverKey;

		const expected = crypto.createHash('sha512').update(raw).digest('hex');

		return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature_key));
	},

	/**
	 * Normalize payload sebelum diteruskan
	 */
	async beforeForward(payload) {
		return {
			provider: 'midtrans',
			transaction: {
				order_id: payload.order_id,
				status: payload.transaction_status,
				fraud_status: payload.fraud_status,
				payment_type: payload.payment_type,
				gross_amount: payload.gross_amount,
			},
			raw: payload,
		};
	},

	/**
	 * Setelah forwarding selesai
	 */
	async afterForward(result) {
		console.log('[MIDTRANS] Forward result:', result);

		return result;
	},
};

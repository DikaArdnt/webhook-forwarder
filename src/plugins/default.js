export default {
	async beforeForward(payload) {
		return payload;
	},

	async afterForward(result) {
		return result;
	},

	async verify() {
		return true;
	},
};

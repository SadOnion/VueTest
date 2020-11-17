<template>
	<div class="websocket-test">
		<cv-form class="form" @submit.prevent="sendMessage">
			<cv-text-area
				class="text-area"
				label="Message data content"
				placeholder="Your message data"
				v-model="message"
			>
			</cv-text-area>
			<cv-button class="submit">Send Message</cv-button>
		</cv-form>
		<div class="response" v-if="socket.message">
			<label class="title bx--label">Last received message</label>
			<p class="data">
				{{ socket.message }}
			</p>
		</div>
	</div>
</template>

<script lang="ts">
import Vue from 'vue'
import { mapState } from 'vuex'

export default Vue.extend({
	name: 'WebSocketTest',
	data() {
		return {
			message: '',
		}
	},
	computed: {
		...mapState(['socket']),
	},
	methods: {
		sendMessage() {
			this.$store.dispatch('sendMessage', this.message)
		},
	},
})
</script>

<style lang="scss" scoped>
@import '@carbon/layout/scss/layout';
@import '../styles/mixins';

.websocket-test {
	width: 100vw;
	min-height: 100vh;
	padding-top: 48px;
	display: flex;
	flex-direction: column;
	justify-content: center;
	align-items: center;
}
.text-area {
	width: 40vmin;
}
.submit {
	margin-top: $spacing-05;
}
.response {
	margin-top: $spacing-10;
	width: 40vmin;
	.title {
		margin-bottom: $spacing-03;
	}
}
</style>

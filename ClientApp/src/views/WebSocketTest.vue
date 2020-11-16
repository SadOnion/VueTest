<template>
	<div class="websocket-test">
		<cv-form class="form" @submit.prevent="sendMessage">
			<cv-text-area
				class="text-area"
				label="Message data content"
				placeholder="Your message data"
				v-model="data"
			>
			</cv-text-area>
			<cv-button class="submit">Send Message</cv-button>
		</cv-form>
		<div class="response" v-if="response">
			<label class="title bx--label">Last received message</label>
			<p class="data">
				{{ response }}
			</p>
		</div>
	</div>
</template>

<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
	name: 'WebSocketTest',
	data() {
		return {
			data: '',
			response: '',
			connection: null as WebSocket | null,
		}
	},
	methods: {
		sendMessage() {
			this.connection?.send(this.data)
		},
	},
	created() {
		console.log('Starting Connection to Websocket')

		this.connection = new WebSocket(process.env.VUE_APP_WEBSOCKET)

		this.connection.addEventListener('open', e => {
			console.log('Successfully connected')
			console.log(e)
		})

		this.connection.addEventListener('message', ({ data }) => {
			console.log('Received Message')
			console.log(data)
			this.data = data
		})

		this.connection.addEventListener('close', e => {
			console.log('Connection closed')
			console.log(e)
		})
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

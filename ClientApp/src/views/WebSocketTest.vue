<template>
	<div>
		<button @click="sendMessage('hello world')">
			Send Websocket Message
		</button>
	</div>
</template>

<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
	name: 'WebSocketTest',
	data() {
		return {
			connection: null as WebSocket | null,
		}
	},
	methods: {
		sendMessage(message: string) {
			this.connection?.send(message)
		},
	},
	created() {
		console.log('Starting Connection to Websocket')

		this.connection = new WebSocket(process.env.VUE_APP_WEBSOCKET)

		this.connection.addEventListener('open', e => {
			console.log('Successfully connected')
			console.log(e)
		})

		this.connection.addEventListener('message', e => {
			console.log('Received Message')
			console.log(e)
		})

		this.connection.addEventListener('close', e => {
			console.log('Connection closed')
			console.log(e)
		})
	},
})
</script>

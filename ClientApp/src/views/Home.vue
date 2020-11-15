<template>
	<div class="home">
		<div class="home">hello</div>
		<button @click="sendMessage('hello world')">
			Send Websocket Message
		</button>
	</div>
</template>

<script lang="ts">
import Vue from 'vue'
// import store from '@/store'

export default Vue.extend({
	name: 'Home',
	data() {
		return {
			connection: null as WebSocket | null,
		}
	},
	methods: {
		sendMessage(message: string) {
			console.log('connection:', this.connection)
			this.connection?.send(message)
		},
	},
	created() {
		console.log('Starting Connection to Websocket')

		// this.connection = new WebSocket('wss://echo.websocket.org')
		this.connection = new WebSocket('ws://localhost:9090')

		this.connection.addEventListener('open', e => {
			console.log('Successfully connected')
			console.log(e)
		})

		this.connection.addEventListener('message', e => {
			console.log('Received Message')
			console.log(e)
		})
	},
	mounted() {
		// console.log(store)
	},
})
</script>

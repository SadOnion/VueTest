<template>
	<div id="app">
		<Nav />
		<router-view />
	</div>
</template>

<script lang="ts">
import Vue from 'vue'
import Nav from '@/components/Nav.vue'
import * as signalR from '@microsoft/signalr'

export default Vue.extend({
	name: 'App',
	components: { Nav },
	created() {
		// this.$store.dispatch('initWebSocket')

		const connection = new signalR.HubConnectionBuilder()
			.withUrl('/net')
			.build()

		connection.on('messageReceived', message => {
			console.log(message)
		})

		connection.start().catch(console.error)
	},
})
</script>

<style lang="scss">
@import '@carbon/themes/scss/themes';
// Use the gray 100 theme
$carbon--theme: $carbon--theme--g100;
@include carbon--theme();
// import Carbon styles here
@import 'carbon-components/scss/globals/scss/styles.scss';
</style>

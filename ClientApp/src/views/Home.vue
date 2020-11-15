<template>
	<div class="home">yoo</div>
</template>

<script lang="ts">
import Vue from 'vue'
import VueNativeSock from 'vue-native-websocket'
import store from '@/store'

export default Vue.extend({
	name: 'Home',
	created() {
		Vue.use(VueNativeSock, 'ws://localhost:9090', { store })
	},
})
</script>

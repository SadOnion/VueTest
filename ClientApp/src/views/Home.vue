<template>
	<div class="home">hello</div>
</template>

<script lang="ts">
import Vue from 'vue'
import store from '@/store'

export default Vue.extend({
	name: 'Home',
	mounted() {
		console.log(store)
	},
})
</script>

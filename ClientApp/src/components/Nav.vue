<template>
	<cv-header aria-label="Carbon header" class="main-nav">
		<cv-header-menu-button
			aria-label="Header menu"
			aria-controls="side-nav"
		/>
		<cv-skip-to-content href="#main-content">
			Skip to content
		</cv-skip-to-content>
		<cv-header-name>{{ pageTitle }}</cv-header-name>
		<cv-header-nav aria-label="Carbon nav">
			<cv-header-menu-item
				v-for="route in routes"
				:key="route.name"
				:to="route.path"
			>
				{{ route.meta.title || route.name }}
			</cv-header-menu-item>
			<!-- <cv-header-menu aria-label="Link 4" title="Link 4">
				<cv-header-menu-item href="javascript:void(0)">
					Submenu Link 1
				</cv-header-menu-item>
				<cv-header-menu-item href="javascript:void(0)">
					Submenu Link 2
				</cv-header-menu-item>
				<cv-header-menu-item href="javascript:void(0)">
					Submenu Link 3
				</cv-header-menu-item>
			</cv-header-menu> -->
		</cv-header-nav>
		<template v-slot:left-panels v-if="true">
			<cv-side-nav id="side-nav" fixed>
				<cv-side-nav-items>
					<cv-header-side-nav-items>
						<cv-header-menu-item
							v-for="route in routes"
							:key="route.name"
							:to="route.path"
						>
							{{ route.meta.title || route.name }}
						</cv-header-menu-item>
					</cv-header-side-nav-items>
				</cv-side-nav-items>
			</cv-side-nav>
		</template>
		<!-- <template v-slot:right-panels v-if="true"> </template> -->
	</cv-header>
</template>

<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
	name: 'Nav',
	computed: {
		pageTitle(): string {
			return this.$route?.meta.title || 'Vue.NET Test'
		},
		routes() {
			return this.$router.options.routes
		},
	},
	methods: {
		link(destination: any): void {
			if (
				destination?.name === this.$route.name ||
				destination === this.$route.path
			)
				return
			this.$router.push(destination)
		},
	},
})
</script>

<style lang="scss">
.main-nav a {
	cursor: pointer;
}
</style>

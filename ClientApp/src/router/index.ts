import Vue from 'vue'
import VueRouter, { RouteConfig } from 'vue-router'

Vue.use(VueRouter)

const routes: Array<RouteConfig> = [
	{
		path: '/',
		name: 'Switch',
		meta: {
			title: 'On / Off Switch',
		},
		component: () => import('@/views/OnOffSwitch.vue'),
	},
	{
		path: '/labyrinth-generator',
		name: 'LabyrinthGenerator',
		meta: {
			title: 'Client Labyrinth Generator',
		},
		component: () => import('@/views/LabyrinthGenerator.vue'),
	},
	{
		path: '/player-movement',
		name: 'PlayerMovement',
		meta: {
			title: 'Player Movement',
		},
		component: () => import('@/views/PlayerMovement.vue'),
	},
]

const router = new VueRouter({
	mode: 'history',
	base: process.env.BASE_URL,
	routes,
})

export default router

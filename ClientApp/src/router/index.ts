import Vue from 'vue'
import VueRouter, { RouteConfig } from 'vue-router'

Vue.use(VueRouter)

const routes: Array<RouteConfig> = [
	// {
	// 	path: '/',
	// 	name: 'Switch',
	// 	meta: {
	// 		title: 'On / Off Switch',
	// 	},
	// 	component: () => import('@/views/OnOffSwitch.vue'),
	// },
	{
		path: '/',
		name: 'SignalrTest',
		meta: {
			title: 'SignalR Test',
		},
		component: () => import('@/views/SignalrTest.vue'),
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
		path: '/labyrinth-generator-alt',
		name: 'LabyrinthGeneratorCopy',
		meta: {
			title: 'Client Labyrinth Generator Alternative',
		},
		component: () => import('@/views/LabyrinthGeneratorCopy.vue'),
	},
]

const router = new VueRouter({
	mode: 'history',
	base: process.env.BASE_URL,
	routes,
})

export default router

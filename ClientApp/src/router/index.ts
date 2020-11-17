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
		path: '/test',
		name: 'WebSocketTest',
		meta: {
			title: 'WebSocket Test',
		},
		component: () => import('@/views/WebSocketTest.vue'),
	},
	{
		path: '/test-copy',
		name: 'WebSocketTestCopy',
		meta: {
			title: 'WebSocket Test Copy',
		},
		component: () => import('@/views/WebSocketTestCopy.vue'),
	},
]

const router = new VueRouter({
	mode: 'history',
	base: process.env.BASE_URL,
	routes,
})

export default router

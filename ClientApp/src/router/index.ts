import Vue from 'vue'
import VueRouter, { RouteConfig } from 'vue-router'

Vue.use(VueRouter)

const routes: Array<RouteConfig> = [
	{
		path: '/',
		name: 'Switch',
		component: () => import('@/views/StairsSwitch.vue'),
	},
	{
		path: '/test',
		name: 'WebSocketTest',
		component: () => import('@/views/WebSocketTest.vue'),
	},
]

const router = new VueRouter({
	mode: 'history',
	base: process.env.BASE_URL,
	routes,
})

export default router

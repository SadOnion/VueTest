<template>
	<div class="player-movement">
		<div class="player"></div>
		<canvas ref="canvas" class="cursor canvas--cursor"></canvas>
		<GlobalEvents
			@mousemove="handleMove"
			@mousedown="handleMouseDown"
			@mouseup="dragging = false"
		/>
	</div>
</template>

<script lang="ts">
import Vue from 'vue'
import paper from 'paper'
// eslint-disable-next-line import/extensions
import { lerp, clamp } from '@/library/utilities.ts'

const mainColor = new paper.Color('#a8dadc')

type Pos = [number, number]

export default Vue.extend({
	name: 'PlayerMovement',
	data() {
		return {
			dragging: false,
			mouse: [0, 0] as Pos,
			lerp: [0, 0] as Pos,
			stop: [0, 0] as Pos,
			paper: {
				dot: null as paper.Path.RegularPolygon | null,
				ring: null as paper.Path.RegularPolygon | null,
				line: null as paper.Path | null,
			},
		}
	},
	methods: {
		initCanvas() {
			paper.setup(this.$refs.canvas as HTMLCanvasElement)
			this.paper = {
				dot: createDot(),
				ring: createRing(),
				line: createLine(),
			}

			paper.view.onFrame = this.onFrame
		},
		onFrame() {
			const { dot, ring, line } = this.paper

			if (!dot || !ring || !line) return

			const [x, y] = this.mouse,
				{ lerp: last, stop } = this

			this.lerp = [lerp(last[0], x, 0.4), lerp(last[1], y, 0.4)]

			dot.position = new paper.Point(last)
			ring.position = new paper.Point(stop)

			line.segments[0].point = new paper.Point(stop)
			line.segments[1].point = new paper.Point(last)

			if (this.dragging) {
				;[line, ring].forEach(
					shape =>
						((shape as any).strokeColor.alpha = Math.min(
							(shape as any).strokeColor.alpha + 0.06,
							1,
						)),
				)
			} else {
				;[line, ring].forEach(
					shape =>
						((shape as any).strokeColor.alpha = Math.max(
							(shape as any).strokeColor.alpha - 0.06,
							0,
						)),
				)
			}
		},
		handleMove(e: MouseEvent) {
			const { x, y } = e
			this.mouse = [x, y]
		},
		handleMouseDown(e: MouseEvent) {
			const { x, y } = e
			this.stop = [x, y]
			this.dragging = true
		},
	},
	mounted() {
		this.initCanvas()
	},
})

function createDot() {
	const dot = new paper.Path.RegularPolygon(new paper.Point(0, 0), 4, 4)
	dot.fillColor = mainColor
	dot.smooth()
	return dot
}
function createRing() {
	const ring = new paper.Path.RegularPolygon(new paper.Point(0, 0), 4, 20)
	ring.strokeColor = mainColor
	ring.strokeWidth = 1.5
	ring.strokeColor.alpha = 0
	ring.smooth()
	return ring
}
function createLine() {
	const line = new paper.Path()
	line.strokeColor = mainColor
	line.strokeWidth = 1.5
	line.strokeColor.alpha = 0
	line.add(new paper.Point(0, 0))
	line.add(new paper.Point(0, 0))
	return line
}
</script>

<style lang="scss" scoped>
@import '@carbon/colors/scss/colors';
@import '@carbon/layout/scss/layout';
@import '../styles/mixins';

.player-movement {
	@include full-view-page;
	cursor: none;
}

.player {
	position: fixed;
	left: 50%;
	top: 50%;
	width: $layout-03;
	height: $layout-04;
	background: $white-0;
	clip-path: polygon(50% 0%, 0% 100%, 100% 100%);
}

.cursor {
	position: fixed;
	top: 0;
	left: 0;
	width: 100vw;
	height: 100vw;
	display: block;
}
</style>

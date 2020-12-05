<template>
	<div class="movement-cursor">
		<canvas
			ref="canvas"
			class="cursor canvas--cursor"
			:class="{ visible }"
		></canvas>
		<GlobalEvents
			@mousemove="handleMove"
			@mousedown="handleMouseDown"
			@mouseup="dragging = false"
			@mouseout="visible = false"
			@mouseleave="visible = false"
		/>
	</div>
</template>

<script lang="ts">
import Vue from 'vue'
import paper from 'paper'
// eslint-disable-next-line import/extensions
import { lerp, radToDeg, clamp } from '@/library/utilities.ts'

import { XY, MovementPayload } from '@/types'

const mainColor = new paper.Color('#a8dadc')

export default Vue.extend({
	name: 'MovementCursor',
	data() {
		return {
			visible: false,
			dragging: false,
			mouse: [0, 0] as XY,
			lerp: [0, 0] as XY,
			stop: [0, 0] as XY,
			paper: {
				dot: null as paper.Path.RegularPolygon | null,
				ring: null as paper.Path.RegularPolygon | null,
				line: null as paper.Path | null,
			},
			force: 0,
			angle: 0,
			sin: 0,
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
				{ lerp: last, stop } = this,
				calcLerp = (lastVal: number, val: number) =>
					Math.round(lerp(lastVal, val, 0.4))

			this.lerp = [calcLerp(last[0], x), calcLerp(last[1], y)]

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
			this.mouse = [e.x, e.y]
			this.visible = true
		},
		calcMovement() {
			let { force, angle, sin } = this
			if (this.dragging) {
				const [x, y] = this.lerp,
					vector = [x - this.stop[0], y - this.stop[1]] as XY
				const d = (vector[0] ** 2 + vector[1] ** 2) ** (1 / 2)
				sin = Math.abs(vector[0]) / d
				const radian = Math.asin(sin)

				angle = radToDeg(radian) || 0
				force = clamp(
					(d / Math.min(window.innerHeight, window.innerWidth)) * 4,
					0,
					1,
				)

				if (vector[0] > 0 && vector[1] >= 0) angle = 90 - angle + 90
				else if (vector[0] <= 0 && vector[1] >= 0) angle += 180
				else if (vector[0] < 0 && vector[1] <= 0) angle = 90 - angle + 270
			} else {
				const calcLerp = (last: number) =>
					last > 0.01 ? lerp(last, 0, 0.3) : 0
				force = calcLerp(force)
			}

			if (force !== this.force || angle !== this.angle) {
				const payload: MovementPayload = {
					force,
					angle,
					sin,
				}
				this.$emit('movement', payload)
			}

			this.force = force
			this.angle = angle
			this.sin = sin
		},
		handleMouseDown(e: MouseEvent) {
			const { x, y } = e
			this.stop = [x, y]
			this.dragging = true
		},
	},
	mounted() {
		this.initCanvas()

		setInterval(this.calcMovement, 50)
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
.movement-cursor {
	cursor: none;
}
.cursor {
	position: fixed;
	top: 0;
	left: 0;
	width: 100vw;
	height: 100vh;
	display: block;
	opacity: 0;
	&.visible {
		opacity: 1;
	}
}
</style>

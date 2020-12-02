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

const mainColor = new paper.Color('#a8dadc')

type XY = [number, number]

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
			vector: [0, 0] as XY,
			move: 0,
			angle: 0,
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
			if (this.dragging) {
				const [x, y] = this.lerp
				const vector = [x - this.stop[0], y - this.stop[1]],
					d = (vector[0] ** 2 + vector[1] ** 2) ** (1 / 2),
					radian = Math.asin(Math.abs(vector[0]) / d),
					angle = radToDeg(radian),
					move = clamp(
						d / Math.min(window.innerHeight, window.innerWidth),
						0,
						1,
					)

				this.vector = vector
				this.move = move
				if (vector[0] > 0 && vector[1] >= 0) this.angle = 90 - angle + 90
				else if (vector[0] <= 0 && vector[1] >= 0) this.angle = angle + 180
				else if (vector[0] < 0 && vector[1] <= 0)
					this.angle = 90 - angle + 270
				else this.angle = angle
			} else {
				const calcLerp = (last: number) =>
					last > 0.01 ? lerp(last, 0, 0.3) : 0
				this.move = calcLerp(this.move)
			}

			this.$emit('movement', {
				move: this.move,
				angle: this.angle,
			})
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
	watch: {
		// lerp(a, b) {
		// 	if (a[0] === b[0] && a[1] === b[1]) return
		// 	this.calcMovement()
		// },
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
	@include full-view-page;
	cursor: none;
}
.cursor {
	position: fixed;
	top: 0;
	left: 0;
	width: 100vw;
	height: 100vw;
	display: block;
	opacity: 0;
	&.visible {
		opacity: 1;
	}
}
</style>

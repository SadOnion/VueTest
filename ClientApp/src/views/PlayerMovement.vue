<template>
	<div class="player-movement">
		<div
			class="player"
			:style="{
				'--angle': angle + 'deg',
				'--x': pos[0] + 'px',
				'--y': pos[1] + 'px',
			}"
		></div>
		<MovementCursor @movement="handlePlayerInput" />
		<ul class="log">
			<li>angle: {{ angle }}</li>
			<li>goal vector: {{ goalVector[0] }}; {{ goalVector[1] }}</li>
			<li>position: {{ pos[0] }}; {{ pos[1] }}</li>
			<li>
				movement goal: {{ goalVector[0] + pos[0] }};
				{{ goalVector[1] + pos[1] }}
			</li>
		</ul>
		<div
			class="goal-ball goal"
			:style="{
				'--x': goalVector[0] + pos[0] + 'px',
				'--y': goalVector[1] + pos[1] + 'px',
			}"
		></div>
	</div>
</template>

<script lang="ts">
import Vue from 'vue'
import MovementCursor from '@/components/MovementCursor.vue'
import { XY, MovementPayload } from '@/types'
// eslint-disable-next-line import/extensions
import { lerp, roundNumber } from '@/library/utilities.ts'
import { stayInRange } from '@/library/utilities.js'

let vectorInput: XY = [0, 0],
	angleInput = 0

export default Vue.extend({
	name: 'PlayerMovement',
	components: {
		MovementCursor,
	},
	data() {
		return {
			angle: 0,
			goalVector: [0, 0] as XY,
			pos: [0, 0] as XY,
		}
	},
	methods: {
		handlePlayerInput(payload: MovementPayload) {
			const { angle, force, sin } = payload
			angleInput = angle

			const d = 200 * force || 0
			let x = sin * d || 0,
				y = (d ** 2 - x ** 2) ** (1 / 2) || 0

			if (angle > 270) {
				x *= -1
				y *= -1
			} else if (angle > 180) x *= -1
			else if (angle < 90) y *= -1

			vectorInput = [x, y]
		},
		everyFrame() {
			// Smoothing the relative goal vector towards input value
			this.goalVector = vectorInput.map((n, i) =>
				smooth(this.goalVector[i], n, 0.2),
			) as XY

			// Smoothing the global player position towards position + vector
			this.pos = this.pos.map((current, i) =>
				smooth(current, current + this.goalVector[i], 0.05),
			) as XY

			// Smoothing player angle towards input angle
			if (Math.abs(angleInput - this.angle) < 180)
				this.angle = smooth(this.angle, angleInput, 0.1)
			else {
				/**
				 * Handling the exception when the shortest road,
				 * from current angle to the goal angle,
				 * leads through the 0 / 360 deg breakpoint.
				 */
				this.angle =
					this.angle > angleInput
						? smooth(this.angle, angleInput + 360, 0.1)
						: smooth(this.angle + 360, angleInput, 0.1) - 360
				this.angle = stayInRange(this.angle, 0, 360, 'loop')
			}
		},
		positionInMiddle() {
			const { innerWidth: vw, innerHeight: vh } = window
			this.pos = [vw / 2, vh / 2]
		},
	},
	mounted() {
		this.positionInMiddle()
		/** Interval EVERY FRAME
		 * 16 -> 60 fps
		 */
		setInterval(this.everyFrame, 16)
	},
})

function smooth(n: number, goal: number, p: number) {
	const delayedNum = roundNumber(lerp(n, goal, p), 2) || 0
	return Math.abs(delayedNum) > 0.2 ? delayedNum : 0
}
</script>

<style lang="scss" scoped>
@import '@carbon/colors/scss/colors';
@import '@carbon/layout/scss/layout';
@import '../styles/mixins';

.player {
	$width: $layout-03;
	$height: $layout-04;
	position: fixed;
	// left: calc(50% - #{$layout-03}/ 2);
	// top: calc(50% - #{$layout-04}/ 2);
	top: -$height / 2;
	left: -$width / 2;
	width: $width;
	height: $height;
	background: $white-0;
	clip-path: polygon(50% 0%, 0% 100%, 100% 100%);
	transform: translateX(var(--x)) translateY(var(--y)) rotate(var(--angle, 0));
}

.log {
	position: fixed;
	top: 48px + 20px;
	left: 20px;
	height: 100px;
}

.goal-ball {
	position: fixed;
	z-index: 1000;
	top: -5px;
	left: -5px;
	width: 10px;
	height: 10px;
	border-radius: 50%;
	transform: translate(var(--x, 0), var(--y, 0));

	&.input {
		background: red;
	}
	&.goal {
		background: greenyellow;
	}
}
</style>

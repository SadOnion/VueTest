<template>
	<div
		class="labyrinth-generator"
		:class="{ grabbing: resizing || selecting }"
	>
		<div ref="board" class="board">
			<div v-for="(row, x) in fields" :key="x" class="field-row">
				<div
					v-for="(field, y) in row"
					:key="y"
					class="field"
					:class="{
						'wall-top': field.walls.has(0),
						'wall-right': field.walls.has(1),
						'wall-bottom': field.walls.has(2),
						'wall-left': field.walls.has(3),
					}"
					@mousedown.prevent="selectStart(x, y)"
					@mouseenter="selectDrag(x, y)"
				>
					<i></i>
					<i></i>
					<i></i>
					<i></i>
					<div class="y-info" v-if="x === 0">
						<span>
							{{ y }}
						</span>
					</div>
					<div class="x-info" v-if="y === 0">
						<span>
							{{ x }}
						</span>
					</div>
				</div>
			</div>
			<div class="resize" @mousedown.prevent="resizeDrag">
				<svg
					id="icon"
					xmlns="http://www.w3.org/2000/svg"
					viewBox="0 0 32 32"
				>
					<polygon
						points="25 11 23.59 12.41 26.17 15 17 15 17 5.83 19.59 8.41 21 7 16 2 11 7 12.41 8.41 15 5.83 15 15 5.83 15 8.41 12.41 7 11 2 16 7 21 8.41 19.59 5.83 17 15 17 15 26.17 12.41 23.59 11 25 16 30 21 25 19.59 23.59 17 26.17 17 17 26.17 17 23.59 19.59 25 21 30 16 25 11"
					/>
				</svg>
			</div>
			<transition name="fade" :duration="200">
				<div
					v-if="selecting"
					class="selection"
					:style="{
						'--top': selectCssVars.top,
						'--left': selectCssVars.left,
						'--width': selectCssVars.width,
						'--height': selectCssVars.height,
					}"
				></div>
			</transition>
		</div>
		<div class="resize-preview-wrapper">
			<div
				class="resize-preview"
				:class="{ resizing }"
				:style="{
					'--resizeX': resizing ? resizeSize[0] : width,
					'--resizeY': resizing ? resizeSize[1] : height,
				}"
			></div>
		</div>
		<GlobalEvents
			v-if="selecting"
			@mouseup="selectEnd"
			@mouseleave="selecting = false"
		/>
		<GlobalEvents
			v-if="resizing"
			@mouseup="resizeDrop"
			@mouseleave="resizing = false"
			@mousemove.prevent="resizeDrag"
		/>
	</div>
</template>

<script lang="ts">
import Vue from 'vue'
// eslint-disable-next-line import/extensions
import { random, wait } from '@/library/utilities.js'
// eslint-disable-next-line import/extensions
import { isInRange } from '@/library/utilities.ts'
import { difference, union } from 'sets'

const encode = (...n: number[]) => n.join(','),
	decode = (code: string): number[] => code.split(',').map(n => parseInt(n))

class Field {
	walls: Set<number>
	isOpen: boolean
	x: number
	y: number
	code: string
	constructor(x: number, y: number, walls: Set<number>) {
		this.walls = new Set([0, 3, ...walls])
		this.isOpen = false
		this.x = x
		this.y = y
		this.code = encode(x, y)
	}
}

export default Vue.extend({
	name: 'LabyrinthGenerator',
	data() {
		return {
			fields: [] as Field[][],
			width: 19,
			height: 12,
			closedSpaces: [] as Set<string>[],
			resizing: false,
			resizeSize: [19, 12] as [number, number],
			selecting: false,
			selectSquare: [
				{ x: 0, y: 0 },
				{ x: 0, y: 0 },
			],
			selectCssVars: {
				top: 0,
				left: 0,
				width: 0,
				height: 0,
			},
		}
	},
	methods: {
		selectStart(x: number, y: number) {
			this.selecting = true
			this.selectSquare[0] = { x, y }
			this.selectSquare[1] = { x, y }

			this.selectSetCss()
		},
		selectEnd() {
			if (!this.selecting) return
			this.selecting = false

			const [
				{ x: startX, y: startY },
				{ x: endX, y: endY },
			] = this.selectSquare

			this.createMaze('square', [startX, startY], [endX, endY])
		},
		selectDrag(x: number, y: number) {
			if (!this.selecting) return
			const { selectSquare } = this
			selectSquare[1] = { x, y }

			this.selectSetCss()
		},
		selectSetCss() {
			const { selectSquare } = this,
				{ abs, min } = Math,
				width = abs(selectSquare[1].x - selectSquare[0].x) + 1,
				height = abs(selectSquare[1].y - selectSquare[0].y) + 1
			let top = min(selectSquare[0].y, selectSquare[1].y),
				left = min(selectSquare[0].x, selectSquare[1].x)

			top += (height - 1) / 2
			left += (width - 1) / 2

			this.selectCssVars = {
				top,
				left,
				width,
				height,
			}
		},
		resizeDrag(e: MouseEvent) {
			this.resizing = true

			const { x, y } = e,
				{ innerWidth: screenW, innerHeight: screenH } = window,
				fieldSize =
					this.$el.querySelector('.field')?.getBoundingClientRect()
						.width || 40,
				{ max, abs, ceil } = Math,
				correctValue = (val: number) =>
					max(abs(ceil((val * 2 - 8) / fieldSize)), 2)

			const width = correctValue(x - screenW / 2),
				height = correctValue(y - screenH / 2 - 24)

			this.resizeSize = [width, height]
		},
		resizeDrop() {
			this.resizing = false
			;[this.width, this.height] = this.resizeSize
			this.createMaze('extend')
		},
		findClosedSpaces() {
			this.closedSpaces = []
			const { fields } = this
			for (let x = 0; x < fields.length; x++) {
				for (let y = 0; y < fields[x].length; y++) {
					this.checkClosedField(x, y)
				}
			}
		},
		checkClosedField(x: number, y: number) {
			const { fields, closedSpaces } = this,
				field = fields[x][y],
				walls = new Set(field.walls),
				fieldCode = encode(x, y),
				addNewSet = () =>
					closedSpaces.find(set => set.has(fieldCode)) ||
					closedSpaces.push(new Set([fieldCode]))

			if (fields[x + 1]?.[y].walls.has(3)) walls.add(1)
			if (fields[x][y + 1]?.walls.has(0)) walls.add(2)

			const missingWalls = difference([0, 1, 2, 3], walls)

			if (missingWalls.has(0) && missingWalls.has(3)) {
				const toClear = closedSpaces.find(set => set.has(`${x - 1},${y}`)),
					index = closedSpaces.findIndex(set => set.has(`${x},${y - 1}`))

				if (index === -1 || !toClear) return

				closedSpaces[index] = union(closedSpaces[index], toClear).add(
					fieldCode,
				)
				toClear.clear()
			} else if (missingWalls.has(0) || missingWalls.has(3)) {
				if (missingWalls.has(3))
					closedSpaces
						.find(set => set.has(`${x - 1},${y}`))
						?.add(fieldCode)
				else
					closedSpaces
						.find(set => set.has(`${x},${y - 1}`))
						?.add(fieldCode)
			} else addNewSet()
		},
		openClosedSpaces() {
			const { closedSpaces, fields } = this
			closedSpaces.forEach(set => {
				if (set.size === 0) return

				const canBeOpened: number[][] = []

				if (typeof set[Symbol.iterator] !== 'function') return
				;[...set].forEach(code => {
					const [x, y] = decode(code)
					if (fields[x]?.[y - 1] && !set.has(fields[x][y - 1].code)) {
						// TOP
						canBeOpened.push([x, y, 0])
					}
					if (fields[x - 1]?.[y] && !set.has(fields[x - 1][y].code)) {
						// LEFT
						canBeOpened.push([x, y, 3])
					}
					if (fields[x]?.[y + 1] && !set.has(fields[x][y + 1].code)) {
						// BOTTOM
						canBeOpened.push([x, y + 1, 0])
					}
					if (fields[x + 1]?.[y] && !set.has(fields[x + 1][y].code)) {
						// RIGHT
						canBeOpened.push([x + 1, y, 3])
					}
				})

				if (canBeOpened.length === 0) return
				const [x, y, wall] = canBeOpened[
					random(0, canBeOpened.length, 'floor')
				]
				fields[x]?.[y]?.walls.delete(wall)
			})
		},
		drillBoard() {
			const { fields, width, height } = this
			fields.forEach(row => row.forEach(breakWall))

			function breakWall(field: Field) {
				const { x, y } = field,
					walls = new Set(field.walls)

				if (x < width - 1) fields[x]?.[y]?.walls.delete(1)
				if (y < height - 1) fields[x]?.[y]?.walls.delete(2)
				if (field.isOpen) return
				/**
				 * Add information about all the walls surrounding the fiend (not only the top and left ones).
				 * Plus removes walls that make the board border.
				 */
				if (fields[x + 1]?.[y].walls.has(3)) walls.add(1)
				if (fields[x][y + 1]?.walls.has(0)) walls.add(2)
				if (x === 0) walls.delete(3)
				if (y === 0) walls.delete(0)
				if (x === width - 1) walls.delete(1)
				if (y === height - 1) walls.delete(2)

				/**
				 * Deletes random wall from the available set
				 */
				const toDelete = [...walls][random(0, walls.size, 'floor')]

				if ([0, 3].includes(toDelete)) field.walls.delete(toDelete)
				else if (toDelete === 1) fields[x + 1][y].walls.delete(3)
				else if (toDelete === 2) fields[x][y + 1].walls.delete(0)

				field.isOpen = true
			}
		},
		createMaze(
			mode: 'init' | 'extend' | 'square' = 'init',
			start: [number, number] = [0, 0],
			end?: [number, number],
		) {
			const { fields, height, width } = this,
				lastW = fields.length,
				lastH = fields[0]?.length || 0

			if (!end || ['init', 'extend'].includes(mode))
				end = [width - 1, height - 1]
			if (mode === 'init') this.fields = []
			else if (mode === 'extend') {
				if (end[0] < lastW) {
					// eslint-disable-next-line prefer-destructuring
					start[0] = end[0]
					fields.splice(width)
				} else start[0] = lastW
				if (end[1] < lastH) {
					// eslint-disable-next-line prefer-destructuring
					start[1] = end[1]
					fields.forEach(row => row.splice(height))
				} else start[1] = lastH
			} else if (mode === 'square') {
				end[0] = Math.min(end[0], width - 1)
				end[1] = Math.min(end[1], height - 1)
			}
			/**
			 * Fill the board with initial fields
			 */
			for (let x = 0; x < width; x++) {
				const row: Field[] = mode === 'init' ? [] : fields[x] || []

				for (let y = 0; y < height; y++) {
					if (
						mode === 'init' ||
						(mode === 'square' &&
							isInRange(x, start[0], end[0]) &&
							isInRange(y, start[1], end[1])) ||
						(mode === 'extend' &&
							(isInRange(x, start[0], end[0]) ||
								isInRange(y, start[1], end[1])))
					) {
						// For each field:
						const walls = new Set([0, 3])
						x === width - 1 && walls.add(1)
						y === height - 1 && walls.add(2)

						row.splice(y, 1, new Field(x, y, walls))
					}
				}

				this.fields.splice(x, 1, row)
			}

			this.drillBoard()

			let nClosedSpaces = 0
			while (nClosedSpaces !== 1) {
				/**
				 * Find closed spaces
				 */
				this.findClosedSpaces()

				/**
				 * Open Closed Spaces
				 */
				this.openClosedSpaces()

				nClosedSpaces = this.closedSpaces.reduce(
					(n, set) => (set.size > 0 ? n + 1 : n),
					0,
				)
			}
		},
	},
	created() {
		this.createMaze()
	},
})
</script>

<style lang="scss" scoped>
@import '@carbon/colors/scss/colors';
@import '@carbon/layout/scss/layout';
@import '../styles/mixins';

$field-size: 4vmin;
$wall-width: 1px;

.labyrinth-generator {
	@include full-view-page;
	display: flex;
	flex-direction: column;
	justify-content: center;
	align-items: center;
	&.grabbing {
		cursor: grabbing;
		.field,
		.resize {
			cursor: grabbing;
		}
	}
}

.board {
	position: relative;
	display: flex;
	align-items: flex-start;
	cursor: pointer;
}

.field {
	position: relative;
	width: $field-size;
	height: $field-size;
	background: $gray-90;

	i {
		position: absolute;
		background: $white-0;
		opacity: 0;
		&:nth-of-type(1),
		&:nth-of-type(3) {
			left: -$wall-width/2;
			height: $wall-width;
			width: calc(100% + #{$wall-width});
		}
		&:nth-of-type(2),
		&:nth-of-type(4) {
			top: -$wall-width/2;
			width: $wall-width;
			height: calc(100% + #{$wall-width});
		}
		&:nth-of-type(1) {
			top: -$wall-width / 2;
		}
		&:nth-of-type(2) {
			right: -$wall-width / 2;
		}
		&:nth-of-type(3) {
			bottom: -$wall-width / 2;
		}
		&:nth-of-type(4) {
			left: -$wall-width / 2;
		}
	}
	&.wall {
		&-top i:nth-of-type(1) {
			opacity: 1;
		}
		&-right i:nth-of-type(2) {
			opacity: 1;
		}
		&-bottom i:nth-of-type(3) {
			opacity: 1;
		}
		&-left i:nth-of-type(4) {
			opacity: 1;
		}
	}

	.y-info {
		position: absolute;
		right: 100%;
		margin-right: $spacing-05;
		height: 100%;
		display: flex;
		align-items: center;
		user-select: none;
	}
	.x-info {
		position: absolute;
		bottom: 100%;
		margin-bottom: $spacing-05;
		width: 100%;
		display: flex;
		justify-content: center;
		user-select: none;
	}
}

.resize {
	$size: $layout-03;
	position: absolute;
	width: $size;
	height: $size;
	left: calc(100% - #{$size}/ 2);
	top: calc(100% - #{$size}/ 2);
	background: $blue-60;
	// border-radius: 50%;
	cursor: grab;
	display: flex;

	svg {
		margin: auto;
		width: $layout-02;
		fill: $white-0;
	}

	transition: transform 0.2s ease-out;
	&:hover {
		transition: transform 0.1s;
		transform: scale(1.2);
	}
}

.resize-preview {
	&-wrapper {
		position: fixed;
		pointer-events: none;
		top: 0;
		padding-top: 48px;
		left: 0;
		width: 100%;
		height: 100%;
		display: flex;
	}
	margin: auto;
	background-color: $blue-50;
	opacity: 0;
	// top: -$wall-width;
	// left: 0;
	width: calc(var(--resizeX, 0) * #{$field-size});
	height: calc(var(--resizeY, 0) * #{$field-size} + #{$wall-width});

	transition: opacity 0.2s, width 0.5s, height 0.5s;
	&.resizing {
		transition: opacity 0.2s, width 0.1s, height 0.1s;
		opacity: 0.6;
	}
}

.selection {
	pointer-events: none;
	position: absolute;
	top: 0;
	left: 0;
	transform: translate(
			calc(var(--left, 0) * #{$field-size}),
			calc(var(--top, 0) * #{$field-size})
		)
		scaleX(var(--width, 0)) scaleY(var(--height, 0));
	width: $field-size;
	height: $field-size;
	// top: calc(var(--top, 0) * #{$field-size});
	// left: calc(var(--left, 0) * #{$field-size});
	// width: calc(var(--width, 0) * #{$field-size});
	// height: calc(var(--height, 0) * #{$field-size});
	background: $yellow-50;
	opacity: 0.6;
	transition: transform 0.1s;
}

.fade-enter-active,
.fade-leave-active {
	transition: transform 0.1s, opacity 0.2s;
}
.fade-enter,
.fade-leave-to {
	opacity: 0;
}
</style>

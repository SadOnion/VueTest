<template>
	<div class="labyrinth-generator">
		<div class="board">
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

						'closed-top': field.closed.has(0),
						'closed-right': field.closed.has(1),
						'closed-bottom': field.closed.has(2),
						'closed-left': field.closed.has(3),

						'safe-top': field.safe.has(0),
						'safe-right': field.safe.has(1),
						'safe-bottom': field.safe.has(2),
						'safe-left': field.safe.has(3),

						yellow: field.selected,
						red: field.isClosed,
					}"
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
		</div>
	</div>
</template>

<script lang="ts">
import Vue from 'vue'
import { random, wait } from '@/library/utilities'
import { difference, union } from 'sets'

const encode = (...n: number[]) => n.join(','),
	decode = (code: string): number[] => code.split(',').map(n => parseInt(n))

class Field {
	walls: Set<number>
	safe: Set<number>
	closed: Set<number>
	selected: boolean
	isClosed: boolean
	x: number
	y: number
	code: string
	constructor(x: number, y: number, walls: Set<number>) {
		this.walls = walls
		this.safe = new Set()
		this.closed = new Set()
		this.selected = false
		this.isClosed = false
		this.x = x
		this.y = y
		this.code = encode(x, y)
	}
}

type FieldRow = Field[]

export default Vue.extend({
	name: 'LabyrinthGenerator',
	data() {
		return {
			fields: [] as FieldRow[],
			width: 23,
			height: 15,
			closedSpaces: [] as Set<string>[],
		}
	},
	methods: {
		markWall(x: number, y: number, wall: number, mark: 'safe' | 'closed') {
			this.fields[x]?.[y]?.[mark].add(wall)
		},
		markWallCode(code: string, mark: 'safe' | 'closed') {
			const [x, y, wall] = decode(code)
			this.fields[x]?.[y]?.[mark].add(wall)
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
	},
	created() {
		/**
		 * Fill the board with initial fields
		 */
		const nextLeft = new Set(),
			nextTop = new Set()
		for (let x = 0; x < this.width; x++) {
			const row: FieldRow = []

			for (let y = 0; y < this.height; y++) {
				// For each field:
				const walls = new Set([0, 3])
				x === this.width - 1 && walls.add(1)
				y === this.height - 1 && walls.add(2)

				const breakable = new Set([0, 1, 2, 3])
				if (x === 0) breakable.delete(3)
				if (x === this.width - 1) breakable.delete(1)
				if (y === 0) breakable.delete(0)
				if (y === this.height - 1) breakable.delete(2)

				const coords = [x, y].join(',')

				if (nextLeft.has(coords) && breakable.has(3)) {
					walls.delete(3)
					nextLeft.delete(coords)
				}
				if (nextTop.has(coords) && breakable.has(0)) {
					walls.delete(0)
					nextTop.delete(coords)
				}

				const toDelete = [...breakable][
					random(0, [...breakable].length, 'floor')
				]

				if (toDelete === 1) nextLeft.add([x + 1, y].join(','))
				else if (toDelete === 2) nextTop.add([x, y + 1].join(','))
				else walls.delete(toDelete)

				row.push(new Field(x, y, walls))
			}

			this.fields.push(row)
		}

		let nClosedSpaces = 0
		while (nClosedSpaces !== 1) {
			nClosedSpaces = 0
			// await wait(1000)
			/**
			 * Find closed spaces
			 */
			this.findClosedSpaces()

			/**
			 * Open Closed Spaces
			 */
			this.openClosedSpaces()

			this.closedSpaces.forEach(set => {
				if (set.size > 0) nClosedSpaces++
			})
		}
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
	justify-content: center;
	align-items: center;
}
.board {
	display: flex;
	align-items: flex-start;
}
.field {
	position: relative;
	width: $field-size;
	height: $field-size;
	background: $gray-90;

	&.yellow {
		background: $yellow-50;
	}
	&.red {
		background: $red-90;
	}

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
	&.closed {
		&-top i:nth-of-type(1) {
			background: $red-50;
		}
		&-right i:nth-of-type(2) {
			background: $red-50;
		}
		&-bottom i:nth-of-type(3) {
			background: $red-50;
		}
		&-left i:nth-of-type(4) {
			background: $red-50;
		}
	}
	&.safe {
		&-top i:nth-of-type(1) {
			background: $green-50;
		}
		&-right i:nth-of-type(2) {
			background: $green-50;
		}
		&-bottom i:nth-of-type(3) {
			background: $green-50;
		}
		&-left i:nth-of-type(4) {
			background: $green-50;
		}
	}

	.y-info {
		position: absolute;
		right: 100%;
		margin-right: $spacing-05;
		height: 100%;
		display: flex;
		align-items: center;
	}
	.x-info {
		position: absolute;
		bottom: 100%;
		margin-bottom: $spacing-05;
		width: 100%;
		display: flex;
		justify-content: center;
	}
}
</style>

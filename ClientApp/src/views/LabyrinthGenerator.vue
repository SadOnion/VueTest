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
					@mouseenter="hover(x, y)"
					@mouseleave="stopHover(x, y)"
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

interface Field {
	walls: Set<number>
	safe: Set<number>
	closed: Set<number>
	selected: boolean
	isClosed: boolean
	[key: string]: unknown
}
type FieldRow = Field[]

const wallCode = (x: number, y: number, wall: 0 | 3): string =>
	[x, y, wall].join(',')

export default Vue.extend({
	name: 'LabyrinthGenerator',
	data() {
		return {
			fields: [] as FieldRow[],
			width: 12,
			height: 7,
			closedGroups: [] as Set<string>[],
		}
	},
	methods: {
		hover(x: number, y: number) {
			const hoveredSet = this.closedGroups.find(set => set.has(`${x},${y}`))
			if (!hoveredSet) return
			;[...hoveredSet].forEach(code => {
				const [a, b] = code.split(',').map(text => parseInt(text)),
					field = this.fields[a]?.[b]

				if (field) field.selected = true
			})
		},
		stopHover(x: number, y: number) {
			const hoveredSet = this.closedGroups.find(set => set.has(`${x},${y}`))
			if (!hoveredSet) return
			;[...hoveredSet].forEach(code => {
				const [a, b] = code.split(',').map(text => parseInt(text)),
					field = this.fields[a]?.[b]

				if (field) field.selected = false
			})
		},
		markWall(x: number, y: number, wall: number, mark: 'safe' | 'closed') {
			this.fields[x]?.[y]?.[mark].add(wall)
		},
		markWallCode(code: string, mark: 'safe' | 'closed') {
			const [x, y, wall] = code.split(',').map(item => parseInt(item, 10))
			this.fields[x]?.[y]?.[mark].add(wall)
		},
		async followTheLine(
			startX: number,
			startY: number,
			allSeenWalls: Set<string>,
		) {
			const { fields } = this

			if (fields[startX][startY].isClosed) return

			const path: Set<string> = new Set(),
				filedPath: number[][] = []

			let wallType: 'v' | 'h' = 'v',
				condition = true,
				[x, y] = [startX, startY]

			while (condition) {
				console.log(x, y)
				filedPath.push([x, y])

				// has wall on the right?
				if (fields[x + 1]?.[y]?.walls.has(3)) {
					const code = wallCode(x + 1, y, 3)
					if (!allSeenWalls.has(code)) {
						// Starting field has wall on the right
						path.add(code)
						allSeenWalls.add(code)

						// if LINE goes to the left
						// if ()
						// if LINE goes to the bottom
						// if LINE goes to the right
					}
				}

				// has wall on the bottom?
				else if (fields[x]?.[y + 1]?.walls.has(0)) {
					const code = wallCode(x, y + 1, 0)
					if (!allSeenWalls.has(code)) {
						path.add(code)
						allSeenWalls.add(code)
						wallType = 'h'
					}
				} else return
				;[x, y] = wallType === 'v' ? [x, y + 1] : [x - 1, y]

				if (
					[undefined, true].includes(fields[x]?.[y]?.isClosed) &&
					[undefined, true].includes(
						fields[startX]?.[startY - 1]?.isClosed,
					)
				) {
					// WE GOT CLOSED SPACE:
					condition = false
					filedPath.forEach(([a, b]) => {
						fields[a][b].isClosed = true
					})
					;[...path].forEach(code => this.markWallCode(code, 'closed'))
				}
				if (x < 0 || x > this.width - 1 || y < 0 || y > this.height - 1)
					return
			}
		},
		checkClosedField(x: number, y: number) {
			const { fields, closedGroups } = this,
				field = fields[x][y],
				walls = new Set(field.walls),
				fieldCode = `${x},${y}`,
				addNewSet = () =>
					closedGroups.find(set => set.has(`${x},${y}`)) ||
					closedGroups.push(new Set([fieldCode]))

			if (fields[x + 1]?.[y].walls.has(3)) walls.add(1)
			if (fields[x][y + 1]?.walls.has(0)) walls.add(2)

			const missingWalls = difference([0, 1, 2, 3], walls)

			if (missingWalls.has(0) && missingWalls.has(3)) {
				const toClear = closedGroups.find(set => set.has(`${x - 1},${y}`)),
					index = closedGroups.findIndex(set => set.has(`${x},${y - 1}`))

				if (index === -1 || !toClear) return

				closedGroups[index] = union(closedGroups[index], toClear).add(
					fieldCode,
				)
				toClear.clear()
			} else if (missingWalls.has(0) || missingWalls.has(3)) {
				if (missingWalls.has(3))
					closedGroups
						.find(set => set.has(`${x - 1},${y}`))
						?.add(fieldCode)
				else
					closedGroups
						.find(set => set.has(`${x},${y - 1}`))
						?.add(fieldCode)
			} else addNewSet()
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

				row.push({
					walls,
					safe: new Set(),
					closed: new Set(),
					selected: false,
					isClosed: false,
				})
			}

			this.fields.push(row)
		}

		/**
		 * Find closed spaces
		 */
		const { fields } = this
		for (let x = 0; x < fields.length; x++) {
			for (let y = 0; y < fields[x].length; y++) {
				this.checkClosedField(x, y)
			}
		}
	},
})
</script>

<style lang="scss" scoped>
@import '@carbon/colors/scss/colors';
@import '@carbon/layout/scss/layout';
@import '../styles/mixins';

$field-size: 6vmin;
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

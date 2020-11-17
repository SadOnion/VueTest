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
import { random } from '@/library/utilities'

interface Field {
	walls: Set<number>
	[key: string]: unknown
}
type FieldRow = Field[]

export default Vue.extend({
	name: 'LabyrinthGenerator',
	data() {
		return {
			fields: [] as FieldRow[],
			width: 12,
			height: 7,
		}
	},
	created() {
		// Fill the board with initial fields
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

				walls.delete(
					[...breakable][random(0, [...breakable].length, 'floor')],
				)

				row.push({
					walls,
				})
			}

			this.fields.push(row)
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
.field-row {
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
			left: 0;
			height: $wall-width;
			width: 100%;
		}
		&:nth-of-type(2),
		&:nth-of-type(4) {
			top: 0;
			width: $wall-width;
			height: 100%;
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

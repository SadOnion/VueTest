<template>
	<div class="labyrinth-generator">
		<div class="board">
			<div v-for="(row, x) in fields" :key="x" class="field-row">
				<div
					v-for="(field, y) in row"
					:key="y"
					class="field"
					:class="{
						'wall-top': field.walls.includes(0),
						'wall-right': field.walls.includes(1),
						'wall-bottom': field.walls.includes(2),
						'wall-left': field.walls.includes(3),
					}"
				>
					<i></i>
					<i></i>
					<i></i>
					<i></i>
				</div>
			</div>
		</div>
	</div>
</template>

<script lang="ts">
import Vue from 'vue'
import { random } from '@/library/utilities'

interface Field {
	walls: number[]
	[key: string]: unknown
}
type FieldRow = Field[]

export default Vue.extend({
	name: 'LabyrinthGenerator',
	data() {
		return {
			fields: [] as FieldRow[],
			width: 11,
			height: 6,
		}
	},
	created() {
		for (let x = 0; x < this.width; x++) {
			const row: FieldRow = []

			for (let y = 0; y < this.height; y++) {
				const walls = [0, 1, 2, 3]
				walls.splice(random(0, 3), 1)
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
}
</style>

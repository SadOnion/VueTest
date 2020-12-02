export function validateEmail(email: string): boolean {
	const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
	return re.test(String(email).toLowerCase())
}

export function camelToLabel(string: string): string {
	const search = string.match(/([A-Z][a-z]+|[A-Z]|[a-z]+)/g)
	if (search === null) return string
	let newString = search.join(' ')
	newString = newString[0].toUpperCase() + newString.slice(1).toLowerCase()

	return newString
}

export const isInRange = (n: number, min: number, max: number, exc = false) => {
	if (min > max) {
		const tmpMin = min
		min = max
		max = tmpMin
	}
	return exc ? n > min && n < max : n >= min && n <= max
}

// Linear Interpolation Function:
// by using it, circle will move % of distance to cursor every frame
// higher distance -> higher speed
// lower distance -> lower speed
export const lerp = (current: number, goal: number, p: number): number =>
	(1 - p) * current + p * goal

export const clamp = (value: number, min: number, max: number) =>
	Math.min(Math.max(value, min), max)

export const radToDeg = (rad: number) => rad * (180 / Math.PI)

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

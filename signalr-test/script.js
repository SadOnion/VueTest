const connection = new signalR.HubConnectionBuilder()
	.withUrl('http://localhost:5000/net')
	.build()

connection.on('messageReceived', message => {
	console.log(message)
})

connection.start().catch(console.error)

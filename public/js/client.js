var client = {
	server: document.domain,
	status: {
		connection: false,
		pastDisconnect: false
	},
	focusedChannel: "",
	channels: [],
	nickname: "" // TEMP: For testing
}

if (typeof String.prototype.startsWith != 'function') { // Thanks to http://stackoverflow.com/a/646643/2152712
	String.prototype.startsWith = function (str) {
		return this.indexOf(str) == 0;
	};
}

var socket = io.connect('http://' + client.server + ':4848', {
	'reconnect': true,
	'reconnection delay': 500
});

/**
 * Socket.io ON list
 *	connect
 *	disconnect
 *	recieveMessage
 *		[to, from, message]
 *		Recieve a message from IRC.
 *
 * Socket.io EMIT list
 *  sendMessage
 *		[channel, message]
 *		Sends a message to a channel.
 *  sendCommand
 *		{type, content}
 * 		Send a command.
 * 
**/

socket.on('connect', function () {
	client.status.connection = true;

	$('#connectionStatus')
		.css('background-color', '#4eaa46')
		.html("Connected");

	console.log("Connected to backend.");
});

socket.on('disconnect', function () {
	client.status.connection = false;
	client.status.pastDisconnect = true;
	
	$('#connectionStatus')
		.css('background-color', '#c83c3c')
		.html("Disconnected");

	console.warn("Lost connection to backend.");
});

// IRC
socket.on('ircInfo', function (data) {
	client.channels = data.channels;
	client.nickname = data.nickname;
});

socket.on('recieveMessage', function (data) {
	// TODO: Redo how the timestamps works. It's pretty bad at the moment.
	var _now = new Date();
	$('#consoleOutput').append('<article class="consoleMessage" data-channel"' + data[0] + '"><aside><time>[' + _now.getHours() + ':' + _now.getMinutes() + ':'+ _now.getSeconds() + ']</time><span>' + data[1] + '</span></aside><p>' + data[2] + '</p></article>');
});

var irc = {
	sendMessage: function (data) {
		if (data === '') {
			return;
		} else if (!data.startsWith("/")) {
			// It's not a command.
			socket.emit('sendMessage', [client.focusedChannel, data]);
			// HTML to plaintext... kinda.
			var message = data
				.replace(/&/g, "&amp;")
				.replace(/"/g, '&quot;')
				.replace(/'/g, "&apos;")
				.replace(/</g, "&lt;")
				.replace(/>/g, "&gt;"),
				now = new Date();
			// Display it in the console.
			$('#consoleOutput').append('<article class="' + "consoleMessage channel-" + client.focusedChannel.substring(2).toLowerCase() + '"><aside><time>[' + now.getHours() + ':' + now.getMinutes() + ':'+ now.getSeconds() + ']</time><span class="nickname">' + client.nickname + '</span></aside><p class="kitten">' + message + '</p></article>');
		} else {
			// It's a command.
			data = data.substring(1, data.length);
			message = data.split(" ")[1];

			var command = data.split(" ")[0],
				commandList = ['me', 'join', 'part', 'whois'],
				commandFound = false;

			// Check to see if the command is in commandList.
			for (i = 0; i < commandList.length && !commandFound; i++) {
				if (commandList[i] == command) {
					commandFound = true;
				}
			}

			// It's not a command.
			if (!commandFound) {
				alert('Invalid comamnd.');
				return;
			}

			// It is a command so lets run it!
			switch (command) {
				case "me":
					socket.emit('sendCommand', {type: "me", content: message});
					break;
				case "join":
					// Parse the message to support joining multiple channels at once.
					var _channels = message.split(" ");
					for (i = 0; i < _channels.length; i++) {
						socket.emit('sendCommand', {type: "join", content: _channels[i]});
					}
					break;
				case "part":
					// Parse the message to support parting multiple channels at once.
					var _channels = message.split(" ");
					for (i = 0; i < _channels.length; i++) {
						socket.emit('sendCommand', {type: "part", content: _channels[i]});
					}
					break;
			}
		}

		$('#consoleInput input')[0].value = "";
	}
}

// Press enter in chat box
$('#consoleInput').keyup(function (e) {
	if (e.keyCode == 13) {
		irc.sendMessage($('#consoleInput input')[0].value);
	}
});

$('#consoleInput button').click(function () {
	irc.sendMessage($('#consoleInput input')[0].value);
});
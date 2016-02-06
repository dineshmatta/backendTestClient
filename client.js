
codeTest = {
	config: {
		server: '127.0.0.1:8091'
	},
	nickName: 'person1',
	channel: 'defaultChannel',
	client: null	
};

jQuery(document).ready(init);


function init() {
	jQuery('#sendMsg').on(
		'click',
		function() {
			sendMsg(jQuery('#message').val());
		}
	);
	jQuery('#setNick').on(
		'click',
		setNick
	);
	jQuery('#joinChannel').on(
		'click',
		joinChannel
	);
	jQuery('#connect').on(
		'click',
		function(e) {
			if (typeof codeTest.client !== null) {
				delete codeTest.client;
			}
			codeTest.config.server = jQuery('#serverUrl').val();
			codeTest.client = setupSocket();
		}
	);
	drawMessage({ author:'system', channel: codeTest.channel, text: 'welcome to the test', timestamp: new Date().toLocaleTimeString() });
};


function joinChannel() {
	var channel = jQuery('#channel').val();
	jQuery('#messages').empty();codeTest.channel = channel;
	drawMessage({ author:'system', channel: codeTest.channel, text: 'welcome to a new channel (' + channel + '), ' + codeTest.nickName, timestamp: new Date().toLocaleTimeString() });
	if(codeTest.client && codeTest.client.id){
		send2server('Top10Msg', {text: ''});
	}
	return codeTest.channel;
};


function setNick() {
	var nick = jQuery('#nickname').val();
	codeTest.nickName = nick;
	drawMessage({ author:'system', channel: codeTest.channel, text: 'greetings, ' + nick + '!', timestamp: new Date().toLocaleTimeString() });
	return codeTest.nickName;
};


function sendMsg(text) {
	var data = {
		author: codeTest.nickName,
		channel: codeTest.channel,
		text: text
	};
	//drawMessage({ author:'YOU', channel: data.channel, text: data.text, timestamp: new Date().toLocaleTimeString() });
	return send2server('msg', data);
};


function send2server(command, data) {
	return codeTest.client.send(
		{
			command:command,
			data: [
				{
					author: codeTest.nickName,
					channel: codeTest.channel,
					text: data.text,
					timestamp: new Date().toLocaleTimeString()
				}
			]
		}
	);
};


function handleMessageFromServer(msg) {
	if (typeof msg.action.command !== 'undefined' && typeof msg.action.data !== 'undefined') {
		if (msg.action.command === 'messages' || msg.action.command === 'msg') {
			for (var n=0; n<msg.action.data.length; n+=1) {
				if(msg.action.data[n].channel === codeTest.channel && codeTest.client.id === msg.id){
					drawMessage(msg.action.data[n]);
				}
			}
		}
	}
};


function drawMessage(data) {
	data.timestamp = data.timestamp || new Date().toLocaleTimeString();
	var msgString = '<span>{' + data.channel + '@' + data.timestamp + '} [' + data.author + '] ' + data.text + '</span><br/>';
	jQuery('#messages').append(msgString);
};


function setupSocket() {
	try {
		var testSocket = new Socket(codeTest.config.server, { autoReconnect: true });
		testSocket.on('reconnect', function(msg, e) {
			console.log('reconnected');
		});
		testSocket.on('close', function(e) {
			console.log('[close]');
			jQuery('#wsstatus').text(Date.now() + ' connection closed');
		});
		testSocket.on('error', function(e) {
			console.log('[error]');
			jQuery('#wsstatus').text(Date.now() + ' connection error');
		});
		testSocket.on('open', function(e) {
			if(codeTest.client.id){
				jQuery('#wsstatus').text(Date.now() + ' connection open');
				console.log('[open]');
				send2server('Top10Msg', {text: ''});
			}
		});
		testSocket.on('message', function(msg, e) {
			console.log('[message]');
			console.log(msg);
			handleMessageFromServer(msg);
		});
		jQuery('#wsstatus').text(Date.now() + ' connecting to [' + codeTest.config.server + ']');
	} catch(err) {
		jQuery('#wsstatus').text(Date.now() + ' connection failed: ' + err);
	}
	return testSocket;
};


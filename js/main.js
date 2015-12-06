
var SAAgent = null;
var SASocket = null;
var CHANNELID = 123;
var CHANNELID2 = 456;
var ProviderAppName = "PulsometerProvider";
var time = 0;

function createHTML(log_string)
{
	var log = document.getElementById('resultBoard');
	log.innerHTML = log.innerHTML + "<br> : " + log_string;
}

function onerror(err) {
	console.log("err [" + err + "]");
	createHTML(err);
}

var agentCallback = {
	onconnect : function(socket) {
		SASocket = socket;
		alert("Connection established");
		createHTML("startConnection");
		SASocket.setSocketStatusListener(function(reason){
			console.log("Service connection lost, Reason : [" + reason + "]");
			disconnect();
		});
	},
	onerror : onerror
};

var peerAgentFindCallback = {
	onpeeragentfound : function(peerAgent) {
		try {
			if (peerAgent.appName == ProviderAppName) {
				SAAgent.setServiceConnectionListener(agentCallback);
				SAAgent.requestServiceConnection(peerAgent);
			} else {
				alert("Not expected app!! : " + peerAgent.appName);
			}
		} catch(err) {
			console.log("exception [" + err.name + "] msg[" + err.message + "]");
		}
	},
	onerror : onerror
}

function onsuccess(agents) {
	try {
		if (agents.length > 0) {
			SAAgent = agents[0];
			
			SAAgent.setPeerAgentFindListener(peerAgentFindCallback);
			SAAgent.findPeerAgents();
		} else {
			alert("Not found SAAgent!!");
		}
	} catch(err) {
		console.log("exception [" + err.name + "] msg[" + err.message + "]");
	}
}

function connect() {
	if (SASocket) {
		alert('Already connected!');
        return false;
    }
	try {		
		webapis.sa.requestSAAgent(onsuccess, function (err) {
			console.log("err [" + err.name + "] msg[" + err.message + "]");
		});
		webapis.motion.start("HRM", onchangedCB);
		webapis.motion.start("PEDOMETER", onchangedP, onerror);				
	} catch(err) {
		console.log("exception [" + err.name + "] msg[" + err.message + "]");	
		createHTML();
	}
}

function disconnect() {
	try {
		if (SASocket != null) {
			SASocket.close();
			SASocket = null;
			createHTML("closeConnection");
		}
		webapis.motion.stop("HRM");
		webapis.motion.stop("PEDOMETER");
	} catch(err) {
		console.log("exception [" + err.name + "] msg[" + err.message + "]");
	}
}

function onreceive(channelId, data) {
	createHTML(data);
}

function onchangedP(pedometerInfo)
{
	SASocket.sendData(CHANNELID, "P " + pedometerInfo.cumulativeTotalStepCount);
	createHTML(pedometerInfo.cumulativeTotalStepCount);
}

function onchangedCB(hrmInfo)
{
   //console.log("Heart Rate: " + hrmInfo.heartRate);
   //console.log("Peak-to-peak interval: " + hrmInfo.rRInterval + " milliseconds");
	if(hrmInfo.heartRate > 0 && time > 500) {
		SASocket.sendData(CHANNELID, "H " + hrmInfo.heartRate);
		time = 0;
	}
	else if (hrmInfo.heartRate > 0 && time <= 500) {
		time += hrmInfo.rRInterval;
	}
   //alert("Heart Rate: " + hrmInfo.heartRate);
}

function fetch() {
	try {
		SASocket.setDataReceiveListener(onreceive);
		SASocket.sendData(CHANNELID, "Hello Accessory!");		
	} catch(err) {
		console.log("exception [" + err.name + "] msg[" + err.message + "]");
	}
}

window.onload = function () {
    // add eventListener for tizenhwkey
    document.addEventListener('tizenhwkey', function(e) {
        if(e.keyName == "back") {
        	webapis.motion.stop("HRM");
        	webapis.motion.stop("PEDOMETER");
            tizen.application.getCurrentApplication().exit();
        }
    });
};

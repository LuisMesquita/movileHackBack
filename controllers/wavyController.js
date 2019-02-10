var exports = module.exports = {}
var request = require('request')

const accessKey1 = "ak-52874521"
const accessKey2 = "ak-7744112325"

//Função responsável em se conectar com a api da wavy e enviar uma sms para "phoneTo" no formato 5588999999999
// e uma "message" de até 160 caracteres
exports.sendMessage = function(phoneTo, message) {	
	var headers = {
	    'Access-key': accessKey1,	    
	}

	// Configure the request
	var options = {
	    url: 'http://messaging-api.wavy.global:8080/v1/sms/send',
	    method: 'POST',
	    headers: headers,
	    body: {
	    	to: phoneTo,
    		message: message
	    },
	    json: true
	}

	// Start the request
	request(options, function (error, response, body) {
	    if(error)
	    	throw new Error(error)
	})
}

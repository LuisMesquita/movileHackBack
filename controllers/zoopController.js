var exports = module.exports = {}

//Credentias de autorização da Zoop
const marketplace_id = "3249465a7753536b62545a6a684b0000"
const chavePublica = "zpk_test_EzCkzFFKibGQU6HFq7EYVuxI"

//Ids mockados do comprador e do vendedor
const sellerId = "2aba9b4af8544dbead2c524e50f27cd7"
const buyerId = "fa18bdd6a789400aaaf28c06bf408f7b"

var request = require("request");
	
//Função responsável em conectar com a api da Zoop, e pegar o balanço do vendedor
exports.getSellerBalance = async function(seller) {
	var options = { 
		method: 'GET',
	  	url: 'https://api.zoop.ws/v1/marketplaces/'+marketplace_id+'/sellers/'+sellerId+'/balances',
	  	auth: {
	  		user: chavePublica,
	  		password: ''
	  	},
	  	json: true
	};

	return new Promise(function(resolve, reject){
		request(options, function (error, response, body) {
		  	if (error) throw new Error(error);
		  	
		  	if (!body.items.account_balance)
				resolve(0)

		  	resolve((body.items.account_balance/100).toFixed(2))
		});
	})
	
}

//Função responsável em conectar com a api da Zoop, e pegar o historico do vendedor
exports.getSellerHistory = async function(seller) {
	var options = { 
		method: 'GET',
	  	url: 'https://api.zoop.ws/v1/marketplaces/'+marketplace_id+'/sellers/'+sellerId+'/transactions',
	  	auth: {
	  		user: chavePublica,
	  		password: ''
	  	},
	  	json: true
	};

	return new Promise(function(resolve, reject){
		request(options, function (error, response, body) {
		  	if (error) throw new Error(error);

		  	var length = body.items.length
		  	var items = body.items.slice(length - 4,length)
		  	var history = []

		  	for (var i = 0; i < items.length; i++) {

		  		//coloca a data no forma YYYY/MM/DD HH/MM/SS
		  		var date = new Date(items[i].created_at).toISOString().
		  		  replace(/T/, ' '). 
		  		  replace(/\..+/, '').
		  		  split(' ')

		  		//transforma de YYYY/MM/DD para DD/MM/YYYY
		  		var splitedDate = date[0].split('-')
		  		splitedDate = splitedDate[2]+'/'+splitedDate[1]+'/'+splitedDate[0]

		  		var item = i+'. Recebeu R$'+items[i].amount.replace('.', ',')+' no dia '+splitedDate+' às '+date[1]
		  		history.push(item)
		  	}
		  	resolve(history)
		});
	})
	
}

//Função responsável em conectar com a api da Zoop e realizar a transação entre um comprador e um vendedor
// no valor do "amount" em centavos
exports.doTransaction = async function(seller, amount) {
	var options = { 
		method: 'POST',
	  	url: 'https://api.zoop.ws/v1/marketplaces/'+marketplace_id+'/transactions',
	  	auth: {
	  		user: chavePublica,
	  		password: ''
	  	},
	  	json: true,
	  	body: {
	  		payment_type: "credit",
	  		currency: "BRL",
  		  	description: "test 123",
		  	customer: buyerId,
  		  	on_behalf_of: sellerId,
  		  	amount: amount,
  		  	capture: true
	  	}  	
	 };

	return new Promise(function(resolve, reject){
		request(options, function (error, response, body) {
		  if (error) throw new Error(error);

		  resolve(body)
		});
	})
}
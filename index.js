const http = require('http');
const express = require('express');
const bodyParser = require('body-parser');

const wavyController = require('./controllers/wavyController.js')
const zoopController = require('./controllers/zoopController.js')

//Dados mockados
const buyerName = "Pedro"
const sellerName = "Jon"
const testPhone = "5581995213774"

//Configurando o express
const app = express();
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }))

//Rota de pagamento, com vendedor e comprador mockados
app.post('/payment', async (req,res) => {
	const { seller, amount } = req.body	

	try {		
		if(!amount) 
			return res.status(400).send('Bad Request')

		//Realiza transação
		zoopController.doTransaction(seller, amount)		
		
		//Envia mensagem de confirmação para o vendedor
		const messageConfirmation = "Olá "+sellerName+", "+buyerName+" acabou de transferir R$"+amount/100+" para você."
		await wavyController.sendMessage(testPhone, messageConfirmation)

		//Envia mensagem com saldo atual do vendedor
		const balance = await zoopController.getSellerBalance()
		const value = parseFloat(balance+amount).toFixed(2).replace('.', ',')
		const messageBalance = "Seu saldo atual é R$"+value
		wavyController.sendMessage(testPhone, messageBalance)

		return res.send('Transação efetuada')
	} catch(err) {		
		console.log(err)		
		return res.send(err)
	}			
})


//Rota mockada SMS, ela simula o recebimento de sms para iteração vendedor -> serviço
app.post('/sms', async (req, res) => {  
  	try {
	  	var message

	  	if(req.body.body == 'saldo') {  	
	  		var balance = await zoopController.getSellerBalance()	  			  		
	  		message = 'Olá '+sellerName+', seu saldo atual é R$'+parseFloat(balance).toFixed(2);
	  		wavyController.sendMessage(testPhone, message) 

	  	} else if(req.body.body == 'extrato') {
	  		var history =  await zoopController.getSellerHistory()
	  		var quantityMsg = history.length == 0 ? 'sua última transação foi:' : 'suas últimas '+history.length+' transações foram:'

	  		message = 'Olá '+sellerName+', '+quantityMsg;
	  		await wavyController.sendMessage(testPhone, message) 

	  		for (var i = 0; i < history.length; i++) {
	  			await wavyController.sendMessage(testPhone, history[i]) 
	  		}

	  	}
	 	return res.send();
	} catch(err) {		
		return res.send(err)
	}			
});

http.createServer(app).listen(1337, () => {
  console.log('Express server listening on port 1337');
});

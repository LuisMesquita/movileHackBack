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

		zoopController.doTransaction(seller, amount)

		var balance = zoopController.getSellerBalance()
		
		const message = "Olá "+sellerName+", "+buyerName+" acabou de transferir R$"+amount/100+" para você."
		wavyController.sendMessage(testPhone, message)

		return res.send('Transação efetuada')
	} catch(err) {				
		return res.send(err)
	}			
})


//Rota mockada SMS, ela simula o recebimento de sms para iteração vendedor -> serviço
app.post('/sms', async (req, res) => {  
  	try {
	  	var message

	  	if(req.body.body == 'saldo') {  	
	  		var balance = await zoopController.getSellerBalance()	  			  		
	  		message = 'Olá, seu saldo é '+balance;
	  	} else if(req.body.body == 'extrato') {
	  		var history =  await zoopController.getSellerHistory()
	  		message = 'Olá, suas últimas '+history.length+' transações foram: '+ history+'\n';	  		
	  	}
	  	
	  	wavyController.sendMessage(testPhone, message)  
	 	return res.send();
	} catch(err) {		
		return res.send(err)
	}			
});

http.createServer(app).listen(1337, () => {
  console.log('Express server listening on port 1337');
});

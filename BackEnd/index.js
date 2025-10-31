const express = require('express');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3001;

// Middlewares para permitir que o frontend e o backend conversem
app.use(cors());
app.use(express.json());

// Rota de "Health Check" para o Render saber que nosso servidor está vivo.
app.get('/', (req, res) => {
  res.send('🎂 Cozinha da BoloFlix está aberta e funcionando!');
});

// A nossa primeira "rota" ou "endpoint".
// É como o balcão onde a garçonete entrega os pedidos.
app.post('/subscribe', (req, res) => {
  console.log('🎉 Novo pedido de assinatura recebido!');
  console.log('Dados do Pedido:', req.body);
  
  // Por enquanto, apenas confirmamos que recebemos.
  // No futuro, aqui salvaremos os dados no banco de dados.
  res.status(200).json({ message: 'Assinatura recebida com sucesso!' });
});

app.listen(port, () => {
  console.log(`🎂 Servidor da BoloFlix (backend) rodando na porta ${port}`);
});

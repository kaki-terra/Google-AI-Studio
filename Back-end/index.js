const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');

const app = express();
const port = process.env.PORT || 3001;

// --- Conexão com o Supabase ---
// As chaves são pegas das variáveis de ambiente no Render
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("ERRO: Variáveis de ambiente SUPABASE_URL e SUPABASE_KEY são obrigatórias.");
  // process.exit(1); // Em um ambiente real, faríamos o servidor parar.
}

const supabase = createClient(supabaseUrl, supabaseKey);
// -----------------------------


// Middlewares para permitir que o frontend e o backend conversem
app.use(cors());
app.use(express.json());

// Rota de "Health Check" para o Render saber que nosso servidor está vivo.
app.get('/', (req, res) => {
  res.send('🎂 Cozinha da BoloFlix está aberta e funcionando!');
});

// Endpoint para receber e salvar novas assinaturas.
app.post('/subscribe', async (req, res) => {
  console.log('🎉 Novo pedido de assinatura recebido!');
  console.log('Dados do Pedido:', req.body);
  
  const { 
    customerName, 
    planTitle, 
    planPrice, 
    flavorPreference, 
    deliveryDay, 
    deliveryTime 
  } = req.body;

  // Validação básica
  if (!customerName || !planTitle || !planPrice) {
    return res.status(400).json({ message: "Dados incompletos. Nome, plano e preço são obrigatórios." });
  }

  try {
    // Insere os dados na tabela 'subscriptions' do Supabase
    const { data, error } = await supabase
      .from('subscriptions')
      .insert([
        { 
          customer_name: customerName, 
          plan_title: planTitle, 
          plan_price: parseInt(planPrice, 10), // Garante que o preço seja um número
          flavor_preference: flavorPreference,
          delivery_day: deliveryDay,
          delivery_time: deliveryTime
        }
      ])
      .select();

    if (error) {
      // Se o Supabase retornar um erro, nós o registramos e informamos ao frontend.
      console.error('Erro ao salvar no Supabase:', error);
      return res.status(500).json({ message: 'Erro ao salvar a assinatura no banco de dados.', error: error.message });
    }

    console.log('✅ Assinatura salva com sucesso no Supabase:', data);
    res.status(200).json({ message: 'Assinatura registrada com sucesso!', data: data });

  } catch (err) {
    console.error('Erro inesperado no servidor:', err);
    res.status(500).json({ message: 'Ocorreu um erro inesperado no servidor.' });
  }
});

app.listen(port, () => {
  console.log(`🎂 Servidor da BoloFlix (backend) rodando na porta ${port}`);
});
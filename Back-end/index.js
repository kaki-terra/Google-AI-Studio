const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
const { GoogleGenAI, Type } = require('@google/genai');

const app = express();
const port = process.env.PORT || 3001;

// --- Conexão com o Supabase ---
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
if (!supabaseUrl || !supabaseKey) {
  console.error("ERRO: Variáveis de ambiente SUPABASE_URL e SUPABASE_KEY são obrigatórias.");
}
const supabase = createClient(supabaseUrl, supabaseKey);

// --- Conexão com a IA do Gemini ---
const geminiApiKey = process.env.GEMINI_API_KEY;
if (!geminiApiKey) {
    console.error("ERRO: Variável de ambiente GEMINI_API_KEY é obrigatória.");
}
const ai = new GoogleGenAI({ apiKey: geminiApiKey });
const model = ai.models;


// Middlewares
app.use(cors());
app.use(express.json());

// Rota de "Health Check"
app.get('/', (req, res) => {
  res.send('🎂 Cozinha da BoloFlix está aberta e funcionando!');
});

// --- ENDPOINTS DE IA ---

app.post('/taste-profile', async (req, res) => {
    const answers = req.body;
    const prompt = `
    Baseado nestas preferências para bolos:
    - Vibe: ${answers.vibe}
    - Momento de consumo: ${answers.moment}
    - Preferência por frutas: ${answers.fruits}
    Crie um "Perfil de Sabor BoloFlix" divertido e acolhedor para este usuário em um único parágrafo.
    Depois, sugira um bolo caseiro delicioso que se encaixe perfeitamente neste perfil.
    Formate a resposta EXCLUSIVAMENTE como um objeto JSON com duas chaves: "profileDescription" e "cakeSuggestion".
  `;

  try {
    const response = await model.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
       config: { responseMimeType: "application/json", responseSchema: {
          type: Type.OBJECT,
          properties: {
            profileDescription: { type: Type.STRING },
            cakeSuggestion: { type: Type.STRING },
          },
       }},
    });
    res.json(JSON.parse(response.text));
  } catch (error) {
    console.error('Erro na IA (taste-profile):', error);
    res.status(500).json({ message: "Oops! Tivemos um probleminha na cozinha ao gerar seu perfil." });
  }
});

app.post('/check-availability', async (req, res) => {
    const { day, time } = req.body;
    const prompt = `
    Aja como um sistema de logística para a 'BoloFlix'. Um cliente quer agendar uma entrega para ${day} no período da ${time}.
    Sua tarefa é determinar a disponibilidade e fornecer uma mensagem amigável.
    Responda EXCLUSIVAMENTE com um objeto JSON com duas chaves: "available" (um booleano) e "message" (uma string com a resposta para o cliente).
    - Na maioria das vezes (cerca de 80% das vezes), a entrega deve estar disponível.
    - Ocasionalmente (cerca de 20% das vezes), a entrega deve estar indisponível.
  `;
  try {
    const response = await model.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: { responseMimeType: "application/json", responseSchema: {
            type: Type.OBJECT,
            properties: {
                available: { type: Type.BOOLEAN },
                message: { type: Type.STRING },
            },
        }},
    });
    res.json(JSON.parse(response.text));
  } catch (error) {
     console.error('Erro na IA (check-availability):', error);
     res.status(500).json({ message: "Não foi possível verificar a disponibilidade agora." });
  }
});

app.post('/welcome-message', async (req, res) => {
    const { planTitle, customerName, deliveryDay } = req.body;
    const prompt = `
    Aja como a voz da marca 'BoloFlix'. Um novo cliente chamado(a) "${customerName}" acabou de assinar o plano "${planTitle}".
    A primeira entrega dele(a) está agendada para acontecer toda "${deliveryDay}".
    Escreva uma mensagem de boas-vindas curta (2-3 frases), calorosa e comemorativa.
  `;
  try {
    const response = await model.generateContent({ model: 'gemini-2.5-flash', contents: prompt });
    res.json({ message: response.text });
  } catch (error) {
     console.error('Erro na IA (welcome-message):', error);
     // Não falha o processo se a mensagem falhar, apenas envia uma padrão.
     res.json({ message: "Sua assinatura foi confirmada com sucesso! Prepare-se para receber muito carinho em forma de bolo." });
  }
});


// --- ENDPOINT DE ASSINATURA ---

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

  if (!customerName || !planTitle || !planPrice) {
    return res.status(400).json({ message: "Dados incompletos. Nome, plano e preço são obrigatórios." });
  }

  try {
    const { data, error } = await supabase
      .from('subscriptions')
      .insert([
        { 
          customer_name: customerName, 
          plan_title: planTitle, 
          plan_price: parseInt(planPrice, 10),
          flavor_preference: flavorPreference,
          delivery_day: deliveryDay,
          delivery_time: deliveryTime
        }
      ])
      .select();

    if (error) {
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
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
  // process.exit(1); // Em produção, é bom parar o servidor se a config estiver faltando.
}
const supabase = createClient(supabaseUrl, supabaseKey);

// --- Conexão com a IA do Gemini ---
const geminiApiKey = process.env.GEMINI_API_KEY;
if (!geminiApiKey) {
    console.error("ERRO: Variável de ambiente GEMINI_API_KEY é obrigatória.");
    // process.exit(1);
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

app.get('/investor-pitch', async (req, res) => {
    const prompt = `Crie um pitch de apresentação conciso e persuasivo para investidores da 'BoloFlix', um serviço de assinatura de bolos caseiros. A identidade da marca é nostálgica, acolhedora e familiar, com uma paleta de cores creme, marrom claro e rosa pastel. Destaque o conceito de "Netflix de bolos", os temas mensais surpresa e os diferentes planos de assinatura. Formate a resposta usando markdown para títulos e listas.`;
    try {
        const response = await model.generateContent({ model: 'gemini-2.5-flash', contents: prompt });
        res.json({ pitch: response.text });
    } catch (error) {
        console.error('Erro na IA (investor-pitch):', error);
        res.status(500).json({ message: "Erro ao gerar pitch." });
    }
});

app.get('/business-model-canvas', async (req, res) => {
    const prompt = `Gere um Business Model Canvas para a 'BoloFlix', um serviço de assinatura de bolos caseiros. O público-alvo são famílias e pessoas que apreciam comida caseira e nostálgica. O serviço oferece entregas semanais/mensais com caixas temáticas. A monetização é através de planos de assinatura.`;
    try {
        const response = await model.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                  type: Type.OBJECT,
                  properties: {
                    keyPartners: { type: Type.ARRAY, items: { type: Type.STRING } },
                    keyActivities: { type: Type.ARRAY, items: { type: Type.STRING } },
                    keyResources: { type: Type.ARRAY, items: { type: Type.STRING } },
                    valuePropositions: { type: Type.ARRAY, items: { type: Type.STRING } },
                    customerRelationships: { type: Type.ARRAY, items: { type: Type.STRING } },
                    channels: { type: Type.ARRAY, items: { type: Type.STRING } },
                    customerSegments: { type: Type.ARRAY, items: { type: Type.STRING } },
                    costStructure: { type: Type.ARRAY, items: { type: Type.STRING } },
                    revenueStreams: { type: Type.ARRAY, items: { type: Type.STRING } },
                  },
                },
            },
        });
        res.json({ canvas: JSON.parse(response.text) });
    } catch (error) {
        console.error('Erro na IA (business-model-canvas):', error);
        res.status(500).json({ message: "Erro ao gerar canvas." });
    }
});

app.get('/financial-estimate', async (req, res) => {
    const prompt = `Forneça uma estimativa financeira básica para o primeiro ano da 'BoloFlix', um serviço de assinatura de bolos. Considere três planos: 'Curioso' (R$60/mês, 50 assinantes), 'Apaixonado' (R$120/mês, 30 assinantes) e 'Família' (R$200/mês, 20 assinantes). Estime os custos mensais para ingredientes, embalagens, entrega, marketing e um pequeno salário. Calcule a receita mensal projetada, custos totais e lucro líquido. Apresente o resultado em formato markdown, de forma clara e simples.`;
    try {
        const response = await model.generateContent({ model: 'gemini-2.5-flash', contents: prompt });
        res.json({ estimate: response.text });
    } catch (error) {
        console.error('Erro na IA (financial-estimate):', error);
        res.status(500).json({ message: "Erro ao gerar estimativa." });
    }
});

app.get('/testimonials', async (req, res) => {
    const prompt = `Gere 3 depoimentos de clientes para a 'BoloFlix', um serviço de assinatura de bolos caseiros. O tom deve ser caloroso, pessoal e nostálgico. Cada depoimento deve ter "quote", "author", e "favoriteCake". Formate a resposta EXCLUSIVAMENTE como um array de objetos JSON.`;
    try {
        const response = await model.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: { responseMimeType: "application/json", responseSchema: {
                type: Type.ARRAY,
                items: { type: Type.OBJECT, properties: {
                    quote: { type: Type.STRING },
                    author: { type: Type.STRING },
                    favoriteCake: { type: Type.STRING },
                }},
            }},
        });
        res.json({ testimonials: JSON.parse(response.text) });
    } catch (error) {
        console.error('Erro na IA (testimonials):', error);
        res.status(500).json({ message: "Erro ao gerar depoimentos." });
    }
});

app.post('/custom-cake-description', async (req, res) => {
    const creation = req.body;
    const prompt = `Um cliente montou um bolo com: Massa: ${creation.base}, Recheio: ${creation.filling}, Cobertura: ${creation.topping}. Crie um nome e uma descrição para este bolo. Responda EXCLUSIVAMENTE como um objeto JSON com chaves "cakeName" e "description".`;
    try {
        const response = await model.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: { responseMimeType: "application/json", responseSchema: {
                type: Type.OBJECT,
                properties: {
                    cakeName: { type: Type.STRING },
                    description: { type: Type.STRING },
                },
            }},
        });
        res.json({ cake: JSON.parse(response.text) });
    } catch (error) {
        console.error('Erro na IA (custom-cake):', error);
        res.status(500).json({ message: "Erro ao gerar descrição do bolo." });
    }
});


// --- ENDPOINTS DE DADOS ---

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

// Endpoint para o Painel de Admin
app.get('/subscriptions', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .order('created_at', { ascending: false }); // Pega os mais recentes primeiro

    if (error) {
      console.error('Erro ao buscar assinaturas:', error);
      return res.status(500).json({ message: 'Erro ao buscar dados das assinaturas.', error: error.message });
    }

    res.status(200).json(data);
  } catch (err) {
    console.error('Erro inesperado no servidor (/subscriptions):', err);
    res.status(500).json({ message: 'Ocorreu um erro inesperado no servidor.' });
  }
});

// Endpoint para DELETAR uma assinatura
app.delete('/subscriptions/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const { error } = await supabase
      .from('subscriptions')
      .delete()
      .match({ id: id });

    if (error) {
      console.error('Erro ao deletar no Supabase:', error);
      return res.status(500).json({ message: 'Erro ao deletar assinatura.', error: error.message });
    }
    
    console.log(`✅ Assinatura com ID ${id} deletada com sucesso.`);
    res.status(200).json({ message: 'Assinatura deletada com sucesso!' });

  } catch (err) {
    console.error(`Erro inesperado no servidor (DELETE /subscriptions/${id}):`, err);
    res.status(500).json({ message: 'Ocorreu um erro inesperado no servidor.' });
  }
});

// NOVO: Endpoint para ATUALIZAR uma assinatura
app.put('/subscriptions/:id', async (req, res) => {
    const { id } = req.params;
    const updatedData = req.body;

    // Simples validação para garantir que temos dados para atualizar
    if (!updatedData || Object.keys(updatedData).length === 0) {
        return res.status(400).json({ message: 'Nenhum dado fornecido para atualização.' });
    }

    try {
        const { data, error } = await supabase
            .from('subscriptions')
            .update(updatedData)
            .match({ id: id })
            .select(); // Retorna os dados atualizados

        if (error) {
            console.error('Erro ao atualizar no Supabase:', error);
            return res.status(500).json({ message: 'Erro ao atualizar assinatura.', error: error.message });
        }

        if (!data || data.length === 0) {
            return res.status(404).json({ message: 'Assinatura não encontrada.' });
        }
        
        console.log(`✅ Assinatura com ID ${id} atualizada com sucesso.`);
        res.status(200).json({ message: 'Assinatura atualizada com sucesso!', data: data[0] });

    } catch (err) {
        console.error(`Erro inesperado no servidor (PUT /subscriptions/${id}):`, err);
        res.status(500).json({ message: 'Ocorreu um erro inesperado no servidor.' });
    }
});


app.listen(port, () => {
  console.log(`🎂 Servidor da BoloFlix (backend) rodando na porta ${port}`);
});
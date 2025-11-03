// --- Dependências ---
const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
const { GoogleGenAI, Type } = require('@google/genai');
const { Resend } = require('resend');

// --- Configuração do App ---
const app = express();
const port = process.env.PORT || 10000;

// --- Middleware ---
app.use(cors());
app.use(express.json());

// --- Inicialização dos Serviços ---

// Supabase
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
if (!supabaseUrl || !supabaseKey) {
  console.error("Supabase URL or Key is not set in environment variables.");
}
const supabase = createClient(supabaseUrl, supabaseKey);

// Gemini AI
const geminiApiKey = process.env.GEMINI_API_KEY;
let ai;
if (!geminiApiKey) {
    console.error("Gemini API Key is not set in environment variables.");
} else {
    ai = new GoogleGenAI({ apiKey: geminiApiKey });
}

// Resend
const resendApiKey = process.env.RESEND_API_KEY;
const NOTIFICATION_EMAIL = process.env.NOTIFICATION_EMAIL;
let resend;
if (resendApiKey) {
    resend = new Resend(resendApiKey);
} else {
    console.warn("Resend API Key not set. Email notifications will be disabled.");
}

// --- Funções Auxiliares da IA ---
async function runJsonAiPrompt(prompt, schema, modelName = 'gemini-2.5-flash') {
    if (!ai) throw new Error("Gemini AI client not initialized.");
    
    try {
        const response = await ai.models.generateContent({
            model: modelName,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: schema,
            },
        });
        
        // O .text já vem como uma string JSON válida por causa do responseSchema
        const text = response.text;
        return JSON.parse(text);

    } catch (error) {
        console.error("Erro ao executar o prompt da IA:", error);
        throw new Error("A IA não conseguiu processar a solicitação.");
    }
}


// --- Rotas da API ---

// Rota de verificação de saúde
app.get('/', (req, res) => {
  res.send('🎂 Cozinha da BoloFlix está aberta e funcionando!');
});

// --- ROTAS DE IA (Proxy para o Frontend) ---

app.post('/taste-profile', async (req, res) => {
    const { vibe, moment, fruits } = req.body;
    const prompt = `Gere um perfil de sabor para um cliente de assinatura de bolos. O cliente tem a vibe "${vibe}", gosta de comer bolo no momento "${moment}" e sobre frutas respondeu "${fruits}". Crie uma descrição curta (1-2 frases) e uma sugestão de bolo criativa.`;
    const schema = {
        type: Type.OBJECT,
        properties: {
            profileDescription: { type: Type.STRING },
            cakeSuggestion: { type: Type.STRING },
        }
    };
    try {
        const jsonResponse = await runJsonAiPrompt(prompt, schema);
        res.json(jsonResponse);
    } catch (error) {
        console.error('Erro na IA /taste-profile:', error);
        res.status(500).json({ message: 'Erro ao gerar perfil de sabor.' });
    }
});

app.post('/check-availability', async (req, res) => {
    const { day, time } = req.body;
    const prompt = `Simule uma verificação de disponibilidade de entrega para um serviço de assinatura de bolos. O cliente escolheu ${day} no período da ${time}. Responda se há disponibilidade e crie uma mensagem amigável. Se não estiver disponível, sugira tentar outro horário.`;
    const schema = {
        type: Type.OBJECT,
        properties: {
            available: { type: Type.BOOLEAN },
            message: { type: Type.STRING },
        }
    };
    try {
        const jsonResponse = await runJsonAiPrompt(prompt, schema);
        res.json(jsonResponse);
    } catch (error) {
        console.error('Erro na IA /check-availability:', error);
        res.status(500).json({ message: 'Erro ao verificar disponibilidade.' });
    }
});

app.post('/welcome-message', async (req, res) => {
    const { planTitle, customerName, deliveryDay } = req.body;
    const prompt = `Crie uma mensagem de boas-vindas curta, calorosa e divertida para um novo assinante da BoloFlix. Nome: ${customerName}, Plano: "${planTitle}". Mencione que a entrega será na ${deliveryDay}. Mantenha o tom amigável e pessoal.`;
    const schema = { type: Type.OBJECT, properties: { message: { type: Type.STRING } } };
    try {
        const jsonResponse = await runJsonAiPrompt(prompt, schema);
        res.json(jsonResponse);
    } catch (error) {
        console.error('Erro na IA /welcome-message:', error);
        res.status(500).json({ message: 'Sua assinatura foi criada com sucesso!' });
    }
});

app.get('/investor-pitch', async (req, res) => {
    const prompt = 'Gere um "elevator pitch" conciso (3-4 parágrafos) para investidores sobre a "BoloFlix", uma startup de assinatura de bolos caseiros com temas mensais. Foque no problema (conveniência, qualidade), solução (assinatura, curadoria), mercado e modelo de negócio. Responda como uma única string.';
     const schema = { type: Type.OBJECT, properties: { pitch: { type: Type.STRING } } };
    try {
        const jsonResponse = await runJsonAiPrompt(prompt, schema);
        res.json(jsonResponse);
    } catch (error) {
        console.error('Erro na IA /investor-pitch:', error);
        res.status(500).json({ message: 'Erro ao gerar pitch.' });
    }
});

app.get('/business-model-canvas', async (req, res) => {
    const prompt = `Gere o conteúdo para um Business Model Canvas para a "BoloFlix". Para cada uma das 9 seções, liste de 2 a 4 itens.`;
    const schema = {
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
        }
    };
    try {
        const jsonResponse = await runJsonAiPrompt(prompt, schema);
        res.json({ canvas: jsonResponse });
    } catch (error) {
        console.error('Erro na IA /business-model-canvas:', error);
        res.status(500).json({ message: 'Erro ao gerar canvas.' });
    }
});

app.get('/financial-estimate', async (req, res) => {
    const prompt = 'Gere uma estimativa financeira super simplificada para o primeiro ano da "BoloFlix". Projete a receita baseada nos 3 planos (Curioso R$60, Apaixonado R$120, Família R$200) com uma meta de 100 assinantes totais. Liste os principais custos (ingredientes, marketing, embalagem, entrega). Calcule o lucro bruto e líquido mensal e anual. Apresente como uma string única, usando markdown para formatação.';
    const schema = { type: Type.OBJECT, properties: { estimate: { type: Type.STRING } } };
    try {
        const jsonResponse = await runJsonAiPrompt(prompt, schema);
        res.json(jsonResponse);
    } catch (error) {
        console.error('Erro na IA /financial-estimate:', error);
        res.status(500).json({ message: 'Erro ao gerar estimativa.' });
    }
});

app.get('/testimonials', async (req, res) => {
    const prompt = `Gere 3 depoimentos fictícios de clientes felizes da "BoloFlix".`;
    const schema = {
        type: Type.OBJECT,
        properties: {
            testimonials: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        quote: { type: Type.STRING },
                        author: { type: Type.STRING },
                        favoriteCake: { type: Type.STRING },
                    }
                }
            }
        }
    };
    try {
        const jsonResponse = await runJsonAiPrompt(prompt, schema);
        res.json(jsonResponse);
    } catch (error) {
        console.error('Erro na IA /testimonials:', error);
        res.status(500).json({ message: 'Erro ao gerar depoimentos.' });
    }
});

app.post('/custom-cake-description', async (req, res) => {
    const { base, filling, topping } = req.body;
    const prompt = `Um cliente montou um bolo com massa de "${base}", recheio de "${filling}" e cobertura de "${topping}". Crie um nome criativo e uma descrição curta e apetitosa para este bolo.`;
    const schema = {
        type: Type.OBJECT,
        properties: {
            cakeName: { type: Type.STRING },
            description: { type: Type.STRING },
        }
    };
    try {
        const jsonResponse = await runJsonAiPrompt(prompt, schema);
        res.json({ cake: jsonResponse });
    } catch (error) {
        console.error('Erro na IA /custom-cake-description:', error);
        res.status(500).json({ message: 'Erro ao gerar descrição do bolo.' });
    }
});


// --- ROTAS DE DADOS (Painel de Admin) ---

app.post('/subscribe', async (req, res) => {
    if (!supabase) return res.status(500).json({ message: 'Conexão com banco de dados não configurada.' });
    
    try {
        // Mapeia os dados do frontend (camelCase) para o banco de dados (snake_case)
        const {
            customerName,
            planTitle,
            planPrice,
            flavorPreference,
            deliveryDay,
            deliveryTime
        } = req.body;

        const { data, error } = await supabase
            .from('subscriptions')
            .insert([{
                customer_name: customerName,
                plan_title: planTitle,
                plan_price: parseInt(planPrice, 10), // Garante que o preço seja um número
                flavor_preference: flavorPreference,
                delivery_day: deliveryDay,
                delivery_time: deliveryTime
            }])
            .select()
            .single();

        if (error) throw error;
        
        if (resend && NOTIFICATION_EMAIL) {
            resend.emails.send({
                from: 'BoloFlix <onboarding@resend.dev>',
                to: NOTIFICATION_EMAIL,
                subject: '🎉 Novo Pedido na BoloFlix!',
                html: `<h1>Novo Pedido!</h1><p><strong>Nome:</strong> ${data.customer_name}</p><p><strong>Plano:</strong> ${data.plan_title} (R$ ${data.plan_price})</p>`
            }).catch(console.error); // Usamos .catch para não quebrar o fluxo principal se o email falhar
        }

        res.status(201).json({ message: 'Assinatura criada com sucesso!', data });

    } catch (error) {
        console.error('Erro ao salvar no Supabase:', error);
        res.status(500).json({ message: 'Erro interno ao processar a assinatura.' });
    }
});

app.get('/subscriptions', async (req, res) => {
    if (!supabase) return res.status(500).json({ message: 'Conexão com banco de dados não configurada.' });
    try {
        const { data, error } = await supabase
            .from('subscriptions')
            .select('*')
            .order('created_at', { ascending: false });
        if (error) throw error;
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ message: 'Erro ao buscar assinaturas.' });
    }
});

app.delete('/subscriptions/:id', async (req, res) => {
    if (!supabase) return res.status(500).json({ message: 'Conexão com banco de dados não configurada.' });
    try {
        const { id } = req.params;
        const { error } = await supabase.from('subscriptions').delete().eq('id', id);
        if (error) throw error;
        res.status(200).json({ message: 'Assinatura deletada com sucesso.' });
    } catch (error) {
        res.status(500).json({ message: 'Erro ao deletar assinatura.' });
    }
});

app.put('/subscriptions/:id', async (req, res) => {
    if (!supabase) return res.status(500).json({ message: 'Conexão com banco de dados não configurada.' });
    try {
        const { id } = req.params;
        const { data, error } = await supabase
            .from('subscriptions')
            .update(req.body)
            .eq('id', id)
            .select()
            .single();
        if (error) throw error;
        res.status(200).json({ message: 'Assinatura atualizada com sucesso.', data });
    } catch (error) {
        res.status(500).json({ message: 'Erro ao atualizar assinatura.' });
    }
});

// --- Inicialização do Servidor ---
app.listen(port, () => {
  console.log(`//////////////////////////////////////////////`);
  console.log(`//`);
  console.log(`//   🎂 Servidor da BoloFlix (backend) rodando na porta ${port}`);
  console.log(`//   Your service is live 🚀`);
  console.log(`//`);
  console.log(`//////////////////////////////////////////////`);
  console.log(`Available at your primary URL https://boloflix-backend.onrender.com`);
  console.log(`//////////////////////////////////////////////`);
});
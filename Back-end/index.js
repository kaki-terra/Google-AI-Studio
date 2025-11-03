// --- Dependências ---
const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
const { GoogleGenAI } = require('@google/genai');
const { Resend } = require('resend');

// --- Configuração do App ---
const app = express();
const port = process.env.PORT || 3001;

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
if (!geminiApiKey) {
    console.error("Gemini API Key is not set in environment variables.");
}
const ai = new GoogleGenAI({ apiKey: geminiApiKey });


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
async function runAiPrompt(prompt, modelName = 'gemini-2.5-flash') {
    if (!ai) throw new Error("Gemini AI client not initialized.");
    const model = ai.models.generateContent({ model: modelName, contents: prompt });
    const result = await model;
    return result.text;
}


// --- Rotas da API ---

// Rota de verificação de saúde
app.get('/', (req, res) => {
  res.send('🎂 Cozinha da BoloFlix está aberta e funcionando!');
});

// --- ROTAS DE IA (Proxy para o Frontend) ---

app.post('/taste-profile', async (req, res) => {
    const { vibe, moment, fruits } = req.body;
    const prompt = `Gere um perfil de sabor para um cliente de assinatura de bolos. O cliente tem a vibe "${vibe}", gosta de comer bolo no momento "${moment}" e sobre frutas respondeu "${fruits}". Crie uma descrição curta (1-2 frases) e uma sugestão de bolo criativa. Responda em JSON com chaves "profileDescription" e "cakeSuggestion".`;
    try {
        const textResponse = await runAiPrompt(prompt);
        res.json(JSON.parse(textResponse));
    } catch (error) {
        console.error('Erro na IA /taste-profile:', error);
        res.status(500).json({ message: 'Erro ao gerar perfil de sabor.' });
    }
});

app.post('/check-availability', async (req, res) => {
    const { day, time } = req.body;
    const prompt = `Simule uma verificação de disponibilidade de entrega para um serviço de assinatura de bolos. O cliente escolheu ${day} no período da ${time}. Responda se há disponibilidade (true/false) e crie uma mensagem amigável. Se não estiver disponível, sugira tentar outro horário. Responda em JSON com chaves "available" (boolean) e "message" (string).`;
    try {
        const textResponse = await runAiPrompt(prompt);
        res.json(JSON.parse(textResponse));
    } catch (error) {
        console.error('Erro na IA /check-availability:', error);
        res.status(500).json({ message: 'Erro ao verificar disponibilidade.' });
    }
});

app.post('/welcome-message', async (req, res) => {
    const { planTitle, customerName, deliveryDay } = req.body;
    const prompt = `Crie uma mensagem de boas-vindas curta, calorosa e divertida para um novo assinante da BoloFlix. Nome: ${customerName}, Plano: "${planTitle}". Mencione que a entrega será na ${deliveryDay}. Mantenha o tom amigável e pessoal. Responda em JSON com uma única chave "message".`;
    try {
        const textResponse = await runAiPrompt(prompt);
        res.json(JSON.parse(textResponse));
    } catch (error) {
        console.error('Erro na IA /welcome-message:', error);
        res.status(500).json({ message: 'Sua assinatura foi criada com sucesso!' });
    }
});

app.get('/investor-pitch', async (req, res) => {
    const prompt = 'Gere um "elevator pitch" conciso (3-4 parágrafos) para investidores sobre a "BoloFlix", uma startup de assinatura de bolos caseiros com temas mensais. Foque no problema (conveniência, qualidade), solução (assinatura, curadoria), mercado e modelo de negócio. Use formato markdown simples.';
    try {
        const pitch = await runAiPrompt(prompt);
        res.json({ pitch });
    } catch (error) {
        console.error('Erro na IA /investor-pitch:', error);
        res.status(500).json({ message: 'Erro ao gerar pitch.' });
    }
});

app.get('/business-model-canvas', async (req, res) => {
    const prompt = `Gere o conteúdo para um Business Model Canvas para a "BoloFlix". Para cada uma das 9 seções (keyPartners, keyActivities, keyResources, valuePropositions, customerRelationships, channels, customerSegments, costStructure, revenueStreams), liste de 2 a 4 itens em um array de strings. A resposta final deve ser um único objeto JSON.`;
    try {
        const canvas = await runAiPrompt(prompt);
        res.json({ canvas: JSON.parse(canvas) });
    } catch (error) {
        console.error('Erro na IA /business-model-canvas:', error);
        res.status(500).json({ message: 'Erro ao gerar canvas.' });
    }
});

app.get('/financial-estimate', async (req, res) => {
    const prompt = 'Gere uma estimativa financeira super simplificada para o primeiro ano da "BoloFlix". Projete a receita baseada nos 3 planos (Curioso R$60, Apaixonado R$120, Família R$200) com uma meta de 100 assinantes totais. Liste os principais custos (ingredientes, marketing, embalagem, entrega). Calcule o lucro bruto e líquido mensal e anual. Apresente em formato markdown simples com títulos e listas.';
    try {
        const estimate = await runAiPrompt(prompt);
        res.json({ estimate });
    } catch (error) {
        console.error('Erro na IA /financial-estimate:', error);
        res.status(500).json({ message: 'Erro ao gerar estimativa.' });
    }
});

app.get('/testimonials', async (req, res) => {
    const prompt = `Gere 3 depoimentos fictícios de clientes felizes da "BoloFlix". Cada depoimento deve ter "quote", "author" e "favoriteCake". A resposta deve ser um array de 3 objetos JSON.`;
    try {
        const testimonials = await runAiPrompt(prompt);
        res.json({ testimonials: JSON.parse(testimonials) });
    } catch (error) {
        console.error('Erro na IA /testimonials:', error);
        res.status(500).json({ message: 'Erro ao gerar depoimentos.' });
    }
});

app.post('/custom-cake-description', async (req, res) => {
    const { base, filling, topping } = req.body;
    const prompt = `Um cliente montou um bolo com massa de "${base}", recheio de "${filling}" e cobertura de "${topping}". Crie um nome criativo e uma descrição curta e apetitosa para este bolo. Responda em JSON com chaves "cakeName" e "description".`;
    try {
        const cake = await runAiPrompt(prompt);
        res.json({ cake: JSON.parse(cake) });
    } catch (error) {
        console.error('Erro na IA /custom-cake-description:', error);
        res.status(500).json({ message: 'Erro ao gerar descrição do bolo.' });
    }
});


// --- ROTAS DE DADOS (Painel de Admin) ---

// Rota para criar nova assinatura E ENVIAR EMAIL
app.post('/subscribe', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('subscriptions')
            .insert([req.body])
            .select()
            .single();

        if (error) throw error;
        
        // Enviar notificação por email (sem bloquear a resposta do cliente)
        if (resend && NOTIFICATION_EMAIL) {
            resend.emails.send({
                from: 'BoloFlix <onboarding@resend.dev>',
                to: NOTIFICATION_EMAIL,
                subject: '🎉 Novo Pedido na BoloFlix!',
                html: `
                    <h1>Novo Pedido Recebido!</h1>
                    <p>Um novo cliente assinou a BoloFlix. Aqui estão os detalhes:</p>
                    <ul>
                        <li><strong>Nome:</strong> ${data.customer_name}</li>
                        <li><strong>Plano:</strong> ${data.plan_title} (R$ ${data.plan_price})</li>
                        <li><strong>Preferência:</strong> ${data.flavor_preference}</li>
                        <li><strong>Entrega:</strong> ${data.delivery_day}, ${data.delivery_time}</li>
                    </ul>
                `
            }).catch(emailError => {
                // Apenas loga o erro do email, mas não quebra o fluxo principal
                console.error("Falha ao enviar email de notificação:", emailError);
            });
        }

        res.status(201).json({ message: 'Assinatura criada com sucesso!', data });

    } catch (error) {
        console.error('Erro ao salvar no Supabase:', error);
        res.status(500).json({ message: 'Erro interno ao processar a assinatura.' });
    }
});

// Listar todas as assinaturas para o painel de admin
app.get('/subscriptions', async (req, res) => {
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

// Deletar uma assinatura
app.delete('/subscriptions/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { error } = await supabase
            .from('subscriptions')
            .delete()
            .eq('id', id);
        if (error) throw error;
        res.status(200).json({ message: 'Assinatura deletada com sucesso.' });
    } catch (error) {
        res.status(500).json({ message: 'Erro ao deletar assinatura.' });
    }
});

// Editar uma assinatura
app.put('/subscriptions/:id', async (req, res) => {
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
  console.log(`🎂 Servidor da BoloFlix (backend) rodando na porta ${port}`);
});

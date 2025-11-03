const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
const { GoogleGenAI, Type } = require("@google/genai");
const { Resend } = require('resend');

// --- CONFIGURAÇÃO E INICIALIZAÇÃO ---

const app = express();
const port = process.env.PORT || 3001;

// Middlewares
app.use(cors());
app.use(express.json());

// Variáveis de Ambiente
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const geminiApiKey = process.env.GEMINI_API_KEY;
const resendApiKey = process.env.RESEND_API_KEY;
const notificationEmail = process.env.NOTIFICATION_EMAIL;

// Validação das variáveis de ambiente
if (!supabaseUrl || !supabaseKey || !geminiApiKey || !resendApiKey || !notificationEmail) {
  console.error("ERRO: Variáveis de ambiente essenciais não foram definidas.");
  // Em um ambiente de produção, você poderia usar process.exit(1) aqui.
  // Por enquanto, vamos apenas logar o erro.
}

// Inicialização dos Clientes
const supabase = createClient(supabaseUrl, supabaseKey);
const ai = new GoogleGenAI({ apiKey: geminiApiKey });
const resend = new Resend(resendApiKey);

// --- ROTA DE VERIFICAÇÃO DE SAÚDE ---

app.get('/', (req, res) => {
  res.send('🎂 Cozinha da BoloFlix está aberta e funcionando!');
});

// --- ROTAS DE ASSINATURA (CRUD) ---

// CREATE: Nova Assinatura
app.post('/subscribe', async (req, res) => {
  const { 
    customerName, 
    planTitle, 
    planPrice, 
    flavorPreference, 
    deliveryDay, 
    deliveryTime,
    customerEmail // Novo campo
  } = req.body;

  try {
    // 1. Salvar no Banco de Dados
    const { data: subscriptionData, error: dbError } = await supabase
      .from('subscriptions')
      .insert([
        { 
          customer_name: customerName, 
          plan_title: planTitle,
          plan_price: planPrice,
          flavor_preference: flavorPreference,
          delivery_day: deliveryDay,
          delivery_time: deliveryTime,
          customer_email: customerEmail, // Salva o email
        },
      ])
      .select()
      .single();

    if (dbError) throw dbError;

    // 2. Enviar notificação para o Admin (sem bloquear a resposta)
    resend.emails.send({
        from: 'BoloFlix <onboarding@resend.dev>',
        to: notificationEmail,
        subject: '🎉 Novo Pedido na BoloFlix!',
        html: `
            <h1>Novo Pedido!</h1>
            <p>Um novo cliente acaba de assinar um plano. Prepare o forno!</p>
            <h2>Detalhes do Pedido</h2>
            <ul>
                <li><strong>Nome do Cliente:</strong> ${customerName}</li>
                <li><strong>Plano:</strong> ${planTitle} (R$ ${planPrice},00)</li>
                <li><strong>Preferência:</strong> ${flavorPreference || 'Não especificada'}</li>
                <li><strong>Entrega:</strong> ${deliveryDay}, ${deliveryTime}</li>
                <li><strong>Data do Pedido:</strong> ${new Date(subscriptionData.created_at).toLocaleDateString('pt-BR')}</li>
            </ul>
            <p>Para gerenciar este e outros pedidos, acesse o seu <a href="https://boloflix.vercel.app/admin">Painel de Administrador</a>.</p>
        `,
    }).catch(err => console.error("Falha ao enviar email para admin:", err));
    
    // 3. Enviar confirmação para o cliente (sem bloquear a resposta)
    if (customerEmail) {
        resend.emails.send({
            from: 'BoloFlix <onboarding@resend.dev>',
            to: customerEmail,
            subject: 'Sua assinatura BoloFlix foi confirmada!',
            html: `
                <h1>Oba, seu pedido foi confirmado!</h1>
                <p>Olá ${customerName}, que alegria ter você na família BoloFlix!</p>
                <p>Sua assinatura do <strong>Plano ${planTitle}</strong> foi processada com sucesso. Prepare-se para receber um pedacinho de felicidade em sua casa.</p>
                <h2>Resumo da sua Assinatura</h2>
                <ul>
                    <li><strong>Plano:</strong> ${planTitle} (R$ ${planPrice},00)</li>
                    <li><strong>Preferência de Sabor:</strong> ${flavorPreference || 'Surpresa da casa!'}</li>
                    <li><strong>Sua entrega semanal será:</strong> ${deliveryDay}, no período da ${deliveryTime}.</li>
                </ul>
                <p>Em breve entraremos em contato com mais detalhes. Bom apetite!</p>
            `,
        }).catch(err => console.error("Falha ao enviar email para cliente:", err));
    }


    res.status(201).json({ success: true, message: 'Assinatura criada com sucesso!', data: subscriptionData });
  } catch (error) {
    console.error('Erro ao processar assinatura:', error);
    res.status(500).json({ success: false, message: 'Erro interno ao processar a assinatura.' });
  }
});


// --- ROTAS DO PAINEL DE ADMIN ---

// READ: Listar todas as assinaturas
app.get('/subscriptions', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('subscriptions')
            .select('*')
            .order('created_at', { ascending: false });
        if (error) throw error;
        res.status(200).json(data);
    } catch (error) {
        console.error('Erro ao buscar assinaturas:', error);
        res.status(500).json({ message: 'Erro ao buscar assinaturas.' });
    }
});

// UPDATE: Editar uma assinatura
app.put('/subscriptions/:id', async (req, res) => {
    const { id } = req.params;
    const { customer_name, flavor_preference, delivery_day, delivery_time } = req.body;
    try {
        const { data, error } = await supabase
            .from('subscriptions')
            .update({ customer_name, flavor_preference, delivery_day, delivery_time })
            .eq('id', id)
            .select()
            .single();
        if (error) throw error;
        res.status(200).json({ message: 'Assinatura atualizada com sucesso', data });
    } catch (error) {
        console.error(`Erro ao atualizar assinatura ${id}:`, error);
        res.status(500).json({ message: 'Erro ao atualizar assinatura.' });
    }
});

// DELETE: Deletar uma assinatura
app.delete('/subscriptions/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const { error } = await supabase
            .from('subscriptions')
            .delete()
            .eq('id', id);
        if (error) throw error;
        res.status(200).json({ message: 'Assinatura deletada com sucesso.' });
    } catch (error) {
        console.error(`Erro ao deletar assinatura ${id}:`, error);
        res.status(500).json({ message: 'Erro ao deletar assinatura.' });
    }
});


// --- ROTAS DE LÓGICA COM IA ---

const callGenerativeModel = async (prompt, responseSchema) => {
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: responseSchema,
        },
    });
    return JSON.parse(response.text);
};

// Gerar Perfil de Sabor
app.post('/taste-profile', async (req, res) => {
    const { vibe, moment, fruits } = req.body;
    const prompt = `Com base nestas preferências de um cliente de assinatura de bolos - Vibe: ${vibe}, Momento: ${moment}, Frutas: ${fruits} - crie um perfil de sabor para ele em uma frase curta e carismática e sugira um tipo de bolo específico que ele amaria.`;
    const schema = {
        type: Type.OBJECT,
        properties: {
            profileDescription: { type: Type.STRING },
            cakeSuggestion: { type: Type.STRING },
        },
        required: ["profileDescription", "cakeSuggestion"]
    };

    try {
        const result = await callGenerativeModel(prompt, schema);
        res.json(result);
    } catch (error) {
        console.error('Erro na API Gemini (taste-profile):', error);
        res.status(500).json({ message: 'Erro ao comunicar com a IA.' });
    }
});

// Verificar Disponibilidade de Entrega
app.post('/check-availability', async (req, res) => {
    const { day, time } = req.body;
    const prompt = `Simule uma verificação de logística para uma assinatura de bolos. O cliente quer receber o bolo na ${day} no período da ${time}. Verifique a disponibilidade e retorne uma resposta. Para ${day} de manhã, sempre há disponibilidade. Para os outros horários, finja uma verificação e responda de forma criativa.`;
    const schema = {
        type: Type.OBJECT,
        properties: {
            available: { type: Type.BOOLEAN },
            message: { type: Type.STRING },
        },
        required: ["available", "message"]
    };
    
    try {
        const result = await callGenerativeModel(prompt, schema);
        res.json(result);
    } catch (error) {
        console.error('Erro na API Gemini (check-availability):', error);
        res.status(500).json({ message: 'Erro ao comunicar com a IA.' });
    }
});

// Gerar Mensagem de Boas-Vindas
app.post('/welcome-message', async (req, res) => {
    const { customerName, planTitle, deliveryDay } = req.body;
    const prompt = `Crie uma mensagem de boas-vindas curta, calorosa e animada para um novo assinante da BoloFlix. Nome do cliente: ${customerName}. Plano: ${planTitle}. Primeiro dia de entrega: ${deliveryDay}. A mensagem deve ser otimista e celebrar a chegada dele à "família BoloFlix".`;
    const schema = {
        type: Type.OBJECT,
        properties: {
            welcomeMessage: { type: Type.STRING },
        },
        required: ["welcomeMessage"]
    };

    try {
        const result = await callGenerativeModel(prompt, schema);
        res.json(result);
    } catch (error) {
        console.error('Erro na API Gemini (welcome-message):', error);
        res.status(500).json({ message: 'Erro ao comunicar com a IA.' });
    }
});

// Gerar Pitch para Investidor
app.get('/investor-pitch', async (req, res) => {
    const prompt = `Crie um 'elevator pitch' (apresentação de 30 segundos) conciso e inspirador para a "BoloFlix", uma startup de assinatura de bolos caseiros. Destaque o problema (falta de bolos de qualidade e afeto no dia a dia), a solução (assinatura de bolos com temas mensais), o mercado (pessoas que valorizam comida afetiva) e o diferencial (curadoria de sabores e experiência 'Netflix'). Formate a resposta em markdown simples.`;
    try {
        const response = await ai.models.generateContent({ model: "gemini-2.5-flash", contents: prompt });
        res.json({ pitch: response.text });
    } catch (error) {
        console.error('Erro na API Gemini (investor-pitch):', error);
        res.status(500).json({ message: 'Erro ao comunicar com a IA.' });
    }
});

// Gerar Business Model Canvas
app.get('/business-model-canvas', async (req, res) => {
    const prompt = `Gere os dados para um Business Model Canvas para a startup "BoloFlix". Para cada uma das 9 seções (keyPartners, keyActivities, keyResources, valuePropositions, customerRelationships, channels, customerSegments, costStructure, revenueStreams), liste de 3 a 4 itens principais.`;
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
        },
    };
    try {
        const result = await callGenerativeModel(prompt, schema);
        res.json({ canvas: result });
    } catch (error) {
        console.error('Erro na API Gemini (business-model-canvas):', error);
        res.status(500).json({ message: 'Erro ao comunicar com a IA.' });
    }
});

// Gerar Estimativa Financeira
app.get('/financial-estimate', async (req, res) => {
    const prompt = `Crie uma estimativa financeira simplificada para o primeiro ano da "BoloFlix", uma startup de assinatura de bolos. Apresente os seguintes pontos: Custo de Aquisição de Cliente (CAC) estimado, Lifetime Value (LTV) de um cliente que fica 6 meses, projeção de receita mensal (considerando 50 assinantes no plano médio de R$120), e principais custos operacionais mensais. Formate em markdown simples com títulos.`;
    try {
        const response = await ai.models.generateContent({ model: "gemini-2.5-flash", contents: prompt });
        res.json({ estimate: response.text });
    } catch (error) {
        console.error('Erro na API Gemini (financial-estimate):', error);
        res.status(500).json({ message: 'Erro ao comunicar com a IA.' });
    }
});

// Gerar Depoimentos
app.get('/testimonials', async (req, res) => {
    const prompt = `Crie 3 depoimentos curtos e fictícios de clientes satisfeitos com a "BoloFlix". Cada depoimento deve ter uma citação (quote), o nome do autor (author), e o bolo favorito dele (favoriteCake).`;
    const schema = {
        type: Type.ARRAY,
        items: {
            type: Type.OBJECT,
            properties: {
                quote: { type: Type.STRING },
                author: { type: Type.STRING },
                favoriteCake: { type: Type.STRING },
            },
            required: ["quote", "author", "favoriteCake"]
        }
    };
    try {
        const result = await callGenerativeModel(prompt, schema);
        res.json({ testimonials: result });
    } catch (error) {
        console.error('Erro na API Gemini (testimonials):', error);
        res.status(500).json({ message: 'Erro ao comunicar com a IA.' });
    }
});

// Gerar Descrição de Bolo Customizado
app.post('/custom-cake-description', async (req, res) => {
    const { base, filling, topping } = req.body;
    const prompt = `Crie um nome criativo e uma descrição curta e apetitosa para um bolo com a seguinte combinação: Massa de ${base}, recheio de ${filling} e cobertura de ${topping}.`;
    const schema = {
        type: Type.OBJECT,
        properties: {
            cakeName: { type: Type.STRING },
            description: { type: Type.STRING },
        },
        required: ["cakeName", "description"]
    };
    try {
        const result = await callGenerativeModel(prompt, schema);
        res.json({ cake: result });
    } catch (error) {
        console.error('Erro na API Gemini (custom-cake-description):', error);
        res.status(500).json({ message: 'Erro ao comunicar com a IA.' });
    }
});

// --- INICIAR SERVIDOR ---

app.listen(port, () => {
  console.log(`🎂 Servidor da BoloFlix (backend) rodando na porta ${port}`);
  console.log('Your service is live 🚀');
  console.log('////////////////////////////////////////////');
  console.log(`Available at your primary URL: https://boloflix-backend.onrender.com`);
  console.log('////////////////////////////////////////////');
});

const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
const { GoogleGenAI, Type } = require('@google/genai');
const { Resend } = require('resend');

const app = express();
app.use(cors());
app.use(express.json());

// --- Configurações e Clientes ---
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const geminiApiKey = process.env.GEMINI_API_KEY;
const resendApiKey = process.env.RESEND_API_KEY;
const adminPassword = process.env.ADMIN_PASSWORD;
const notificationEmail = process.env.NOTIFICATION_EMAIL;

if (!supabaseUrl || !supabaseKey || !geminiApiKey || !resendApiKey || !adminPassword || !notificationEmail) {
  console.error('ERRO: Variáveis de ambiente faltando. Verifique SUPABASE_URL, SUPABASE_KEY, GEMINI_API_KEY, RESEND_API_KEY, ADMIN_PASSWORD, NOTIFICATION_EMAIL.');
  process.exit(1); // Encerra o processo se houver erro crítico
}

const supabase = createClient(supabaseUrl, supabaseKey);
const ai = new GoogleGenAI({ apiKey: geminiApiKey });
const resend = new Resend(resendApiKey);


// --- Funções Auxiliares de IA ---
const getModelResponse = async (prompt, responseSchema) => {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: responseSchema,
            },
        });
        const jsonText = response.text.trim();
        return JSON.parse(jsonText);
    } catch (error) {
        console.error('Erro na chamada da API Gemini:', error);
        throw new Error('Falha ao comunicar com o serviço de IA.');
    }
};

// --- ROTAS ---

// Rota de verificação de saúde
app.get('/', (req, res) => {
  res.send('🎂 Cozinha da BoloFlix está aberta e funcionando!');
});

// Rota para Assinatura (CREATE)
app.post('/subscriptions', async (req, res) => {
  const {
    customerName,
    customerEmail,
    planTitle,
    planPrice,
    flavorPreference,
    deliveryDay,
    deliveryTime
  } = req.body;

  // Mapeamento para snake_case
  const subscriptionData = {
    customer_name: customerName,
    customer_email: customerEmail,
    plan_title: planTitle,
    plan_price: planPrice,
    flavor_preference: flavorPreference,
    delivery_day: deliveryDay,
    delivery_time: deliveryTime
  };
  
  const { data, error } = await supabase
    .from('subscriptions')
    .insert([subscriptionData])
    .select()
    .single();

  if (error) {
    console.error('Erro ao salvar no Supabase:', error);
    return res.status(500).json({ message: 'Erro interno ao salvar assinatura.' });
  }

  // Envio de email de notificação (não bloqueante)
  try {
    const adminEmailHtml = `<h1>🎉 Novo Pedido na BoloFlix!</h1><p>Um novo cliente acaba de assinar um plano. Prepare o forno!</p><h2>Detalhes do Pedido</h2><ul><li><strong>Nome do Cliente:</strong> ${customerName}</li><li><strong>Email:</strong> ${customerEmail}</li><li><strong>Plano:</strong> ${planTitle} (R$ ${planPrice.toFixed(2)})</li><li><strong>Preferência:</strong> ${flavorPreference || 'Não informada'}</li><li><strong>Entrega:</strong> ${deliveryDay}, ${deliveryTime}</li></ul><p>Para gerenciar este e outros pedidos, acesse o seu <a href="https://boloflix.vercel.app/admin">Painel de Administrador</a>.</p>`;

    resend.emails.send({
      from: 'BoloFlix <onboarding@resend.dev>',
      to: notificationEmail,
      subject: '🎉 Novo Pedido na BoloFlix!',
      html: adminEmailHtml,
    });
    
    // Envia email de confirmação para o cliente
    const customerEmailHtml = `<h1>Bem-vindo(a) à família BoloFlix, ${customerName}!</h1><p>Sua assinatura do plano <strong>${planTitle}</strong> foi confirmada com sucesso. Preparamos tudo com muito carinho para você.</p><h2>Resumo da sua Assinatura:</h2><ul><li><strong>Plano:</strong> ${planTitle}</li><li><strong>Valor:</strong> R$ ${planPrice.toFixed(2)}/mês</li><li><strong>Preferência:</strong> ${flavorPreference || 'Não informada'}</li><li><strong>Sua entrega semanal será:</strong> ${deliveryDay}, ${deliveryTime}</li></ul><p>Em breve você receberá seu primeiro pedacinho de felicidade. Bom apetite!</p><br/><p>Com carinho,<br/>Equipe BoloFlix (by Quintal dos Kitutes)</p>`;

    resend.emails.send({
        from: 'BoloFlix <onboarding@resend.dev>',
        to: customerEmail,
        subject: 'Sua assinatura BoloFlix foi confirmada! 🎂',
        html: customerEmailHtml,
    });

  } catch (emailError) {
    console.error('Falha ao enviar email de notificação:', emailError);
    // Não retorna erro para o cliente, a assinatura foi um sucesso.
  }

  res.status(201).json(data);
});

// Rotas para Admin (READ, UPDATE, DELETE)
app.get('/subscriptions', async (req, res) => {
    const { data, error } = await supabase.from('subscriptions').select('*').order('created_at', { ascending: false });
    if (error) return res.status(500).json({ message: 'Erro ao buscar assinaturas.' });
    res.json(data);
});

app.put('/subscriptions/:id', async (req, res) => {
    const { id } = req.params;
    const { customer_name, flavor_preference, delivery_day, delivery_time } = req.body;
    const { data, error } = await supabase.from('subscriptions').update({ customer_name, flavor_preference, delivery_day, delivery_time }).eq('id', id).select().single();
    if (error) return res.status(500).json({ message: 'Erro ao atualizar assinatura.' });
    res.json({ message: 'Assinatura atualizada com sucesso!', data });
});

app.delete('/subscriptions/:id', async (req, res) => {
    const { id } = req.params;
    const { error } = await supabase.from('subscriptions').delete().eq('id', id);
    if (error) return res.status(500).json({ message: 'Erro ao excluir assinatura.' });
    res.json({ message: 'Assinatura excluída com sucesso!' });
});

// Rota de verificação de senha do Admin
app.post('/admin/verify', (req, res) => {
    const { password } = req.body;
    if (password === adminPassword) {
        res.json({ success: true });
    } else {
        res.status(401).json({ success: false, message: 'Senha incorreta.' });
    }
});


// --- ROTAS DE IA ---

app.post('/taste-profile', async (req, res) => {
    const { vibe, moment, fruits } = req.body;
    const prompt = `Um cliente respondeu um quiz: Vibe de bolo: "${vibe}", Momento perfeito: "${moment}", Frutas no bolo: "${fruits}". Crie um perfil de sabor para ele em uma frase curta e carismática e, em seguida, sugira um tipo de bolo específico que combine.`;
    const schema = {
        type: Type.OBJECT,
        properties: {
            profileDescription: { type: Type.STRING },
            cakeSuggestion: { type: Type.STRING },
        },
        required: ["profileDescription", "cakeSuggestion"],
    };
    try {
        const response = await getModelResponse(prompt, schema);
        res.json(response);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.post('/check-availability', async (req, res) => {
    const { day, time } = req.body;
    const prompt = `Simule uma verificação de logística. O cliente quer entrega na ${day} no período da ${time}. Verifique a disponibilidade e retorne uma mensagem amigável.`;
    const schema = {
        type: Type.OBJECT,
        properties: {
            available: { type: Type.BOOLEAN },
            message: { type: Type.STRING },
        },
        required: ["available", "message"],
    };
    try {
        const response = await getModelResponse(prompt, schema);
        res.json(response);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.post('/welcome-message', async (req, res) => {
    const { name, plan, deliveryDay } = req.body;
    const prompt = `Crie uma mensagem de boas-vindas curta e super calorosa para um novo assinante da BoloFlix. Nome: ${name}, Plano: ${plan}, Dia da entrega: ${deliveryDay}. Inclua o nome, o plano e o dia da entrega na mensagem.`;
    const schema = {
        type: Type.OBJECT,
        properties: {
            message: { type: Type.STRING },
        },
        required: ["message"],
    };
    try {
        const response = await getModelResponse(prompt, schema);
        res.json(response);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.get('/investor-pitch', async (req, res) => {
    const prompt = "Gere um 'elevator pitch' para uma startup chamada BoloFlix, uma Netflix de bolos caseiros por assinatura.";
    const schema = { type: Type.OBJECT, properties: { pitch: { type: Type.STRING } }, required: ["pitch"]};
    try {
        const response = await getModelResponse(prompt, schema);
        res.json(response);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.get('/business-model-canvas', async (req, res) => {
    const prompt = "Gere um Business Model Canvas para a startup BoloFlix, uma Netflix de bolos caseiros por assinatura. Retorne um objeto JSON com as chaves: keyPartners, keyActivities, keyResources, valuePropositions, customerRelationships, channels, customerSegments, costStructure, revenueStreams.";
    const schema = {
        type: Type.OBJECT,
        properties: {
            canvas: { 
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
            }
        },
        required: ["canvas"]
    };
    try {
        const response = await getModelResponse(prompt, schema);
        res.json(response);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.get('/financial-estimate', async (req, res) => {
    const prompt = "Gere uma estimativa financeira simplificada para o primeiro ano da BoloFlix, considerando 3 planos de assinatura (R$60, R$120, R$200) e custos operacionais. Apresente em markdown simples.";
    const schema = { type: Type.OBJECT, properties: { estimate: { type: Type.STRING } }, required: ["estimate"]};
     try {
        const response = await getModelResponse(prompt, schema);
        res.json(response);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.get('/testimonials', async (req, res) => {
    const prompt = "Gere 3 depoimentos fictícios de clientes satisfeitos com o serviço de assinatura de bolos BoloFlix. Formato: array de objetos JSON com chaves 'quote', 'author', 'favoriteCake'.";
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
        },
        required: ["testimonials"]
    };
    try {
        const response = await getModelResponse(prompt, schema);
        res.json(response);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.post('/custom-cake-description', async (req, res) => {
    const { base, filling, topping } = req.body;
    const prompt = `Crie um nome criativo e uma descrição curta para um bolo com a seguinte combinação: massa de '${base}', recheio de '${filling}' e cobertura de '${topping}'.`;
    const schema = {
        type: Type.OBJECT,
        properties: {
            cake: {
                type: Type.OBJECT,
                properties: {
                    cakeName: { type: Type.STRING },
                    description: { type: Type.STRING },
                }
            }
        },
        required: ["cake"]
    };
     try {
        const response = await getModelResponse(prompt, schema);
        res.json(response);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});


// --- Inicialização do Servidor ---
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🎂 Servidor da BoloFlix (backend) rodando na porta ${PORT}`);
  console.log('Your service is live 🚀');
  console.log('////////////////////////////////////////////');
  console.log(`Available at your primary URL https://boloflix-backend.onrender.com`);
  console.log('////////////////////////////////////////////');
});

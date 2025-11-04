// ============== BOAS-VINDAS À COZINHA DA BOLOFLIX ==============
// Este é o nosso backend (servidor). Ele é o cérebro que lida com
// a lógica do negócio, se comunica com a IA, salva os pedidos no
// banco de dados e envia os emails.

// --- 1. Importando os Ingredientes Essenciais ---
import express from 'express';
import cors from 'cors';
import { createClient } from '@supabase/supabase-js';
import { GoogleGenAI, Type } from "@google/genai";
import { Resend } from 'resend';

// --- 2. Verificando se Todas as Chaves Secretas Estão no Lugar ---
const requiredEnvVars = [
  'SUPABASE_URL',
  'SUPABASE_KEY',
  'GEMINI_API_KEY',
  'RESEND_API_KEY',
  'ADMIN_PASSWORD',
  'NOTIFICATION_EMAIL',
];

const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingEnvVars.length > 0) {
  console.error(`ERRO: Variáveis de ambiente faltando. Verifique ${missingEnvVars.join(', ')}.`);
  process.exit(1);
}

// --- 3. Configurando as Ferramentas ---
const app = express();
const PORT = process.env.PORT || 10000;
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const resend = new Resend(process.env.RESEND_API_KEY);

// --- 4. Preparando a Cozinha para Receber Pedidos ---
app.use(cors());
app.use(express.json());

// --- 5. Definindo as "Estações de Trabalho" (Rotas/Endpoints) ---

app.get('/', (req, res) => {
  res.send('🎂 Cozinha da BoloFlix está aberta e funcionando!');
});

// --- ROTAS DA INTELIGÊNCIA ARTIFICIAL ---

app.post('/taste-profile', async (req, res) => {
  try {
    const { vibe, moment, fruits } = req.body;
    const prompt = `Com base nestas respostas - Vibe: ${vibe}, Momento: ${moment}, Frutas: ${fruits} - crie um perfil de sabor para um cliente de assinatura de bolos e sugira um tipo de bolo. Responda em JSON com chaves "profileDescription" e "cakeSuggestion".`;
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            profileDescription: { type: Type.STRING },
            cakeSuggestion: { type: Type.STRING },
          },
          required: ["profileDescription", "cakeSuggestion"],
        },
      },
    });
    res.json(JSON.parse(response.text));
  } catch (error) {
    console.error('Erro na rota /taste-profile:', error);
    res.status(500).json({ message: "Erro ao gerar perfil de sabor." });
  }
});

app.get('/investor-pitch', async (req, res) => {
    try {
        const prompt = "Crie um 'elevator pitch' para investidores para a 'BoloFlix', uma startup de assinatura de bolos caseiros com temas mensais. Destaque o modelo de negócio, o mercado-alvo e o potencial de crescimento. Seja conciso e inspirador.";
        const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt });
        res.json({ pitch: response.text });
    } catch (error) {
        console.error('Erro na rota /investor-pitch:', error);
        res.status(500).json({ message: "Erro ao gerar pitch." });
    }
});

app.get('/business-model-canvas', async (req, res) => {
    try {
        const prompt = "Gere um Business Model Canvas para a 'BoloFlix', um serviço de assinatura de bolos. Responda em um formato JSON com as chaves: keyPartners, keyActivities, keyResources, valuePropositions, customerRelationships, channels, customerSegments, costStructure, revenueStreams. Cada chave deve ter um array de strings.";
        const response = await ai.models.generateContent({
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
        console.error('Erro na rota /business-model-canvas:', error);
        res.status(500).json({ message: "Erro ao gerar canvas." });
    }
});

app.get('/financial-estimate', async (req, res) => {
    try {
        const prompt = "Crie uma estimativa financeira simplificada para o primeiro ano da BoloFlix, considerando 3 planos de assinatura (R$60, R$120, R$200) e uma projeção de crescimento de assinantes. Apresente os custos principais e a receita projetada em texto simples.";
        const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt });
        res.json({ estimate: response.text });
    } catch (error) {
        console.error('Erro na rota /financial-estimate:', error);
        res.status(500).json({ message: "Erro ao gerar estimativa financeira." });
    }
});

app.get('/testimonials', async (req, res) => {
    try {
        const prompt = "Crie 3 depoimentos fictícios de clientes satisfeitos com a BoloFlix. Responda em formato JSON, um array de objetos, cada um com as chaves: 'quote' (string), 'author' (string), e 'favoriteCake' (string).";
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            quote: { type: Type.STRING },
                            author: { type: Type.STRING },
                            favoriteCake: { type: Type.STRING },
                        },
                        required: ["quote", "author", "favoriteCake"],
                    }
                },
            },
        });
        res.json({ testimonials: JSON.parse(response.text) });
    } catch (error) {
        console.error('Erro na rota /testimonials:', error);
        res.status(500).json({ message: "Erro ao gerar depoimentos." });
    }
});

app.post('/custom-cake-description', async (req, res) => {
    try {
        const { base, filling, topping } = req.body;
        const prompt = `Crie um nome criativo e uma breve descrição para um bolo com a seguinte combinação: massa de '${base}', recheio de '${filling}', e cobertura de '${topping}'. Responda em JSON com chaves "cakeName" e "description".`;
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        cakeName: { type: Type.STRING },
                        description: { type: Type.STRING },
                    },
                    required: ["cakeName", "description"],
                },
            },
        });
        res.json({ cake: JSON.parse(response.text) });
    } catch (error) {
        console.error('Erro na rota /custom-cake-description:', error);
        res.status(500).json({ message: "Erro ao gerar descrição do bolo." });
    }
});


// --- ROTAS DO PAINEL DE ADMINISTRAÇÃO ---

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
    res.status(500).json({ message: "Erro ao buscar assinaturas." });
  }
});

app.delete('/subscriptions/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { error } = await supabase.from('subscriptions').delete().eq('id', id);
        if (error) throw error;
        res.status(200).json({ message: 'Assinatura excluída com sucesso.' });
    } catch (error) {
        console.error('Erro ao deletar assinatura:', error);
        res.status(500).json({ message: 'Erro ao deletar assinatura.' });
    }
});

app.put('/subscriptions/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { customer_name, flavor_preference, delivery_day, delivery_time } = req.body;
        const { data, error } = await supabase
            .from('subscriptions')
            .update({ customer_name, flavor_preference, delivery_day, delivery_time })
            .eq('id', id)
            .select()
            .single();
        if (error) throw error;
        res.status(200).json({ message: 'Assinatura atualizada com sucesso.', data });
    } catch (error) {
        console.error('Erro ao atualizar assinatura:', error);
        res.status(500).json({ message: 'Erro ao atualizar assinatura.' });
    }
});

app.post('/admin/verify', (req, res) => {
    const { password } = req.body;
    if (password === process.env.ADMIN_PASSWORD) {
        res.status(200).json({ success: true });
    } else {
        res.status(401).json({ success: false });
    }
});


// --- ROTA PRINCIPAL DE NEGÓCIO: CRIAR ASSINATURA ---
app.post('/subscriptions', async (req, res) => {
  try {
    const {
      userId,
      customerName,
      customerEmail,
      planTitle,
      planPrice,
      deliveryDay,
      deliveryTime,
      flavorPreference,
    } = req.body;

    if (!userId) {
      return res.status(400).json({ message: 'ID do usuário é obrigatório para criar uma assinatura.' });
    }
    
    // THE FIX: Explicitly map camelCase from request to snake_case for Supabase
    const { data: subscriptionData, error: supabaseError } = await supabase
      .from('subscriptions')
      .insert({
        user_id: userId,
        customer_name: customerName,
        customer_email: customerEmail,
        plan_title: planTitle,
        plan_price: planPrice,
        delivery_day: deliveryDay,
        delivery_time: deliveryTime,
        flavor_preference: flavorPreference,
      })
      .select()
      .single();

    if (supabaseError) {
      console.error('Erro do Supabase ao salvar assinatura:', supabaseError);
      throw new Error('Falha ao salvar o pedido no banco de dados.');
    }

    // Envio de emails (Admin e Cliente)
    try {
        await resend.emails.send({
            from: 'BoloFlix <onboarding@resend.dev>',
            to: process.env.NOTIFICATION_EMAIL,
            subject: '🎉 Novo Pedido na BoloFlix!',
            html: `<h1>Novo Pedido!</h1><p>Cliente: ${customerName}</p><p>Plano: ${planTitle}</p>`,
        });
        await resend.emails.send({
            from: 'BoloFlix <onboarding@resend.dev>',
            to: customerEmail,
            subject: 'Sua assinatura BoloFlix foi confirmada!',
            html: `<h1>Bem-vindo(a), ${customerName}!</h1><p>Sua assinatura do plano ${planTitle} foi confirmada.</p>`,
        });
    } catch (emailError) {
        console.error("Alerta: Falha ao enviar emails:", emailError);
    }

    res.status(201).json({ message: 'Assinatura criada com sucesso!', data: subscriptionData });

  } catch (error) {
    console.error('Erro geral na rota /subscriptions:', error);
    res.status(500).json({ message: "Erro interno ao processar a assinatura." });
  }
});


// --- 6. Abrindo as Portas da Cozinha ---
app.listen(PORT, () => {
  console.log(`🎂 Servidor da BoloFlix (backend) rodando na porta ${PORT}`);
  console.log(`✨ Your service is live ✨`);
});
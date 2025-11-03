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
// Esta é uma verificação de segurança. Se alguma chave estiver faltando,
// o servidor se recusará a iniciar, nos avisando do problema.
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
  process.exit(1); // Encerra o processo se houver erro.
}

// --- 3. Configurando as Ferramentas ---
const app = express();
const PORT = process.env.PORT || 10000;

// Configuração do Supabase (Nossa Agenda de Pedidos)
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

// Configuração do Gemini AI (Nosso Chef Criativo)
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// Configuração do Resend (Nosso Carteiro Automático)
const resend = new Resend(process.env.RESEND_API_KEY);


// --- 4. Preparando a Cozinha para Receber Pedidos ---
app.use(cors()); // Permite que nosso site (Vercel) converse com a cozinha (Render)
app.use(express.json()); // Permite que a cozinha entenda os pedidos em formato JSON

// --- 5. Definindo as "Estações de Trabalho" (Rotas/Endpoints) ---

// Rota de "Verificação de Saúde": Usada pelo Render para saber se a cozinha está aberta.
app.get('/', (req, res) => {
  res.send('🎂 Cozinha da BoloFlix está aberta e funcionando!');
});

// --- ROTAS DA INTELIGÊNCIA ARTIFICIAL ---

// Gera o perfil de sabor do cliente
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

// Verifica a disponibilidade de entrega
app.post('/check-availability', async (req, res) => {
    try {
        const { day, time } = req.body;
        const prompt = `Simule uma verificação de logística. Para o dia ${day} no período da ${time}, verifique se há disponibilidade de entrega. Responda em JSON com as chaves "available" (boolean) e "message" (string amigável). Para este teste, sempre retorne 'true' para quartas e sextas.`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        available: { type: Type.BOOLEAN },
                        message: { type: Type.STRING },
                    },
                    required: ["available", "message"],
                },
            },
        });
        
        res.json(JSON.parse(response.text));
    } catch (error) {
        console.error('Erro na rota /check-availability:', error);
        res.status(500).json({ message: "Erro ao verificar disponibilidade." });
    }
});


// --- ROTAS DO PAINEL DE ADMINISTRAÇÃO ---

// Rota para buscar todas as assinaturas
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

// Rota para deletar uma assinatura
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

// Rota para atualizar uma assinatura
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


// Rota para verificar a senha do admin
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
    // 1. Extrai e traduz os dados do pedido
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
    
    // 2. Salva na "Agenda" (Supabase)
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
      console.error('Erro do Supabase:', supabaseError);
      throw new Error('Falha ao salvar o pedido no banco de dados.');
    }

    // 3. Envia Email de Notificação para o Administrador (VOCÊ)
    try {
        await resend.emails.send({
            from: 'BoloFlix <onboarding@resend.dev>',
            to: process.env.NOTIFICATION_EMAIL,
            subject: '🎉 Novo Pedido na BoloFlix!',
            html: `
              <div style="font-family: sans-serif; padding: 20px; color: #333;">
                <h1>🎉 Novo Pedido!</h1>
                <p>Um novo cliente acaba de assinar um plano. Prepare o forno!</p>
                <hr>
                <h2>Detalhes do Pedido</h2>
                <ul>
                  <li><strong>Nome do Cliente:</strong> ${customerName}</li>
                  <li><strong>Email do Cliente:</strong> ${customerEmail}</li>
                  <li><strong>Plano:</strong> ${planTitle} (R$ ${planPrice.toFixed(2)})</li>
                  <li><strong>Preferência:</strong> ${flavorPreference || 'Não especificada'}</li>
                  <li><strong>Entrega:</strong> ${deliveryDay}, ${deliveryTime}</li>
                  <li><strong>Data do Pedido:</strong> ${new Date(subscriptionData.created_at).toLocaleDateString('pt-BR')}</li>
                </ul>
                <hr>
                <p>Para gerenciar este e outros pedidos, acesse o seu <a href="https://boloflix.vercel.app/admin">Painel de Administrador</a>.</p>
              </div>
            `,
        });
    } catch (emailError) {
        console.error("Alerta: Falha ao enviar email de notificação para o admin:", emailError);
        // Não paramos o processo, a assinatura do cliente é mais importante.
    }
    
    // 4. Envia Email de Confirmação para o Cliente
    try {
        await resend.emails.send({
            from: 'BoloFlix <onboarding@resend.dev>',
            to: customerEmail,
            subject: 'Bem-vindo(a) à Família BoloFlix!',
            html: `
              <div style="font-family: sans-serif; padding: 20px; color: #333;">
                <h1>Bem-vindo(a), ${customerName}!</h1>
                <p>Sua assinatura do plano <strong>${planTitle}</strong> foi confirmada com sucesso. Estamos muito felizes em ter você na nossa família!</p>
                <h3>Resumo da sua Assinatura:</h3>
                <ul>
                  <li><strong>Plano:</strong> ${planTitle} (R$ ${planPrice.toFixed(2)}/mês)</li>
                  <li><strong>Sua entrega será toda:</strong> ${deliveryDay}, no período da ${deliveryTime}</li>
                </ul>
                <p>Prepare-se para receber muito carinho em forma de bolo!</p>
                <br>
                <p>Com amor,</p>
                <p><strong>Equipe BoloFlix & Quintal dos Kitutes</strong></p>
              </div>
            `,
        });
    } catch (emailError) {
        console.error(`Alerta: Falha ao enviar email de confirmação para o cliente ${customerEmail}:`, emailError);
    }


    // 5. Responde para o site que deu tudo certo
    res.status(201).json({ message: 'Assinatura criada com sucesso!', data: subscriptionData });

  } catch (error) {
    console.error('Erro na rota /subscriptions:', error);
    res.status(500).json({ message: "Erro interno ao processar a assinatura." });
  }
});


// --- 6. Abrindo as Portas da Cozinha ---
app.listen(PORT, () => {
  console.log(`🎂 Servidor da BoloFlix (backend) rodando na porta ${PORT}`);
  console.log(`✨ Your service is live ✨`);
  console.log(`//////////////////////////////////////////////`);
  console.log(`Available at your primary URL https://boloflix-backend.onrender.com`);
  console.log(`//////////////////////////////////////////////`);
});

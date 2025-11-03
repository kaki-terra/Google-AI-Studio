const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
const { GoogleGenAI, Type } = require('@google/genai');
const { Resend } = require('resend');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3001;

// --- Initialize Clients ---
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const geminiApiKey = process.env.GEMINI_API_KEY;
const resendApiKey = process.env.RESEND_API_KEY;
const adminPassword = process.env.ADMIN_PASSWORD;
const notificationEmail = process.env.NOTIFICATION_EMAIL;

let supabase, ai, resend;

try {
    if (!supabaseUrl || !supabaseKey) throw new Error("Supabase credentials missing");
    supabase = createClient(supabaseUrl, supabaseKey);

    if (!geminiApiKey) throw new Error("Gemini API key missing");
    ai = new GoogleGenAI({ apiKey: geminiApiKey });

    if (!resendApiKey) throw new Error("Resend API key missing");
    resend = new Resend(resendApiKey);

} catch (error) {
    console.error("Failed to initialize clients:", error.message);
    // Exit gracefully if essential clients fail to initialize
    process.exit(1);
}


// --- API Routes ---

app.get('/', (req, res) => {
  res.send('🎂 Cozinha da BoloFlix está aberta e funcionando!');
});

// --- Subscription Management ---

app.post('/subscriptions', async (req, res) => {    
    const { 
        customerName, 
        planTitle, 
        planPrice,
        flavorPreference,
        deliveryDay,
        deliveryTime,
        customerEmail 
    } = req.body;

    if (!customerName || !planTitle || !planPrice || !customerEmail) {
        return res.status(400).json({ message: 'Dados incompletos para a assinatura.' });
    }

    try {
        const { data: subscriptionData, error: dbError } = await supabase
            .from('subscriptions')
            .insert([{ 
                customer_name: customerName,
                plan_title: planTitle,
                plan_price: planPrice,
                flavor_preference: flavorPreference,
                delivery_day: deliveryDay,
                delivery_time: deliveryTime,
                customer_email: customerEmail
             }])
            .select()
            .single();

        if (dbError) {
            console.error('Supabase error:', dbError);
            throw new Error('Erro ao salvar a assinatura no banco de dados.');
        }

        // Send notification email to admin (fire-and-forget)
        if(notificationEmail) {
            resend.emails.send({
                from: 'BoloFlix <onboarding@resend.dev>',
                to: notificationEmail,
                subject: '🎉 Novo Pedido na BoloFlix!',
                html: `<h1>Novo Pedido!</h1><p>Um novo cliente acaba de assinar um plano. Prepare o forno!</p>
                       <h2>Detalhes do Pedido</h2>
                       <ul>
                         <li><strong>Nome do Cliente:</strong> ${customerName}</li>
                         <li><strong>Plano:</strong> ${planTitle} (R$ ${planPrice.toFixed(2)})</li>
                         <li><strong>Preferência:</strong> ${flavorPreference || 'Não especificada'}</li>
                         <li><strong>Entrega:</strong> ${deliveryDay}, ${deliveryTime}</li>
                         <li><strong>Email do Cliente:</strong> ${customerEmail}</li>
                         <li><strong>Data do Pedido:</strong> ${new Date(subscriptionData.created_at).toLocaleDateString('pt-BR')}</li>
                       </ul>
                       <p>Para gerenciar este e outros pedidos, acesse o seu <a href="https://boloflix.vercel.app/admin">Painel de Administrador</a>.</p>`,
            }).catch(err => console.error("Failed to send admin email:", err));
        }
        
        // Send confirmation email to customer
        resend.emails.send({
            from: 'BoloFlix <onboarding@resend.dev>',
            to: customerEmail,
            subject: 'Bem-vindo(a) à família BoloFlix! 🎉',
            html: `<h1>Sua assinatura foi confirmada!</h1>
                   <p>Olá ${customerName},</p>
                   <p>Que alegria ter você na nossa família! Sua assinatura do plano <strong>${planTitle}</strong> foi confirmada com sucesso.</p>
                   <h2>Resumo do seu pedido:</h2>
                   <ul>
                     <li><strong>Plano:</strong> ${planTitle} (R$ ${planPrice.toFixed(2)})</li>
                     <li><strong>Preferência de Sabor:</strong> ${flavorPreference || 'Não especificada'}</li>
                     <li><strong>Sua entrega semanal será:</strong> ${deliveryDay}, período da ${deliveryTime}</li>
                   </ul>
                   <p>Prepare-se para receber um pedacinho de felicidade em sua casa. Em breve, você receberá mais detalhes sobre sua primeira entrega.</p>
                   <p>Com carinho,<br>Equipe BoloFlix</p>`,
        }).catch(err => console.error("Failed to send customer email:", err));

        res.status(201).json({ message: 'Assinatura criada com sucesso!', data: subscriptionData });

    } catch (error) {
        console.error('Error processing subscription:', error);
        res.status(500).json({ message: 'Erro interno ao processar a assinatura.' });
    }
});


app.get('/subscriptions', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('subscriptions')
            .select('*')
            .order('created_at', { ascending: false });
        if (error) throw error;
        res.status(200).json(data);
    } catch (error) {
        console.error('Error fetching subscriptions:', error);
        res.status(500).json({ message: 'Erro ao buscar assinaturas.' });
    }
});


app.delete('/subscriptions/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const { error } = await supabase
            .from('subscriptions')
            .delete()
            .eq('id', id);
        if (error) throw error;
        res.status(200).json({ message: 'Assinatura excluída com sucesso.' });
    } catch (error) {
        console.error('Error deleting subscription:', error);
        res.status(500).json({ message: 'Erro ao excluir assinatura.' });
    }
});


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
        res.status(200).json({ message: 'Assinatura atualizada com sucesso.', data });
    } catch (error) {
        console.error('Error updating subscription:', error);
        res.status(500).json({ message: 'Erro ao atualizar assinatura.' });
    }
});

// --- Admin Security ---
app.post('/admin/verify', (req, res) => {
    const { password } = req.body;
    if (password && password === adminPassword) {
        res.status(200).json({ success: true });
    } else {
        res.status(401).json({ success: false });
    }
});


// --- AI Routes ---

app.post('/taste-profile', async (req, res) => {
    const { vibe, moment, fruits } = req.body;
    const prompt = `Crie um perfil de sabor para um cliente de assinatura de bolos. O cliente respondeu o seguinte quiz: Vibe de bolo: "${vibe}", Momento perfeito: "${moment}", Frutas no bolo: "${fruits}". Retorne um JSON com duas chaves: "profileDescription" (um parágrafo curto e divertido descrevendo o perfil) e "cakeSuggestion" (o nome de um bolo que combina com o perfil).`;
    
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        profileDescription: { type: Type.STRING },
                        cakeSuggestion: { type: Type.STRING },
                    },
                    required: ['profileDescription', 'cakeSuggestion'],
                },
            },
        });
        res.json(JSON.parse(response.text));
    } catch (error) {
        console.error('AI Error (taste-profile):', error);
        res.status(500).json({ message: 'Erro na cozinha da IA ao gerar seu perfil.' });
    }
});

app.post('/investor-pitch', async (req, res) => {
    const prompt = "Gere um 'elevator pitch' (apresentação de elevador) conciso e empolgante para a 'BoloFlix', uma startup de assinatura de bolos caseiros com temas mensais. O tom deve ser moderno, amigável e focado na experiência do cliente. Formate em markdown.";
    try {
        const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt });
        res.json({ pitch: response.text });
    } catch (error) {
        console.error('AI Error (investor-pitch):', error);
        res.status(500).json({ message: 'Erro ao gerar pitch.' });
    }
});

app.get('/business-model-canvas', async (req, res) => {
    const prompt = "Gere um Business Model Canvas para a 'BoloFlix', uma startup de assinatura de bolos caseiros. Retorne um JSON com as chaves: keyPartners, keyActivities, keyResources, valuePropositions, customerRelationships, channels, customerSegments, costStructure, revenueStreams. Cada chave deve ter um array de strings.";
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: { responseMimeType: 'application/json' }
        });
        res.json({ canvas: JSON.parse(response.text) });
    } catch (error) {
        console.error('AI Error (business-model-canvas):', error);
        res.status(500).json({ message: 'Erro ao gerar canvas.' });
    }
});

app.get('/financial-estimate', async (req, res) => {
    const prompt = "Gere uma estimativa financeira simplificada para o primeiro ano da 'BoloFlix', considerando os três planos (Curioso R$60, Apaixonado R$120, Família R$200). Projete uma base de clientes inicial e um crescimento mensal conservador. Apresente custos fixos (marketing, embalagens) e variáveis. Finalize com uma projeção de receita e lucro líquido. Formate em markdown.";
    try {
        const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt });
        res.json({ estimate: response.text });
    } catch (error) {
        console.error('AI Error (financial-estimate):', error);
        res.status(500).json({ message: 'Erro ao gerar estimativa.' });
    }
});

app.get('/testimonials', async (req, res) => {
    const prompt = "Gere 3 depoimentos fictícios de clientes satisfeitos da 'BoloFlix'. Crie nomes, bolos favoritos e frases curtas e calorosas. Retorne um array de objetos JSON, cada um com as chaves 'quote', 'author', 'favoriteCake'.";
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: { responseMimeType: 'application/json' }
        });
        res.json({ testimonials: JSON.parse(response.text) });
    } catch (error) {
        console.error('AI Error (testimonials):', error);
        res.status(500).json({ message: 'Erro ao gerar depoimentos.' });
    }
});

app.post('/custom-cake-description', async (req, res) => {
    const { base, filling, topping } = req.body;
    const prompt = `Crie um nome criativo e uma descrição curta e deliciosa para um bolo com a seguinte combinação: massa de '${base}', recheio de '${filling}', e cobertura de '${topping}'. Retorne um objeto JSON com as chaves 'cakeName' e 'description'.`;
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: { responseMimeType: 'application/json' }
        });
        res.json({ cake: JSON.parse(response.text) });
    } catch (error) {
        console.error('AI Error (custom-cake):', error);
        res.status(500).json({ message: 'Erro ao gerar bolo customizado.' });
    }
});


// --- Start Server ---

app.listen(PORT, () => {
  console.log(`🎂 Servidor da BoloFlix (backend) rodando na porta ${PORT}`);
  console.log('✨ Your service is live ✨');
});
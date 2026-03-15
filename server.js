/**
 * FUNDAMENTAL — Servidor Proxy Seguro
 * Mantém a chave API do Airtable protegida no servidor.
 * Usuários fazem login com usuario+senha, sem nunca ver a chave.
 *
 * Para rodar localmente:  node server.js
 * Para Render.com: defina as variáveis de ambiente abaixo
 */

const express = require('express');
const cors    = require('cors');
const fetch   = require('node-fetch');

const app  = express();
const PORT = process.env.PORT || 3000;

// ─── VARIÁVEIS DE AMBIENTE (configure no Render.com) ───────────────────────
const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY || 'SUA_CHAVE_AQUI';
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID || 'appxCfXX90LCvonjK';
// ────────────────────────────────────────────────────────────────────────────

app.use(cors());
app.use(express.json());
app.use(express.static('public')); // serve o dashboard.html

// ─── TABELA DE USUÁRIOS ─────────────────────────────────────────────────────
// Esta lista é gerada automaticamente e pode ser substituída pela tabela
// USUARIOS do Airtable (o servidor busca automaticamente se a tabela existir).
// Para desativar um usuário: mude "ativo" para false no Airtable.

const USERS_FALLBACK = [
  // GESTÃO (10 usuários)
  { usuario: "gestao01", senha: "UaonY1Z9", perfil: "gestao", nome: "Gestão 01", ativo: true },
  { usuario: "gestao02", senha: "WR8mKnfc", perfil: "gestao", nome: "Gestão 02", ativo: true },
  { usuario: "gestao03", senha: "LozN58Re", perfil: "gestao", nome: "Gestão 03", ativo: true },
  { usuario: "gestao04", senha: "7zKt54sc", perfil: "gestao", nome: "Gestão 04", ativo: true },
  { usuario: "gestao05", senha: "60k4Zp6I", perfil: "gestao", nome: "Gestão 05", ativo: true },
  { usuario: "gestao06", senha: "8XLc8FOs", perfil: "gestao", nome: "Gestão 06", ativo: true },
  { usuario: "gestao07", senha: "ErJWEw6N", perfil: "gestao", nome: "Gestão 07", ativo: true },
  { usuario: "gestao08", senha: "0JBgoZia", perfil: "gestao", nome: "Gestão 08", ativo: true },
  { usuario: "gestao09", senha: "Bv3Me6L6", perfil: "gestao", nome: "Gestão 09", ativo: true },
  { usuario: "gestao10", senha: "FbOeL51w", perfil: "gestao", nome: "Gestão 10", ativo: true },
  // FUNCIONÁRIOS (30 usuários)
  { usuario: "func01",   senha: "F1xtnSMa", perfil: "funcionarios", nome: "Funcionário 01", ativo: true },
  { usuario: "func02",   senha: "JT8sEEvC", perfil: "funcionarios", nome: "Funcionário 02", ativo: true },
  { usuario: "func03",   senha: "g1bfFTpV", perfil: "funcionarios", nome: "Funcionário 03", ativo: true },
  { usuario: "func04",   senha: "oFW7MAQe", perfil: "funcionarios", nome: "Funcionário 04", ativo: true },
  { usuario: "func05",   senha: "ikBwOs23", perfil: "funcionarios", nome: "Funcionário 05", ativo: true },
  { usuario: "func06",   senha: "i4dCh9Bh", perfil: "funcionarios", nome: "Funcionário 06", ativo: true },
  { usuario: "func07",   senha: "2U4zgeDk", perfil: "funcionarios", nome: "Funcionário 07", ativo: true },
  { usuario: "func08",   senha: "J9stZcSo", perfil: "funcionarios", nome: "Funcionário 08", ativo: true },
  { usuario: "func09",   senha: "ZewTu0Y2", perfil: "funcionarios", nome: "Funcionário 09", ativo: true },
  { usuario: "func10",   senha: "gD0kDGgv", perfil: "funcionarios", nome: "Funcionário 10", ativo: true },
  { usuario: "func11",   senha: "n8lVkOky", perfil: "funcionarios", nome: "Funcionário 11", ativo: true },
  { usuario: "func12",   senha: "jKxrP8W7", perfil: "funcionarios", nome: "Funcionário 12", ativo: true },
  { usuario: "func13",   senha: "O1jDaHtq", perfil: "funcionarios", nome: "Funcionário 13", ativo: true },
  { usuario: "func14",   senha: "R0f6I3Ja", perfil: "funcionarios", nome: "Funcionário 14", ativo: true },
  { usuario: "func15",   senha: "E7DKuXxp", perfil: "funcionarios", nome: "Funcionário 15", ativo: true },
  { usuario: "func16",   senha: "mSc50lNn", perfil: "funcionarios", nome: "Funcionário 16", ativo: true },
  { usuario: "func17",   senha: "awgj2Hvr", perfil: "funcionarios", nome: "Funcionário 17", ativo: true },
  { usuario: "func18",   senha: "2rTIRpFg", perfil: "funcionarios", nome: "Funcionário 18", ativo: true },
  { usuario: "func19",   senha: "9FlLHRt6", perfil: "funcionarios", nome: "Funcionário 19", ativo: true },
  { usuario: "func20",   senha: "QWOFbk2z", perfil: "funcionarios", nome: "Funcionário 20", ativo: true },
  { usuario: "func21",   senha: "fUxHD7ts", perfil: "funcionarios", nome: "Funcionário 21", ativo: true },
  { usuario: "func22",   senha: "s5C1mMSY", perfil: "funcionarios", nome: "Funcionário 22", ativo: true },
  { usuario: "func23",   senha: "nTBJ37cO", perfil: "funcionarios", nome: "Funcionário 23", ativo: true },
  { usuario: "func24",   senha: "Sd3DkzJA", perfil: "funcionarios", nome: "Funcionário 24", ativo: true },
  { usuario: "func25",   senha: "WtY1YPpM", perfil: "funcionarios", nome: "Funcionário 25", ativo: true },
  { usuario: "func26",   senha: "Qo2KOBWh", perfil: "funcionarios", nome: "Funcionário 26", ativo: true },
  { usuario: "func27",   senha: "IHYyJ1Sw", perfil: "funcionarios", nome: "Funcionário 27", ativo: true },
  { usuario: "func28",   senha: "Ne5upMvu", perfil: "funcionarios", nome: "Funcionário 28", ativo: true },
  { usuario: "func29",   senha: "X719aYH6", perfil: "funcionarios", nome: "Funcionário 29", ativo: true },
  { usuario: "func30",   senha: "UD254IzQ", perfil: "funcionarios", nome: "Funcionário 30", ativo: true },
  // PROFESSORES (60 usuários)
  { usuario: "prof01",   senha: "EdyD0h41", perfil: "professores", nome: "Professor 01", ativo: true },
  { usuario: "prof02",   senha: "VZ3u5ieS", perfil: "professores", nome: "Professor 02", ativo: true },
  { usuario: "prof03",   senha: "2Hu8H94B", perfil: "professores", nome: "Professor 03", ativo: true },
  { usuario: "prof04",   senha: "j3uf5VqT", perfil: "professores", nome: "Professor 04", ativo: true },
  { usuario: "prof05",   senha: "2gEKuzqJ", perfil: "professores", nome: "Professor 05", ativo: true },
  { usuario: "prof06",   senha: "EZXLM4eL", perfil: "professores", nome: "Professor 06", ativo: true },
  { usuario: "prof07",   senha: "g3CwGreR", perfil: "professores", nome: "Professor 07", ativo: true },
  { usuario: "prof08",   senha: "RBkCzgz5", perfil: "professores", nome: "Professor 08", ativo: true },
  { usuario: "prof09",   senha: "DER84FsP", perfil: "professores", nome: "Professor 09", ativo: true },
  { usuario: "prof10",   senha: "AcT357j2", perfil: "professores", nome: "Professor 10", ativo: true },
  { usuario: "prof11",   senha: "EF262ii5", perfil: "professores", nome: "Professor 11", ativo: true },
  { usuario: "prof12",   senha: "7R1zx7Ng", perfil: "professores", nome: "Professor 12", ativo: true },
  { usuario: "prof13",   senha: "W8J8Zg8s", perfil: "professores", nome: "Professor 13", ativo: true },
  { usuario: "prof14",   senha: "i43UFKAZ", perfil: "professores", nome: "Professor 14", ativo: true },
  { usuario: "prof15",   senha: "bIW57uqT", perfil: "professores", nome: "Professor 15", ativo: true },
  { usuario: "prof16",   senha: "eQpsE6Cl", perfil: "professores", nome: "Professor 16", ativo: true },
  { usuario: "prof17",   senha: "v9BHinUx", perfil: "professores", nome: "Professor 17", ativo: true },
  { usuario: "prof18",   senha: "P08lK1lC", perfil: "professores", nome: "Professor 18", ativo: true },
  { usuario: "prof19",   senha: "DKvb9hs2", perfil: "professores", nome: "Professor 19", ativo: true },
  { usuario: "prof20",   senha: "Aoe58nwm", perfil: "professores", nome: "Professor 20", ativo: true },
  { usuario: "prof21",   senha: "HrwU6ipZ", perfil: "professores", nome: "Professor 21", ativo: true },
  { usuario: "prof22",   senha: "xlWL8e7T", perfil: "professores", nome: "Professor 22", ativo: true },
  { usuario: "prof23",   senha: "kDLe3u74", perfil: "professores", nome: "Professor 23", ativo: true },
  { usuario: "prof24",   senha: "H1c4W1Pf", perfil: "professores", nome: "Professor 24", ativo: true },
  { usuario: "prof25",   senha: "NjL0VkUZ", perfil: "professores", nome: "Professor 25", ativo: true },
  { usuario: "prof26",   senha: "4li061AO", perfil: "professores", nome: "Professor 26", ativo: true },
  { usuario: "prof27",   senha: "RZ8BFdy7", perfil: "professores", nome: "Professor 27", ativo: true },
  { usuario: "prof28",   senha: "nN0aF5Ah", perfil: "professores", nome: "Professor 28", ativo: true },
  { usuario: "prof29",   senha: "V05MVGha", perfil: "professores", nome: "Professor 29", ativo: true },
  { usuario: "prof30",   senha: "Bbr27mdV", perfil: "professores", nome: "Professor 30", ativo: true },
  { usuario: "prof31",   senha: "zBcRF9Wo", perfil: "professores", nome: "Professor 31", ativo: true },
  { usuario: "prof32",   senha: "ruC8FhVj", perfil: "professores", nome: "Professor 32", ativo: true },
  { usuario: "prof33",   senha: "Rf4k8VXh", perfil: "professores", nome: "Professor 33", ativo: true },
  { usuario: "prof34",   senha: "TxFR4QgI", perfil: "professores", nome: "Professor 34", ativo: true },
  { usuario: "prof35",   senha: "2vT6lkOJ", perfil: "professores", nome: "Professor 35", ativo: true },
  { usuario: "prof36",   senha: "VKQiYz87", perfil: "professores", nome: "Professor 36", ativo: true },
  { usuario: "prof37",   senha: "K0xlvmLe", perfil: "professores", nome: "Professor 37", ativo: true },
  { usuario: "prof38",   senha: "zNwxG0DB", perfil: "professores", nome: "Professor 38", ativo: true },
  { usuario: "prof39",   senha: "KrDAY0FQ", perfil: "professores", nome: "Professor 39", ativo: true },
  { usuario: "prof40",   senha: "mooa8RlB", perfil: "professores", nome: "Professor 40", ativo: true },
  { usuario: "prof41",   senha: "bnAOJ99t", perfil: "professores", nome: "Professor 41", ativo: true },
  { usuario: "prof42",   senha: "vLuzWJ2C", perfil: "professores", nome: "Professor 42", ativo: true },
  { usuario: "prof43",   senha: "n7362wWA", perfil: "professores", nome: "Professor 43", ativo: true },
  { usuario: "prof44",   senha: "8wSgvlMH", perfil: "professores", nome: "Professor 44", ativo: true },
  { usuario: "prof45",   senha: "EOmAn5vP", perfil: "professores", nome: "Professor 45", ativo: true },
  { usuario: "prof46",   senha: "WqLFdq44", perfil: "professores", nome: "Professor 46", ativo: true },
  { usuario: "prof47",   senha: "Vp16kS34", perfil: "professores", nome: "Professor 47", ativo: true },
  { usuario: "prof48",   senha: "0wHcIOrz", perfil: "professores", nome: "Professor 48", ativo: true },
  { usuario: "prof49",   senha: "cst6tBxu", perfil: "professores", nome: "Professor 49", ativo: true },
  { usuario: "prof50",   senha: "qY6akbq5", perfil: "professores", nome: "Professor 50", ativo: true },
  { usuario: "prof51",   senha: "yeTo27Bn", perfil: "professores", nome: "Professor 51", ativo: true },
  { usuario: "prof52",   senha: "ViJ9mE8b", perfil: "professores", nome: "Professor 52", ativo: true },
  { usuario: "prof53",   senha: "n64FmpiG", perfil: "professores", nome: "Professor 53", ativo: true },
  { usuario: "prof54",   senha: "bLPV2ruf", perfil: "professores", nome: "Professor 54", ativo: true },
  { usuario: "prof55",   senha: "7IERGd4d", perfil: "professores", nome: "Professor 55", ativo: true },
  { usuario: "prof56",   senha: "1kG5RjZY", perfil: "professores", nome: "Professor 56", ativo: true },
  { usuario: "prof57",   senha: "advEN1q4", perfil: "professores", nome: "Professor 57", ativo: true },
  { usuario: "prof58",   senha: "SsHfSOj9", perfil: "professores", nome: "Professor 58", ativo: true },
  { usuario: "prof59",   senha: "NTeYI0oE", perfil: "professores", nome: "Professor 59", ativo: true },
  { usuario: "prof60",   senha: "9bVxGnX6", perfil: "professores", nome: "Professor 60", ativo: true },
];

// Cache de usuários (recarrega do Airtable a cada 5 minutos se tabela existir)
let usersCache = null;
let usersCacheTime = 0;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutos

async function getUsers() {
  const now = Date.now();
  if (usersCache && (now - usersCacheTime) < CACHE_TTL) {
    return usersCache;
  }
  // Tenta carregar da tabela USUARIOS no Airtable
  try {
    const res = await fetch(
      `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/USUARIOS?pageSize=200`,
      { headers: { Authorization: `Bearer ${AIRTABLE_API_KEY}` } }
    );
    if (res.ok) {
      const data = await res.json();
      if (data.records && data.records.length > 0) {
        usersCache = data.records.map(r => ({
          usuario: (r.fields['USUARIO'] || '').toLowerCase().trim(),
          senha:   (r.fields['SENHA']   || '').trim(),
          perfil:  (r.fields['PERFIL']  || '').toLowerCase().trim(),
          nome:    (r.fields['NOME']    || ''),
          ativo:   r.fields['ATIVO'] !== false, // checkbox: se vazio = ativo
        })).filter(u => u.usuario && u.senha);
        usersCacheTime = now;
        console.log(`✅ ${usersCache.length} usuários carregados do Airtable`);
        return usersCache;
      }
    }
  } catch (e) {
    console.log('ℹ️  Tabela USUARIOS não encontrada no Airtable, usando lista local.');
  }
  // Fallback para lista local
  usersCache = USERS_FALLBACK;
  usersCacheTime = now;
  return usersCache;
}

// ─── ROTAS ──────────────────────────────────────────────────────────────────

// POST /login — autentica usuário
app.post('/login', async (req, res) => {
  const { usuario, senha } = req.body;
  if (!usuario || !senha) {
    return res.status(400).json({ ok: false, error: 'Campos obrigatórios.' });
  }
  const users = await getUsers();
  const user = users.find(
    u => u.usuario === usuario.toLowerCase().trim() && u.senha === senha.trim()
  );
  if (!user) {
    return res.status(401).json({ ok: false, error: 'Usuário ou senha incorretos.' });
  }
  if (!user.ativo) {
    return res.status(403).json({ ok: false, error: 'Acesso desativado. Fale com o administrador.' });
  }
  // Token simples: base64 com expiração de 8h (não é JWT, mas suficiente para uso interno)
  const payload = {
    usuario: user.usuario,
    perfil:  user.perfil,
    nome:    user.nome,
    exp:     Date.now() + 8 * 60 * 60 * 1000
  };
  const token = Buffer.from(JSON.stringify(payload)).toString('base64');
  res.json({ ok: true, token, perfil: user.perfil, nome: user.nome });
});

// Middleware de autenticação para rotas protegidas
function auth(req, res, next) {
  const token = req.headers['x-token'];
  if (!token) return res.status(401).json({ error: 'Sem token.' });
  try {
    const payload = JSON.parse(Buffer.from(token, 'base64').toString('utf8'));
    if (payload.exp < Date.now()) return res.status(401).json({ error: 'Sessão expirada.' });
    req.user = payload;
    next();
  } catch {
    res.status(401).json({ error: 'Token inválido.' });
  }
}

// GET /api/data/:tableId — proxy seguro para o Airtable
app.get('/api/data/:tableId', auth, async (req, res) => {
  const { tableId } = req.params;
  const { offset } = req.query;

  // Tabelas permitidas (segurança: não expõe tabelas aleatórias)
  const ALLOWED = [
    'tbl4FQhYGu8NFYnZs', // PEI 2024
    'tblKcFjBKyQYPew8i', // PEI CHAMADA
    'tblauVUoBX2zlFDaW', // TECNOLOGIA
    'PEI 2024',
    'PEI CHAMADA',
    'TECNOLOGIA',
  ];
  if (!ALLOWED.includes(tableId)) {
    return res.status(403).json({ error: 'Tabela não permitida.' });
  }

  const url = new URL(`https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${encodeURIComponent(tableId)}`);
  url.searchParams.set('pageSize', '100');
  if (offset) url.searchParams.set('offset', offset);

  try {
    const r = await fetch(url.toString(), {
      headers: { Authorization: `Bearer ${AIRTABLE_API_KEY}` }
    });
    const data = await r.json();
    res.status(r.status).json(data);
  } catch (e) {
    res.status(500).json({ error: 'Erro ao acessar Airtable.' });
  }
});

// Health check
app.get('/health', (_, res) => res.json({ ok: true, time: new Date().toISOString() }));

app.listen(PORT, () => {
  console.log(`\n🏫 FUNDAMENTAL Proxy rodando na porta ${PORT}`);
  console.log(`   Base Airtable: ${AIRTABLE_BASE_ID}`);
  console.log(`   Chave API: ${AIRTABLE_API_KEY ? '✅ configurada' : '❌ NÃO configurada!'}\n`);
});

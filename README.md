# 🏎️ WSA Veículos - Plataforma Vitrine & Proteção de Comissões

Plataforma de alta conversão desenvolvida para a concessionária **WSA Veículos** (WSA Comércio de Veículos Ltda - CNPJ 52.255.211/0001-79), localizada na Tv. Alferes Costa, 486 – Sacramenta, Belém/PA.

---

## 🌟 Funcionalidades Principais

### 1. Vitrine de Alta Conversão (Dark Automotive Showroom)
- Design imersivo inspirado no showroom físico da WSA (`#0B0B0E`, Vermelho Esportivo `#E11D23` e iluminação LED).
- Filtros instantâneos por marca (Honda, Toyota, Chevrolet, Hyundai, Jeep, BMW), preço, busca textual e selo **Black Friday**.
- Ficha técnica completa de cada seminovo com cálculo automático de parcelas e entrada sugerida.
- Mapa interativo com rotas para a loja na Travessa Alferes Costa, 486 (Belém/PA).

### 2. Engenharia Anti-Fraude & Proteção de Comissões (R$ 1.000 / venda)
- **Zero Vazamento:** Nenhum visitante é enviado diretamente ao WhatsApp sem identificação prévia.
- **Micro-Conversão Obrigatória:** O cliente informa Nome e WhatsApp em menos de 5 segundos.
- **Código Inviolável de Lead:** Geração instantânea de identificador único (ex: `WSA-8421`) gravado atômica e permanentemente no banco.
- **Rastreamento de Tráfego:** Persistência automática de parâmetros `utm_source`, `utm_medium`, `utm_campaign`, `utm_term` e `referrer`.
- **Disparo Seguro WhatsApp:** Abertura do WhatsApp oficial (`(91) 98470-6312`) com mensagem pré-formatada contendo o código do lead e dados do carro pretendido.

### 3. Captação Ativa & Serviços
- **Até 90% da Tabela FIPE (`/fipe-troca`):** Calculadora e captação para troca de usados.
- **Car Hunter (`/encomenda`):** Pedidos sob medida caso o veículo não esteja no pátio.
- **Consignação Segura:** Avaliação justa e credibilidade associada à **ASSOVEPA**.

### 4. Painel Administrativo do Lojista (`/admin`)
- **Dashboard:** KPIs de estoque, leads capturados, valor total de comissões em aberto e confirmadas.
- **Gestão de Estoque (`/admin/estoque`):** Cadastro, edição, alteração de status (*Disponível*, *Reservado*, *Vendido*) e toggles de Black Friday / Destaque.
- **Auditoria de Leads (`/admin/leads`):** Busca instantânea por código `WSA-XXXX`, conciliação com vendedores da loja física e liquidação de comissões.

---

## 🛠️ Stack Tecnológica

- **Framework:** Next.js 14 (App Router, TypeScript)
- **Estilização:** Tailwind CSS (Custom Dark Palette & Glows)
- **Ícones:** Lucide React
- **Banco & Segurança:** Supabase PostgreSQL com Row Level Security (RLS) + Store Local híbrido tolerante a falhas.

---

## 🚀 Como Executar o Projeto

### Pré-requisitos
- Node.js 18+ instalado

### Instalação e Execução
```bash
# 1. Instalar dependências (caso ainda não estejam instaladas)
npm install

# 2. Iniciar servidor de desenvolvimento
npm run dev

# 3. Compilar para produção
npm run build
npm run start
```
Acesse [http://localhost:3000](http://localhost:3000) no seu navegador.

### Credenciais de Acesso Administrativo
- **URL:** [http://localhost:3000/admin/login](http://localhost:3000/admin/login)
- **E-mail:** `admin@wsaveiculos.com.br`
- **Senha:** `wsa2024` (ou `admin123`)

---

## 🗄️ Integração com Supabase (Opcional)

Para conectar a um banco Supabase em nuvem:
1. Execute o script `database.sql` no SQL Editor do seu projeto Supabase.
2. Copie o arquivo `.env.example` para `.env.local` e preencha:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anon-publica
   NEXT_PUBLIC_WSA_WHATSAPP=5591984706312
   ```
Mesmo sem credenciais configuradas, a plataforma funciona 100% no modo local com persistência via LocalStorage e seed data realista dos carros da WSA!

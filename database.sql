-- ============================================================================
-- WSA VEÍCULOS — SCRIPT COMPLETO DE CONFIGURAÇÃO SUPABASE (SQL EDITOR)
-- Razão Social: WSA Comércio de Veículos Ltda | CNPJ: 52.255.211/0001-79
-- Cole todo este conteúdo no SQL Editor do Supabase e clique em "Run".
-- ============================================================================

-- 1. EXTENSÕES
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- 2. TABELA DE VEÍCULOS (ESTOQUE DO PÁTIO)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.vehicles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(150) NOT NULL,
    brand VARCHAR(80) NOT NULL,
    model VARCHAR(80) NOT NULL,
    version VARCHAR(100),
    year_fab INT NOT NULL,
    year_model INT NOT NULL,
    mileage INT NOT NULL DEFAULT 0,
    fuel_type VARCHAR(30) DEFAULT 'Flex',
    transmission VARCHAR(40) DEFAULT 'Automático',
    color VARCHAR(40),
    plate_end VARCHAR(2),
    price NUMERIC(12,2) NOT NULL CHECK (price >= 0),
    promotional_price NUMERIC(12,2) CHECK (promotional_price IS NULL OR promotional_price >= 0),
    down_payment_suggested NUMERIC(12,2),
    installment_suggested VARCHAR(100),
    features TEXT[] DEFAULT '{}',
    images TEXT[] NOT NULL DEFAULT '{}',
    is_featured BOOLEAN DEFAULT false,
    is_black_friday BOOLEAN DEFAULT false,
    status VARCHAR(30) DEFAULT 'disponivel' CHECK (status IN ('disponivel', 'reservado', 'vendido')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_vehicles_status ON public.vehicles(status);
CREATE INDEX IF NOT EXISTS idx_vehicles_brand ON public.vehicles(brand);
CREATE INDEX IF NOT EXISTS idx_vehicles_created_at ON public.vehicles(created_at DESC);

-- Trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_vehicles_updated_at ON public.vehicles;
CREATE TRIGGER trg_vehicles_updated_at
BEFORE UPDATE ON public.vehicles
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ============================================================================
-- 3. TABELA DE LEADS & PROTEÇÃO ANTI-FRAUDE DE COMISSÃO (R$ 1.000)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vehicle_id UUID REFERENCES public.vehicles(id) ON DELETE SET NULL,
    lead_code VARCHAR(30) UNIQUE NOT NULL,
    name VARCHAR(120) NOT NULL,
    phone VARCHAR(30) NOT NULL,
    intent_type VARCHAR(50) DEFAULT 'compra_estoque',
    vehicle_title VARCHAR(150),
    vehicle_price NUMERIC(12,2),
    notes TEXT,
    utm_source VARCHAR(100),
    utm_medium VARCHAR(100),
    utm_campaign VARCHAR(100),
    utm_term VARCHAR(100),
    referrer VARCHAR(255),
    ip_hash VARCHAR(64),
    status VARCHAR(30) DEFAULT 'novo' CHECK (status IN ('novo', 'em_negociacao', 'fechado', 'perdido')),
    commission_status VARCHAR(30) DEFAULT 'pendente' CHECK (commission_status IN ('pendente', 'confirmada', 'paga', 'recusada')),
    commission_value NUMERIC(10,2) DEFAULT 1000.00 NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_leads_code ON public.leads(lead_code);
CREATE INDEX IF NOT EXISTS idx_leads_commission ON public.leads(commission_status);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON public.leads(created_at DESC);

-- Blindagem Anti-Fraude: Impede alteração do código de protocolo ou data original do lead
CREATE OR REPLACE FUNCTION public.protect_lead_audit_fields()
RETURNS TRIGGER AS $$
BEGIN
    NEW.lead_code := OLD.lead_code;
    NEW.created_at := OLD.created_at;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_protect_lead_audit ON public.leads;
CREATE TRIGGER trg_protect_lead_audit
BEFORE UPDATE ON public.leads
FOR EACH ROW EXECUTE FUNCTION public.protect_lead_audit_fields();

-- ============================================================================
-- 4. SEGURANÇA ROW LEVEL SECURITY (RLS)
-- ============================================================================
ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- Políticas de Veículos
DROP POLICY IF EXISTS "Leitura pública de veículos" ON public.vehicles;
CREATE POLICY "Leitura pública de veículos"
ON public.vehicles FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Gestão de veículos apenas admin" ON public.vehicles;
CREATE POLICY "Gestão de veículos apenas admin"
ON public.vehicles FOR ALL
TO authenticated
USING (true) WITH CHECK (true);

-- Políticas de Leads (Zero leitura pública; proibição de exclusão de registros de comissão)
DROP POLICY IF EXISTS "Inserção pública de leads" ON public.leads;
CREATE POLICY "Inserção pública de leads"
ON public.leads FOR INSERT
WITH CHECK (true);

DROP POLICY IF EXISTS "Leitura de leads apenas admin autenticado" ON public.leads;
CREATE POLICY "Leitura de leads apenas admin autenticado"
ON public.leads FOR SELECT
TO authenticated
USING (true);

DROP POLICY IF EXISTS "Atualização de status de lead apenas admin" ON public.leads;
CREATE POLICY "Atualização de status de lead apenas admin"
ON public.leads FOR UPDATE
TO authenticated
USING (true) WITH CHECK (true);

-- ============================================================================
-- 5. STORAGE BUCKET PARA FOTOS DOS VEÍCULOS (vehicle-images)
-- ============================================================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'vehicle-images',
    'vehicle-images',
    true,
    8388608, -- 8MB por imagem
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/avif']
)
ON CONFLICT (id) DO UPDATE SET
    public = EXCLUDED.public,
    file_size_limit = EXCLUDED.file_size_limit,
    allowed_mime_types = EXCLUDED.allowed_mime_types;

DROP POLICY IF EXISTS "Visualização pública das fotos WSA" ON storage.objects;
CREATE POLICY "Visualização pública das fotos WSA"
ON storage.objects FOR SELECT
USING (bucket_id = 'vehicle-images');

DROP POLICY IF EXISTS "Upload de fotos restrito a admin WSA" ON storage.objects;
CREATE POLICY "Upload de fotos restrito a admin WSA"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'vehicle-images');

DROP POLICY IF EXISTS "Exclusão de fotos restrita a admin WSA" ON storage.objects;
CREATE POLICY "Exclusão de fotos restrita a admin WSA"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'vehicle-images');

-- ============================================================================
-- 6. CARGA INICIAL DO ESTOQUE (EXECUTA APENAS SE A TABELA ESTIVER VAZIA)
-- ============================================================================
INSERT INTO public.vehicles (
    title, brand, model, version, year_fab, year_model, mileage,
    fuel_type, transmission, color, plate_end, price, promotional_price,
    down_payment_suggested, installment_suggested, features, images,
    is_featured, is_black_friday, status
)
SELECT * FROM (VALUES
    (
        'Honda Civic LXR 2.0 i-VTEC', 'Honda', 'Civic', 'LXR 2.0 Flex Automático',
        2014, 2014, 98000, 'Flex', 'Automático', 'Preto Cristal', '4',
        68900.00, 65900.00, 15000.00, '48x de R$ 1.540',
        ARRAY['Câmera de ré integrada', 'Bancos em couro', 'Paddle Shift', 'Piloto automático', 'Ar digital'],
        ARRAY[
            'https://images.unsplash.com/photo-1619767886558-efdc259cde1a?auto=format&fit=crop&w=1200&q=85',
            'https://images.unsplash.com/photo-1590362891991-f776e747a588?auto=format&fit=crop&w=1200&q=85',
            'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=1200&q=85'
        ],
        true, true, 'disponivel'
    ),
    (
        'Hyundai HB20 Diamond Plus 1.0 TGDI', 'Hyundai', 'HB20', 'Diamond Plus 1.0 Turbo',
        2021, 2022, 42000, 'Flex', 'Automático', 'Prata Sand', '8',
        79900.00, 76900.00, 18000.00, '48x de R$ 1.780',
        ARRAY['Frenagem autônoma', 'Chave presencial', 'Bancos em couro', 'Carregador por indução', 'CarPlay sem fio'],
        ARRAY[
            'https://images.unsplash.com/photo-1609521263047-f8f205293f24?auto=format&fit=crop&w=1200&q=85',
            'https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?auto=format&fit=crop&w=1200&q=85'
        ],
        true, true, 'disponivel'
    ),
    (
        'Chevrolet Onix Plus Premier 1.0 Turbo', 'Chevrolet', 'Onix Plus', 'Premier II Turbo Automático',
        2022, 2023, 34500, 'Flex', 'Automático', 'Prata Switchblade', '2',
        88500.00, 84900.00, 20000.00, '48x de R$ 1.890',
        ARRAY['Easy Park automático', 'Alerta de ponto cego', '6 Airbags', 'Carregador sem fio', 'Ar digital'],
        ARRAY[
            'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=1200&q=85',
            'https://images.unsplash.com/photo-1583121274602-3e2820c69888?auto=format&fit=crop&w=1200&q=85'
        ],
        true, false, 'disponivel'
    ),
    (
        'Toyota Corolla XEi 2.0 Dynamic Force', 'Toyota', 'Corolla', 'XEi 2.0 Direct Shift CVT',
        2021, 2021, 49000, 'Flex', 'Automático CVT', 'Branco Pérola', '7',
        129900.00, 125900.00, 35000.00, '48x de R$ 2.750',
        ARRAY['Toyota Safety Sense', 'ACC adaptativo', 'Painel TFT 7"', 'Chave presencial', 'Bancos em couro'],
        ARRAY[
            'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?auto=format&fit=crop&w=1200&q=85',
            'https://images.unsplash.com/photo-1550355291-bbee04a92027?auto=format&fit=crop&w=1200&q=85'
        ],
        false, true, 'disponivel'
    ),
    (
        'Jeep Compass Longitude T270 Turbo', 'Jeep', 'Compass', 'Longitude 1.3 Turbo 185 cv',
        2022, 2022, 38000, 'Flex', 'Automático', 'Cinza Granite', '9',
        139900.00, 135000.00, 40000.00, '48x de R$ 2.920',
        ARRAY['Motor T270 185 cv', 'Multimídia 10.1"', 'Faróis Full LED', 'Auto Hold', 'Ar Dual Zone'],
        ARRAY[
            'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=1200&q=85',
            'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=85'
        ],
        true, false, 'reservado'
    ),
    (
        'BMW 320i M Sport 2.0 TwinPower', 'BMW', '320i', 'M Sport ActiveFlex Steptronic',
        2021, 2022, 31000, 'Flex', 'Automático 8M', 'Portimao Blue', '0',
        249000.00, 239900.00, 70000.00, '48x de R$ 4.950',
        ARRAY['Pacote M Sport', 'Teto solar elétrico', 'Som Harman Kardon', 'Live Cockpit Professional'],
        ARRAY[
            'https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=1200&q=85',
            'https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&w=1200&q=85'
        ],
        true, true, 'disponivel'
    )
) AS seed_data(
    title, brand, model, version, year_fab, year_model, mileage,
    fuel_type, transmission, color, plate_end, price, promotional_price,
    down_payment_suggested, installment_suggested, features, images,
    is_featured, is_black_friday, status
)
WHERE NOT EXISTS (SELECT 1 FROM public.vehicles LIMIT 1);

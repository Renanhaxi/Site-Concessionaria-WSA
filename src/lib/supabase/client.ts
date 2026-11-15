/**
 * Segurança Arquitetural WSA:
 * Nenhuma credencial ou cliente direto do Supabase é instanciado no navegador.
 * Toda comunicação com o banco e Storage ocorre via rotas internas do servidor (/api/*),
 * mantendo SUPABASE_URL, SUPABASE_ANON_KEY e SUPABASE_SERVICE_ROLE_KEY 100% invisíveis no código-fonte público.
 */
export const ZERO_CLIENT_EXPOSURE = true;

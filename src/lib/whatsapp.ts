export const WSA_OFFICIAL_PHONE = '5591984706312';
export const WSA_PHONE_DISPLAY = '(91) 98470-6312';

interface WhatsAppMessagePayload {
  leadCode: string;
  customerName: string;
  vehicleTitle?: string;
  vehiclePrice?: number;
  intentType: string;
  notes?: string;
}

export function buildWhatsAppLink(payload: WhatsAppMessagePayload): string {
  const { leadCode, customerName, vehicleTitle, vehiclePrice, intentType, notes } = payload;

  let header = `*WSA VEÍCULOS — ATENDIMENTO SITE*\n`;
  header += `*Protocolo:* ${leadCode}\n`;
  header += `*Cliente:* ${customerName}\n`;

  let details = '';

  if (intentType === 'compra_estoque' && vehicleTitle) {
    const formattedPrice = vehiclePrice
      ? new Intl.NumberFormat('pt-BR', {
          style: 'currency',
          currency: 'BRL',
          maximumFractionDigits: 0,
        }).format(vehiclePrice)
      : '';
    details = `*Veículo:* ${vehicleTitle}\n*Valor anunciado:* ${formattedPrice}\n`;
  } else if (intentType === 'troca_fipe') {
    details = `*Solicitação:* Avaliação de Usado (Programa até 90% da FIPE)\n`;
  } else if (intentType === 'encomenda_personalizada') {
    details = `*Solicitação:* Encomenda Sob Medida (Car Hunter WSA)\n`;
  } else if (intentType === 'consignacao') {
    details = `*Solicitação:* Consignação Executiva de Veículo\n`;
  } else {
    details = `*Solicitação:* Atendimento Comercial\n`;
  }

  if (notes) {
    details += `*Detalhes:* ${notes}\n`;
  }

  const footer = `\nOlá! Vim pelo catálogo online da WSA Veículos e gostaria de avançar com o atendimento.`;

  const fullText = `${header}${details}${footer}`;
  return `https://wa.me/${WSA_OFFICIAL_PHONE}?text=${encodeURIComponent(fullText)}`;
}

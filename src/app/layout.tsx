import type { Metadata, Viewport } from 'next';
import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import MobileBottomNav from '@/components/MobileBottomNav';

export const viewport: Viewport = {
  themeColor: '#09090B',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  title: 'WSA Veículos | Seminovos Selecionados em Belém - PA',
  description:
    'Showroom de seminovos selecionados em Belém/PA. Seu usado vale até 90% da Tabela FIPE na troca. Veículos periciados com laudo cautelar aprovado e garantia.',
  keywords: [
    'WSA Veículos',
    'Concessionária Belém',
    'Seminovos Belém PA',
    'Troca 90 FIPE Belém',
    'Carros revisados Belém',
    'Alferes Costa 486',
  ],
  authors: [{ name: 'WSA Veículos' }],
  openGraph: {
    title: 'WSA Veículos | Seminovos Selecionados em Belém/PA',
    description:
      'Seminovos periciados com laudo cautelar aprovado, garantia real e avaliação de até 90% da FIPE no seu usado.',
    url: 'https://wsaveiculos.com.br',
    siteName: 'WSA Veículos',
    locale: 'pt_BR',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&family=Outfit:wght@500;600;700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-background text-[#F5F5F7] font-sans antialiased min-h-screen flex flex-col selection:bg-wsa-red selection:text-white relative">
        {/* Subtle tactile automotive matte grain layer */}
        <div
          aria-hidden="true"
          className="pointer-events-none fixed inset-0 z-[1] bg-grain opacity-90"
        />
        <div className="relative z-[2] flex flex-col min-h-screen">
          <Navbar />
          <main className="flex-1 pb-20 lg:pb-0">{children}</main>
          <Footer />
          <MobileBottomNav />
        </div>
      </body>
    </html>
  );
}

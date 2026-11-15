import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabase, verifyAdminRequest } from '@/lib/supabase/server';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'];
const MAX_SIZE_BYTES = 8 * 1024 * 1024; // 8 MB por foto

export async function POST(request: NextRequest) {
  const auth = await verifyAdminRequest(request);
  if (!auth.authorized) {
    return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
  }

  const supabase = getServerSupabase();
  if (!supabase) {
    return NextResponse.json(
      {
        error:
          'Configure SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY no arquivo .env.local para habilitar upload direto no Storage.',
      },
      { status: 400 }
    );
  }

  try {
    const formData = await request.formData();
    const files = formData.getAll('files') as File[];

    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: 'Nenhuma imagem selecionada.' },
        { status: 400 }
      );
    }

    const uploadedUrls: string[] = [];

    for (const file of files) {
      if (!ALLOWED_TYPES.includes(file.type)) {
        return NextResponse.json(
          { error: `Formato não permitido (${file.type}). Use JPG, PNG ou WebP.` },
          { status: 400 }
        );
      }

      if (file.size > MAX_SIZE_BYTES) {
        return NextResponse.json(
          { error: 'Cada foto deve ter no máximo 8MB.' },
          { status: 400 }
        );
      }

      const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
      const safeName = `patio/${Date.now()}-${Math.random()
        .toString(36)
        .slice(2, 8)}.${ext}`;

      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const { error: uploadError } = await supabase.storage
        .from('vehicle-images')
        .upload(safeName, buffer, {
          contentType: file.type,
          upsert: false,
        });

      if (uploadError) {
        return NextResponse.json(
          { error: `Erro no Storage: ${uploadError.message}` },
          { status: 500 }
        );
      }

      const { data: publicUrlData } = supabase.storage
        .from('vehicle-images')
        .getPublicUrl(safeName);

      if (publicUrlData?.publicUrl) {
        uploadedUrls.push(publicUrlData.publicUrl);
      }
    }

    return NextResponse.json({ urls: uploadedUrls }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || 'Falha no upload das fotos.' },
      { status: 500 }
    );
  }
}

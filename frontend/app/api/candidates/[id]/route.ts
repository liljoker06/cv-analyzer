import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const candidateId = params.id;
    const token = req.headers.get('Authorization') || '';
    const backendUrl = `${process.env.NEXT_PUBLIC_API_URL}/candidates/${candidateId}/`;

    const response = await fetch(backendUrl, {
      headers: {
        'Authorization': token
      },
      cache: 'no-store'
    });

    const data = await response.json();
    
    if (!response.ok) {
      return NextResponse.json(
        { error: data.error || 'Erreur lors de la récupération du candidat' },
        { status: response.status }
      );
    }
    
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Erreur API candidat:', error);
    return NextResponse.json(
      { error: error.message || 'Erreur serveur' },
      { status: 500 }
    );
  }
}

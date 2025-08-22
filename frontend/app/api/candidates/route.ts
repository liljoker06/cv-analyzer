import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const token = req.headers.get('Authorization') || '';
    const backendUrl = `${process.env.NEXT_PUBLIC_API_URL}/candidates/`;

    const response = await fetch(backendUrl, {
      headers: {
        'Authorization': token
      },
      cache: 'no-store'
    });

    const data = await response.json();
    
    if (!response.ok) {
      return NextResponse.json(
        { error: data.error || 'Erreur lors de la récupération des candidats' },
        { status: response.status }
      );
    }
    
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Erreur API candidates:', error);
    return NextResponse.json(
      { error: error.message || 'Erreur serveur' },
      { status: 500 }
    );
  }
}

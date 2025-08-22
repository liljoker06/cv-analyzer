import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

/**
 * Récupère les résultats d'analyse
 */
export async function GET(request: NextRequest) {
  try {
    // Récupérer le token depuis l'en-tête d'autorisation
    const authHeader = request.headers.get('Authorization');
    const tokenFromCookie = request.cookies.get('cv_analyzer_token')?.value;
    
    // Utiliser soit le token de l'en-tête, soit celui du cookie, soit celui de l'environnement
    let token = '';
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.slice(7);
    } else if (tokenFromCookie) {
      token = tokenFromCookie;
    } else {
      token = process.env.API_TOKEN || '';
    }
    
    if (!token) {
      token = 'dev_token_for_testing';
    }

    // Récupération des informations de l'API backend
    const backendUrl = process.env.NEXT_PUBLIC_API_URL;
    
    // Construction de l'URL pour récupérer les résultats d'analyse
    const apiUrl = `${backendUrl}/analysis-results/`;
    
    // Appel à l'API backend
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    // Traitement de la réponse
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        { error: errorData.error || 'Erreur lors de la récupération des résultats d\'analyse' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
    
  } catch (error) {
    console.error('Erreur lors de la récupération des résultats d\'analyse:', error);
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de la récupération des résultats' },
      { status: 500 }
    );
  }
}

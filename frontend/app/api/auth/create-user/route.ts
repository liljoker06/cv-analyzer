import { NextResponse } from 'next/server';

// décoder token JWT
function decodeJwtToken(token: string) {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const payload = parts[1];
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = Buffer.from(base64, 'base64').toString('utf-8');

    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Erreur lors du décodage du JWT:', error);
    return null;
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    
    // récup le token d'authentification du header
    const authHeader = request.headers.get('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Token d\'authentification requis' }, { status: 401 });
    }
    
    // token
    const token = authHeader.split(' ')[1];
    
    const decodedToken = decodeJwtToken(token);
    if (!decodedToken || decodedToken.role !== 'admin') {
      return NextResponse.json({ error: 'Vous devez être administrateur pour créer un utilisateur' }, { status: 403 });
    }
    
    const payload = {
      email: data.email,
      password: data.password,
      role: data.role || 'recruiter',
    };
    
    if (!process.env.NEXT_PUBLIC_API_URL) {
      console.error('NEXT_PUBLIC_API_URL n\'est pas défini dans les variables d\'environnement');
      return NextResponse.json({ 
        error: 'Configuration du serveur incorrecte: URL de l\'API non définie' 
      }, { status: 500 });
    }
    
    // Construire l'URL complète pour l'API
    const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/users/create-recruiter/`;
    
    console.log('Sending request to:', apiUrl);
    
    // Vérifier que l'URL est valide
    if (!apiUrl.startsWith('http://') && !apiUrl.startsWith('https://')) {
      console.error('URL invalide:', apiUrl);
      return NextResponse.json({ 
        error: `URL invalide: ${apiUrl}. Assurez-vous que l'URL du backend est correctement configurée.` 
      }, { status: 500 });
    }
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'X-Role': decodedToken.role, 
      },
      body: JSON.stringify(payload),
    });
    
    try {
      const responseText = await response.text();
      console.log('Backend response raw:', responseText);
      
      // convertir en JSON
      let responseData;
      try {
        responseData = JSON.parse(responseText);
      } catch (e) {
        console.error('Erreur de parsing JSON:', e);
        console.error('Réponse brute:', responseText);
        return NextResponse.json({ 
          error: 'Impossible de parser la réponse du serveur', 
          rawResponse: responseText 
        }, { status: 500 });
      }
      
      if (!response.ok) {
        console.error('Réponse erreur du backend:', response.status, responseData);
        return NextResponse.json({ 
          error: responseData.error || `Échec de la création de l'utilisateur (${response.status})`,
          details: responseData
        }, { status: response.status });
      }
      
      console.log('Utilisateur créé avec succès:', responseData);
      return NextResponse.json(responseData, { status: 201 });
    } catch (parseError: any) {
      console.error('Erreur lors du traitement de la réponse:', parseError);
      return NextResponse.json({ 
        error: 'Erreur lors du traitement de la réponse',
        details: parseError.message || String(parseError)
      }, { status: 500 });
    }
  } catch (error: any) {
    console.error('Erreur lors de la création de l\'utilisateur:', error);
    console.error('Stack trace:', error.stack);
    return NextResponse.json({ 
      error: error.message || 'Une erreur est survenue',
      details: error.stack
    }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';

/**
 * récupération des utilisateurs (tout)
 */
export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('Authorization');
    const roleHeader = req.headers.get('X-Role') || '';
    
    if (!authHeader) {
      return NextResponse.json({ error: "Authentification requise" }, { status: 401 });
    }

    const apiUrl = process.env.NEXT_PUBLIC_API_URL
    
    console.log('Envoi de requête à:', `${apiUrl}/users/`);
    
    // token  au format Bearer
    const token = authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : authHeader;
    
    const response = await fetch(`${apiUrl}/users/`, {
      headers: {
        'Authorization': authHeader.startsWith('Bearer ') ? authHeader : `Bearer ${authHeader}`,
        'X-Role': roleHeader,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();
    
    if (!response.ok) {
      return NextResponse.json({ error: data.error || "Erreur lors de la récupération des utilisateurs" }, 
        { status: response.status });
    }
    
    // retourne les données des utilisateurs
    return NextResponse.json(data);
  } catch (error) {
    console.error('Erreur lors de la récupération des utilisateurs:', error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

/**
 * création d'un nouvel utilisateur
 */
export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('Authorization');
    
    if (!authHeader) {
      return NextResponse.json({ error: "Authentification requise" }, { status: 401 });
    }

    const userData = await req.json();

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'
    
    console.log('Envoi de requête POST à:', `${apiUrl}/users/`);
    
    // Vérifier si le token est au format Bearer
    const token = authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : authHeader;
    
    const response = await fetch(`${apiUrl}/users/`, {
      method: 'POST',
      headers: {
        // S'assurer que l'autorisation est au bon format pour le backend Django
        'Authorization': authHeader.startsWith('Bearer ') ? authHeader : `Bearer ${authHeader}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(userData)
    });

    const data = await response.json();
    
    if (!response.ok) {
      return NextResponse.json({ error: data.error || "Erreur lors de la création de l'utilisateur" }, 
        { status: response.status });
    }
    
    // retourne les données des utilisateurs
    return NextResponse.json(data);
  } catch (error) {
    console.error('Erreur lors de la création de l\'utilisateur:', error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

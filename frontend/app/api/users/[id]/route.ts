import { NextRequest, NextResponse } from 'next/server';

/**
 * récupération d'un utilisateur spécifique par ID
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = params.id;
    
    // récup le token d'authentification de la requête
    const authHeader = req.headers.get('Authorization');
    
    if (!authHeader) {
      return NextResponse.json({ error: "Authentification requise" }, { status: 401 });
    }

    const apiUrl = process.env.NEXT_PUBLIC_API_URL
    
    const response = await fetch(`${apiUrl}/users/${userId}/`, {
      headers: {
        'Authorization': authHeader
      }
    });

    const data = await response.json();
    
    if (!response.ok) {
      return NextResponse.json({ error: data.error || "Utilisateur non trouvé" }, 
        { status: response.status });
    }
    
    // retourne les données de l'utilisateur
    return NextResponse.json(data);
  } catch (error) {
    console.error(`Erreur lors de la récupération de l'utilisateur:`, error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

/**
 * suppression d'un utilisateur
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = params.id;
    
    const authHeader = req.headers.get('Authorization');
    
    if (!authHeader) {
      return NextResponse.json({ error: "Authentification requise" }, { status: 401 });
    }

    const apiUrl = process.env.NEXT_PUBLIC_API_URL
    
    const response = await fetch(`${apiUrl}/users/${userId}/delete/`, {
      method: 'DELETE',
      headers: {
        'Authorization': authHeader
      }
    });

    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch {
        errorData = { error: `Erreur ${response.status}` };
      }
      
      return NextResponse.json(
        { error: errorData.error || "Erreur lors de la suppression de l'utilisateur" },
        { status: response.status }
      );
    }
    
    // Retourner une confirmation de suppression
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(`Erreur lors de la suppression de l'utilisateur:`, error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}


// a ajouter : mise à jour d'un utilisateur
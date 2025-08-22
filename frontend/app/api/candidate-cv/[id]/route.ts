import { NextRequest, NextResponse } from 'next/server';

// Récupération de l'URL de l'API depuis les variables d'environnement
const API_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

// Route API pour récupérer le CV d'un candidat
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const id = params.id;
  
  try { 
    // Récupération du CV depuis le backend
    const backendResponse = await fetch(`${API_URL}/candidate-cv/${id}/`, {
      headers: {},
    });

    if (!backendResponse.ok) {
      console.error(`Le backend a répondu avec le statut: ${backendResponse.status}`);
      if (backendResponse.status === 404) {
        return new NextResponse('CV non trouvé', { status: 404 });
      }
      const errorText = await backendResponse.text();
      console.error(`Réponse d'erreur du backend: ${errorText}`);
      return new NextResponse(`Échec de récupération du CV: ${errorText}`, { status: backendResponse.status });
    }

    console.log(`CV récupéré avec succès pour le candidat ID: ${id}`);

    const blobData = await backendResponse.blob();
    
    // en-têtes pour la réponse PDF
    const headers = new Headers();
    headers.set('Content-Type', 'application/pdf');
    
    const contentDisposition = backendResponse.headers.get('Content-Disposition');
    if (contentDisposition) {
      headers.set('Content-Disposition', contentDisposition);
    } else {
      headers.set('Content-Disposition', `attachment; filename="cv-${id}.pdf"`);
    }
    
    console.log('Réponse PDF préparée avec succès');
    
    return new NextResponse(blobData, { 
      status: 200, 
      headers
    });
    
  } catch (error) {
    console.error('Erreur lors de la récupération du CV:', error);
    return new NextResponse(`Erreur serveur interne: ${error instanceof Error ? error.message : String(error)}`, { status: 500 });
  }
}

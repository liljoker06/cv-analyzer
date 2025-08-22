interface JwtPayload {
  id: string;
  email: string;
  role: string;
  exp: number;
}

/**
 * Décode un JWT token pour extraire les informations qu'il contient
 * @param token JWT token à décoder
 * @returns Le payload décodé ou null si le token est invalide
 */
export function decodeToken(token: string): JwtPayload | null {
  try {
    // Diviser le token en ses parties (header, payload, signature)
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    // Décoder le payload (la 2ème partie)
    const payload = parts[1];
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      window
        .atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );

    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Erreur lors du décodage du JWT:', error);
    return null;
  }
}

/**
 * Vérifie si un token JWT est expiré
 * @param token JWT token à vérifier
 * @returns true si le token est expiré, false sinon
 */
export function isTokenExpired(token: string): boolean {
  const payload = decodeToken(token);
  if (!payload) return true;

  const currentTime = Math.floor(Date.now() / 1000);
  return payload.exp < currentTime;
}

/**
 * Extrait les informations utilisateur à partir d'un token JWT
 * @param token JWT token
 * @returns Objet contenant les informations utilisateur
 */
export function getUserFromToken(token: string) {
  const payload = decodeToken(token);
  if (!payload) return null;

  return {
    id: payload.id,
    email: payload.email,
    username: payload.email.split('@')[0], 
    role: payload.role,
    token
  };
}

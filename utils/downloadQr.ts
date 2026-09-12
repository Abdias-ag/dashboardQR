/**
 * Fonction utilitaire pour télécharger les QR Codes
 * Supporte: PNG, SVG, PDF
 * Fonctionne sur: Chrome, Firefox, Safari, Edge
 */

export interface DownloadOptions {
  format?: 'png' | 'svg' | 'pdf';
  filename?: string;
  onError?: (error: Error) => void;
  onSuccess?: () => void;
}

/**
 * Génère un nom de fichier intelligent basé sur le nom du QR Code
 * Exemples: "restaurant-menu.png", "wifi-maison.png", "contact-jean.svg"
 */
function generateFilename(qrName: string, format: 'png' | 'svg' | 'pdf'): string {
  // Nettoyer le nom: minuscules, remplacer les espaces par des tirets, supprimer caractères spéciaux
  const cleanName = qrName
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9\-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

  // Si le nom est vide, utiliser une date par défaut
  if (!cleanName) {
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0]; // Format: 2026-07-18
    return `qr-code-${dateStr}.${format}`;
  }

  return `${cleanName}.${format}`;
}

/**
 * Télécharge une image via une URL
 * Utilise la méthode standard: créer un <a>, mettre href, déclencher click, supprimer
 */
async function downloadFromUrl(
  url: string,
  filename: string,
  format: 'png' | 'svg' | 'pdf'
): Promise<void> {
  try {
    // Récupérer le fichier
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(
        `Erreur réseau: ${response.status} ${response.statusText}`
      );
    }

    // Créer un Blob
    const blob = await response.blob();

    // Vérifier que le type MIME est correct
    const mimeTypes: Record<string, string> = {
      png: 'image/png',
      svg: 'image/svg+xml',
      pdf: 'application/pdf',
    };

    const correctMimeBlob = new Blob([blob], {
      type: mimeTypes[format],
    });

    // Créer une URL temporaire
    const blobUrl = window.URL.createObjectURL(correctMimeBlob);

    // Créer un élément <a> temporaire
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = filename;
    link.style.display = 'none';

    // Ajouter au DOM (certains navigateurs l'exigent)
    document.body.appendChild(link);

    // Déclencher le téléchargement
    link.click();

    // Nettoyer: supprimer l'élément et la URL
    document.body.removeChild(link);
    window.URL.revokeObjectURL(blobUrl);
  } catch (error) {
    throw new Error(
      `Impossible de télécharger le fichier: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

/**
 * Fonction principale pour télécharger un QR Code
 *
 * @param url - URL de l'image QR Code (ex: "http://localhost:5000/uploads/qrcodes/abc123.png")
 * @param qrName - Nom du QR Code pour générer le nom du fichier
 * @param options - Options de téléchargement (format, filename personnalisé, callbacks)
 *
 * @example
 * await downloadQr(
 *   "http://localhost:5000/uploads/qrcodes/abc123.png",
 *   "Restaurant Menu",
 *   { format: 'png' }
 * );
 */
export async function downloadQr(
  url: string,
  qrName: string,
  options: DownloadOptions = {}
): Promise<void> {
  const {
    format = 'png',
    filename: customFilename,
    onError,
    onSuccess,
  } = options;

  try {
    // Valider les paramètres
    if (!url || !url.trim()) {
      throw new Error('URL du QR Code non fournie');
    }

    if (!qrName || !qrName.trim()) {
      throw new Error('Nom du QR Code non fourni');
    }

    // Valider le format
    const validFormats = ['png', 'svg', 'pdf'];
    if (!validFormats.includes(format)) {
      throw new Error(`Format non supporté: ${format}`);
    }

    // Générer ou utiliser le nom de fichier personnalisé
    const filename =
      customFilename || generateFilename(qrName, format);

    // Télécharger le fichier
    await downloadFromUrl(url, filename, format);

    // Appeler le callback de succès
    if (onSuccess) {
      onSuccess();
    }
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));

    // Appeler le callback d'erreur
    if (onError) {
      onError(err);
    } else {
      throw err;
    }
  }
}

/**
 * Fonction pour convertir un format à un autre (optionnel pour futures implémentations)
 * Peut utiliser des libraries comme: jspdf, html2canvas, etc.
 */
export async function convertQrFormat(
  imageUrl: string,
  fromFormat: 'png' | 'svg' | 'pdf',
  toFormat: 'png' | 'svg' | 'pdf'
): Promise<Blob> {
  // Récupérer l'image source
  const response = await fetch(imageUrl);
  const blob = await response.blob();

  // Pour l'instant, juste retourner le blob avec le bon type MIME
  // À l'avenir, implémenter les conversions réelles avec jspdf, canvas, etc.
  const mimeTypes: Record<string, string> = {
    png: 'image/png',
    svg: 'image/svg+xml',
    pdf: 'application/pdf',
  };

  return new Blob([blob], {
    type: mimeTypes[toFormat],
  });
}

/**
 * Serverless Function Vercel
 * Route: /api/submit-form
 * 
 * Cette fonction reçoit les données du formulaire frontend
 * et les transmet à l'API HubSpot, évitant ainsi les problèmes CORS.
 */

export default async function handler(req, res) {
    // Autoriser uniquement les requêtes POST
    if (req.method !== 'POST') {
        return res.status(405).json({ 
            success: false, 
            error: 'Méthode non autorisée' 
        });
    }

    try {
        // Récupérer les données du formulaire
        const { firstname, lastname, email, statut_juridique } = req.body;

        // Validation basique
        if (!firstname || !lastname || !email || !statut_juridique) {
            return res.status(400).json({ 
                success: false, 
                error: 'Tous les champs sont requis' 
            });
        }

        // Préparer les données pour HubSpot
        const hubspotData = {
            fields: [
                {
                    name: 'firstname',
                    value: firstname
                },
                {
                    name: 'lastname',
                    value: lastname
                },
                {
                    name: 'email',
                    value: email
                },
                {
                    name: 'statut_juridique',
                    value: statut_juridique
                }
            ],
            context: {
                pageUri: req.headers.referer || 'https://neryko.io',
                pageName: 'Landing Page Neryko'
            }
        };

        // Soumettre à HubSpot
        const hubspotResponse = await fetch(
            'https://api.eu1.hubapi.com/submissions/v3/integration/submit/148310707/cc1160d7-cd69-4d92-95cd-c978a1584669',
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(hubspotData)
            }
        );

        // Vérifier la réponse HubSpot
        if (!hubspotResponse.ok) {
            const errorText = await hubspotResponse.text();
            console.error('Erreur HubSpot:', errorText);
            throw new Error('Erreur lors de la soumission à HubSpot');
        }

        // Succès
        return res.status(200).json({ 
            success: true, 
            message: 'Inscription réussie' 
        });

    } catch (error) {
        console.error('Erreur serveur:', error);
        return res.status(500).json({ 
            success: false, 
            error: 'Erreur lors de l\'inscription' 
        });
    }
}

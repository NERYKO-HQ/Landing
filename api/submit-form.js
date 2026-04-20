module.exports = async (req, res) => {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    // Handle preflight
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    // Uniquement POST
    if (req.method !== 'POST') {
        return res.status(405).json({ success: false, error: 'Method not allowed' });
    }

    try {
        const { firstname, lastname, email, statut_juridique } = req.body;

        // Validation
        if (!firstname || !lastname || !email || !statut_juridique) {
            return res.status(400).json({ success: false, error: 'Missing fields' });
        }

        // Données HubSpot
        const hubspotData = {
            fields: [
                { name: 'firstname', value: firstname },
                { name: 'lastname', value: lastname },
                { name: 'email', value: email },
                { name: 'statut_juridique', value: statut_juridique }
            ],
            context: {
                pageUri: 'https://neryko.io',
                pageName: 'Landing Page Neryko'
            }
        };

        // Envoyer à HubSpot (fetch natif Node.js 24)
        const response = await fetch(
            'https://api.eu1.hubapi.com/submissions/v3/integration/submit/148310707/cc1160d7-cd69-4d92-95cd-c978a1584669',
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(hubspotData)
            }
        );

        if (!response.ok) {
            const errorText = await response.text();
            console.error('HubSpot error:', errorText);
            return res.status(500).json({ success: false, error: 'HubSpot submission failed' });
        }

        // Succès
        return res.status(200).json({ success: true, message: 'Inscription réussie' });

    } catch (error) {
        console.error('Server error:', error);
        return res.status(500).json({ success: false, error: error.message });
    }
};

import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Connexion à MongoDB avec .env
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ Connecté à MongoDB'))
  .catch(err => console.error('❌ Erreur de connexion:', err));

// Schéma de l’offre
const jobOfferSchema = new mongoose.Schema({
  titre: String,
  description: String,
  type: { type: String, enum: ['Emploi', 'Stage'] },
  secteur: String,
  localisation: String,
  niveau_experience: { type: String, enum: ['Debutant', 'Intermediaire', 'Confirme'] },
  date_publication: { type: Date, default: Date.now }
});
const JobOffer = mongoose.model('JobOffer', jobOfferSchema);

// Swagger config
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API Offres d’Emploi & Stages',
      version: '1.0.0',
      description: 'API pour gérer des offres d’emploi et de stage',
    },
    servers: [
      {
        url: 'http://localhost:3000',
      },
    ],
  },
  apis: ['./server.js'], // Ce fichier
};
const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

/**
 * @swagger
 * tags:
 *   name: Offres
 *   description: Gestion des offres d’emploi et stages
 */

/**
 * @swagger
 * /job-offers:
 *   post:
 *     summary: Ajouter une nouvelle offre
 *     tags: [Offres]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - titre
 *               - description
 *               - type
 *               - secteur
 *               - localisation
 *               - niveau_experience
 *             properties:
 *               titre:
 *                 type: string
 *               description:
 *                 type: string
 *               type:
 *                 type: string
 *                 enum: [Emploi, Stage]
 *               secteur:
 *                 type: string
 *               localisation:
 *                 type: string
 *               niveau_experience:
 *                 type: string
 *                 enum: [Debutant, Intermediaire, Confirme]
 *     responses:
 *       200:
 *         description: Offre créée avec succès
 *       400:
 *         description: Erreur de validation
 */
app.post('/job-offers', async (req, res) => {
  try {
    const jobOffer = new JobOffer(req.body);
    await jobOffer.save();
    res.json(jobOffer);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * @swagger
 * /job-offers:
 *   get:
 *     summary: Lister toutes les offres
 *     tags: [Offres]
 *     responses:
 *       200:
 *         description: Liste des offres récupérée
 */
app.get('/job-offers', async (req, res) => {
  try {
    const jobOffers = await JobOffer.find();
    res.json(jobOffers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /job-offers/{id}:
 *   get:
 *     summary: Obtenir une offre par son ID
 *     tags: [Offres]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID de l'offre
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Offre trouvée
 *       404:
 *         description: Offre non trouvée
 */
app.get('/job-offers/:id', async (req, res) => {
  try {
    const jobOffer = await JobOffer.findById(req.params.id);
    if (!jobOffer) {
      return res.status(404).json({ error: 'Offre non trouvée' });
    }
    res.json(jobOffer);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /job-offers/search:
 *   get:
 *     summary: Rechercher ou filtrer des offres
 *     tags: [Offres]
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *       - in: query
 *         name: secteur
 *         schema:
 *           type: string
 *       - in: query
 *         name: localisation
 *         schema:
 *           type: string
 *       - in: query
 *         name: niveau_experience
 *         schema:
 *           type: string
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         description: Recherche par mots-clés (titre ou description)
 *     responses:
 *       200:
 *         description: Résultats de la recherche
 */
app.get('/job-offers/search', async (req, res) => {
  try {
    const { type, secteur, localisation, niveau_experience, q } = req.query;
    const query = {};

    if (type) query.type = type;
    if (secteur) query.secteur = secteur;
    if (localisation) query.localisation = localisation;
    if (niveau_experience) query.niveau_experience = niveau_experience;
    if (q) {
      query.$or = [
        { titre: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } },
      ];
    }

    const jobOffers = await JobOffer.find(query);
    res.json(jobOffers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /job-offers/{id}:
 *   put:
 *     summary: Modifier une offre existante
 *     tags: [Offres]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID de l'offre à modifier
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               titre:
 *                 type: string
 *               description:
 *                 type: string
 *               type:
 *                 type: string
 *                 enum: [Emploi, Stage]
 *               secteur:
 *                 type: string
 *               localisation:
 *                 type: string
 *               niveau_experience:
 *                 type: string
 *                 enum: [Debutant, Intermediaire, Confirme]
 *     responses:
 *       200:
 *         description: Offre mise à jour avec succès
 *       404:
 *         description: Offre non trouvée
 */
app.put('/job-offers/:id', async (req, res) => {
  try {
    const updatedOffer = await JobOffer.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    if (!updatedOffer) {
      return res.status(404).json({ error: 'Offre non trouvée' });
    }

    res.json(updatedOffer);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * @swagger
 * /job-offers/{id}:
 *   delete:
 *     summary: Supprimer une offre
 *     tags: [Offres]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID de l'offre à supprimer
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Offre supprimée avec succès
 *       404:
 *         description: Offre non trouvée
 */
app.delete('/job-offers/:id', async (req, res) => {
  try {
    const deletedOffer = await JobOffer.findByIdAndDelete(req.params.id);

    if (!deletedOffer) {
      return res.status(404).json({ error: 'Offre non trouvée' });
    }

    res.json({ message: 'Offre supprimée avec succès' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Serveur démarré sur http://localhost:${PORT}`);
  console.log(`📘 Documentation Swagger: http://localhost:${PORT}/api-docs`);
});

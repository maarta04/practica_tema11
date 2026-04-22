const { Router } = require('express')
const { getStats } = require('../controllers/stats.controller')

const router = Router()

/**
 * @swagger
 * /api/stats:
 *   get:
 *     summary: Obtener estadísticas generales de la biblioteca
 *     tags: [Stats]
 *     description: Retorna libros más prestados, mejor valorados y contadores globales.
 *     responses:
 *       200:
 *         description: Estadísticas generadas correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 summary:
 *                   type: object
 *                   properties:
 *                     totalBooks: { type: 'integer' }
 *                     totalUsers: { type: 'integer' }
 *                     activeLoans: { type: 'integer' }
 *                     totalReviews: { type: 'integer' }
 *                 mostBorrowed:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id: { type: 'integer' }
 *                       title: { type: 'string' }
 *                       loanCount: { type: 'integer' }
 *                 topRated:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id: { type: 'integer' }
 *                       title: { type: 'string' }
 *                       averageRating: { type: 'number' }
 */
router.get('/', getStats)

module.exports = router

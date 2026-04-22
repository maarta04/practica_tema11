const { Router } = require('express')
const { getBookReviews, createReview, deleteReview } = require('../controllers/reviews.controller')
const { authenticate } = require('../middleware/auth.middleware')
const { validate, reviewSchema } = require('../schemas/validation')

const router = Router()

/**
 * @swagger
 * /api/books/{id}/reviews:
 *   get:
 *     summary: Obtener las reseñas de un libro
 *     tags: [Reviews]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del libro
 *     responses:
 *       200:
 *         description: Lista de reseñas con media de puntuación
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 reviews:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Review'
 *                 average:
 *                   type: number
 *                   example: 4.5
 *                 total:
 *                   type: integer
 *                   example: 2
 */
router.get('/books/:id/reviews', getBookReviews)

/**
 * @swagger
 * /api/books/{id}/reviews:
 *   post:
 *     summary: Crear una reseña para un libro
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del libro a reseñar
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [rating]
 *             properties:
 *               rating:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *                 example: 5
 *               comment:
 *                 type: string
 *                 example: Una obra maestra
 *     responses:
 *       201:
 *         description: Reseña creada correctamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Review'
 *       400:
 *         description: Datos inválidos (rating fuera de rango)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: No autenticado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: No has devuelto este libro todavía
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       409:
 *         description: Ya has reseñado este libro
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/books/:id/reviews', authenticate, validate(reviewSchema), createReview)

/**
 * @swagger
 * /api/reviews/{id}:
 *   delete:
 *     summary: Eliminar una reseña propia
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la reseña a eliminar
 *     responses:
 *       200:
 *         description: Reseña eliminada correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Reseña eliminada correctamente
 *       401:
 *         description: No autenticado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: La reseña no te pertenece
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Reseña no encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.delete('/reviews/:id', authenticate, deleteReview)

module.exports = router
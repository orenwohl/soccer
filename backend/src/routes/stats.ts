import express from 'express'
import { protect } from '../middleware/auth'
import { getTopScorers } from '../controllers/matchController'

const router = express.Router()

router.get('/scorers', protect, getTopScorers)

export default router

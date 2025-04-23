import express from 'express'
import { getTable } from '../controllers/tableController'

const router = express.Router()

router.route('/').get(getTable)

export default router

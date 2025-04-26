import express from 'express'
import {
	getAllMatches,
	getMatch,
	createMatch,
	updateMatch,
	deleteMatch,
	generateTeams,
	saveGameResult,
	updateGameResult,
	saveStatistics,
	saveTeamStats,
	getMatchStatistics,
	addGoal
} from '../controllers/matchController'
import { protect } from '../middleware/auth'

const router = express.Router()

router.route('/').get(getAllMatches).post(protect, createMatch)

router.route('/:id').get(protect, getMatch).put(protect, updateMatch).delete(protect, deleteMatch)

router.route('/generate-teams').post(protect, generateTeams)

// Game results and statistics routes
router.route('/:id/game-result').post(protect, saveGameResult)
router.route('/:id/match/:matchId').put(protect, updateGameResult)
router.route('/:id/statistics').post(protect, saveStatistics).get(protect, getMatchStatistics)
router.route('/:id/stats').post(protect, saveTeamStats)
router.route('/:id/goal').post(protect, addGoal)

export default router

import express from 'express';
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
} from '../controllers/matchController';

const router = express.Router();

router.route('/').get(getAllMatches).post(createMatch);

router.route('/:id').get(getMatch).put(updateMatch).delete(deleteMatch);

router.route('/generate-teams').post(generateTeams);

// Game results and statistics routes
router.route('/:id/game-result').post(saveGameResult);
router.route('/:id/match/:matchId').put(updateGameResult);
router.route('/:id/statistics').post(saveStatistics).get(getMatchStatistics);
router.route('/:id/stats').post(saveTeamStats);

export default router;

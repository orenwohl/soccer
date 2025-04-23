import express from 'express';
import {getPlayers, getPlayer, createPlayer, updatePlayer, deletePlayer} from '../controllers/players';
import {protect} from '../middleware/auth';

const router = express.Router();

// Protect all routes
router.use(protect);

// Routes - use individual route definitions instead of chaining
router.get('/', getPlayers);
router.post('/', createPlayer);

router.get('/:id', getPlayer);
router.put('/:id', updatePlayer);
router.delete('/:id', deletePlayer);

export default router;

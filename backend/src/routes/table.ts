import express from 'express';
import {getLeagueTable} from '../controllers/tableController';

const router = express.Router();

router.route('/').get(getLeagueTable);

export default router;

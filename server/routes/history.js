import { Router } from 'express';
import { getHistory } from '../services/historyService.js';

const router = Router();

router.get('/', (req, res) => {
  res.json(getHistory());
});

export default router;

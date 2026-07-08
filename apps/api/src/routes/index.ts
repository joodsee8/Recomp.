import { Router } from 'express';
import authRoutes from './auth.routes';
import rutinaRoutes from './rutina.routes';
import ejercicioRoutes from './ejercicio.routes';
import alimentoRoutes from './alimento.routes';
import comidaRoutes from './comida.routes';
import workoutLogRoutes from './workoutLog.routes';
import macroLogRoutes from './macroLog.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/rutinas', rutinaRoutes);
router.use('/ejercicios', ejercicioRoutes);
router.use('/alimentos', alimentoRoutes);
router.use('/comidas', comidaRoutes);
router.use('/workout-logs', workoutLogRoutes);
router.use('/macro-logs', macroLogRoutes);

export default router;

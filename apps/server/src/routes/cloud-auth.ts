import { Router } from 'express';
import { cloudAuthController } from '../security/controllers/CloudAuthController';

const router = Router();

router.post('/register', (req, res) => cloudAuthController.register(req, res));
router.post('/login', (req, res) => cloudAuthController.login(req, res));
router.post('/organizations', (req, res) => cloudAuthController.createOrganization(req, res));
router.post('/teams', (req, res) => cloudAuthController.createTeam(req, res));
router.post('/invite', (req, res) => cloudAuthController.inviteUser(req, res));
router.post('/invite/accept', (req, res) => cloudAuthController.acceptInvitation(req, res));

export default router;

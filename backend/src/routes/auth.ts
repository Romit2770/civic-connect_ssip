import { Router } from 'express';
import {
  register,
  login,
  getMe,
  updateProfile,
  changePassword,
  logout,
  sendEmailOtp,
  verifyEmailOtp,
} from '../controllers/authController';
import { authenticate } from '../middleware/auth';

const router = Router();

// Email OTP Verification Routes
router.post('/email/send-otp', sendEmailOtp);
router.post('/email/verify-otp', verifyEmailOtp);

// Standard Authentication Routes
router.post('/register', register);
router.post('/login', login);
router.post('/logout', authenticate, logout);
router.get('/me', authenticate, getMe);
router.put('/me', authenticate, updateProfile);
router.post('/change-password', authenticate, changePassword);

export default router;

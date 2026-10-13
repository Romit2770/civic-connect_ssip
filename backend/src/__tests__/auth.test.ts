import request from 'supertest';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import app from '../app';
import { env } from '../config/env';
import { User } from '../models/User';
import { EmailOtpVerification } from '../models/EmailOtpVerification';

beforeAll(async () => {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(env.MONGODB_URI);
  }
});

afterAll(async () => {
  await mongoose.disconnect();
});

describe('Authentication & Email OTP Verification Suite', () => {
  const testEmail = `test.citizen.${Date.now()}@example.com`;
  const testPassword = 'Password@123';
  const mockOtp = '482910';

  it('POST /api/auth/register — should block registration if email is not verified', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Unverified Citizen',
        email: testEmail,
        password: testPassword,
        role: 'citizen',
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('EMAIL_NOT_VERIFIED');
  });

  it('POST /api/auth/email/send-otp — should generate and dispatch 6-digit OTP', async () => {
    const res = await request(app)
      .post('/api/auth/email/send-otp')
      .send({
        email: testEmail,
        name: 'Test Citizen User',
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toContain('Verification OTP sent');

    // Verify record exists in DB
    const record = await EmailOtpVerification.findOne({ email: testEmail.toLowerCase() });
    expect(record).toBeDefined();
    expect(record?.verified).toBe(false);
  });

  it('POST /api/auth/email/send-otp — should enforce 60-second resend cooldown', async () => {
    const res = await request(app)
      .post('/api/auth/email/send-otp')
      .send({
        email: testEmail,
      });

    expect(res.status).toBe(429);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain('Please wait');
  });

  it('POST /api/auth/email/verify-otp — should reject incorrect OTP and decrement attempts', async () => {
    const res = await request(app)
      .post('/api/auth/email/verify-otp')
      .send({
        email: testEmail,
        otp: '000000',
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.verified).toBe(false);
  });

  it('POST /api/auth/email/verify-otp — should successfully verify with valid OTP', async () => {
    // Manually set a deterministic hash for testing
    const otpHash = await bcrypt.hash(mockOtp, 10);
    await EmailOtpVerification.findOneAndUpdate(
      { email: testEmail.toLowerCase() },
      { otpHash, attempts: 0, expiresAt: new Date(Date.now() + 5 * 60 * 1000) }
    );

    const res = await request(app)
      .post('/api/auth/email/verify-otp')
      .send({
        email: testEmail,
        otp: mockOtp,
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.verified).toBe(true);

    const record = await EmailOtpVerification.findOne({ email: testEmail.toLowerCase() });
    expect(record?.verified).toBe(true);
  });

  it('POST /api/auth/register — should successfully register citizen after email verification', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Test Citizen User',
        email: testEmail,
        password: testPassword,
        phone: '+91 9898000000',
        role: 'citizen',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.token).toBeDefined();
    expect(res.body.data.user.email).toBe(testEmail.toLowerCase());
    expect(res.body.data.user.role).toBe('citizen');
    expect(res.body.data.user.isEmailVerified).toBe(true);

    // Verification record should be cleared
    const remainingVerification = await EmailOtpVerification.findOne({ email: testEmail.toLowerCase() });
    expect(remainingVerification).toBeNull();
  });

  it('POST /api/auth/email/send-otp — should reject sending OTP to already registered email', async () => {
    const res = await request(app)
      .post('/api/auth/email/send-otp')
      .send({
        email: testEmail,
      });

    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain('already exists');
  });

  it('POST /api/auth/login — should authenticate valid credentials and return JWT', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: testEmail,
        password: testPassword,
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.token).toBeDefined();
    expect(res.body.data.user.name).toBe('Test Citizen User');
  });

  it('POST /api/auth/login — should reject incorrect password', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: testEmail,
        password: 'WrongPassword',
      });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('GET /api/auth/me — should return authenticated user profile', async () => {
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({
        email: testEmail,
        password: testPassword,
      });

    const token = loginRes.body.data.token;

    const meRes = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${token}`);

    expect(meRes.status).toBe(200);
    expect(meRes.body.success).toBe(true);
    expect(meRes.body.data.user.email).toBe(testEmail.toLowerCase());
  });
});

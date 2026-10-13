import request from 'supertest';
import mongoose from 'mongoose';
import app from '../app';
import { env } from '../config/env';
import { User } from '../models/User';
import { Complaint } from '../models/Complaint';

let citizenToken: string;
let officerToken: string;
let adminToken: string;
let citizenId: string;
let officerId: string;

beforeAll(async () => {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(env.MONGODB_URI);
  }

  // Create temporary users for testing
  const c = await User.findOne({ email: 'citizen.rahul@example.com' });
  const o = await User.findOne({ email: 'officer.rajesh@civicconnect.gov.in' });
  const a = await User.findOne({ email: 'admin@civicconnect.gov.in' });

  citizenId = c!._id.toString();
  officerId = o!._id.toString();

  const cLogin = await request(app).post('/api/auth/login').send({ email: 'citizen.rahul@example.com', password: 'Citizen@123' });
  citizenToken = cLogin.body.data.token;

  const oLogin = await request(app).post('/api/auth/login').send({ email: 'officer.rajesh@civicconnect.gov.in', password: 'Officer@123' });
  officerToken = oLogin.body.data.token;

  const aLogin = await request(app).post('/api/auth/login').send({ email: 'admin@civicconnect.gov.in', password: 'Admin@123' });
  adminToken = aLogin.body.data.token;
});

afterAll(async () => {
  await mongoose.disconnect();
});

describe('Complaints & Grievance Lifecycle Suite', () => {
  let createdComplaintId: string;
  let createdComplaintNumber: string;

  it('POST /api/complaints — should reject submission when AI assessment token is missing', async () => {
    const res = await request(app)
      .post('/api/complaints')
      .set('Authorization', `Bearer ${citizenToken}`)
      .field('description', 'Deep dangerous pothole near university circle causing vehicle swerves')
      .field('category', 'pothole')
      .field('latitude', '23.0225')
      .field('longitude', '72.5714')
      .field('address', 'University Circle, Ward 1');

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('AI_ASSESSMENT_REQUIRED');
  });

  it('POST /api/complaints — should allow citizen to file a complaint with AI assessment token', async () => {
    // 1. Run AI Assessment
    const aiRes = await request(app)
      .post('/api/ai/classify-complaint')
      .set('Authorization', `Bearer ${citizenToken}`)
      .send({
        description: 'Deep dangerous pothole near university circle causing vehicle swerves',
        category: 'pothole',
        latitude: 23.0225,
        longitude: 72.5714,
        evidenceMetadata: [{ latitude: 23.0225, longitude: 72.5714 }],
        photos: ['data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////wgALCAABAAEBAREA/8QAFBABAAAAAAAAAAAAAAAAAAAAAP/aAAgBAQABPxA='],
      });

    expect(aiRes.status).toBe(200);
    expect(aiRes.body.data.assessmentToken).toBeDefined();
    const token = aiRes.body.data.assessmentToken;

    // 2. Submit Complaint
    const res = await request(app)
      .post('/api/complaints')
      .set('Authorization', `Bearer ${citizenToken}`)
      .field('description', 'Deep dangerous pothole near university circle causing vehicle swerves')
      .field('category', 'pothole')
      .field('latitude', '23.0225')
      .field('longitude', '72.5714')
      .field('address', 'University Circle, Ward 1')
      .field('aiAssessmentToken', token);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.complaint).toBeDefined();
    expect(res.body.data.complaint.complaintNumber).toMatch(/^CC-2026-\d{6}$/);
    expect(res.body.data.complaint.priority).toBeDefined();
    expect(res.body.data.complaint.departmentId).toBeDefined();

    createdComplaintId = res.body.data.complaint._id;
    createdComplaintNumber = res.body.data.complaint.complaintNumber;
  });

  it('GET /api/complaints — should list complaints with filtering', async () => {
    const res = await request(app)
      .get('/api/complaints?category=pothole')
      .set('Authorization', `Bearer ${citizenToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.pagination).toBeDefined();
  });

  it('GET /api/complaints/:id — should retrieve full complaint detail with timeline and comments', async () => {
    const res = await request(app)
      .get(`/api/complaints/${createdComplaintId}`)
      .set('Authorization', `Bearer ${citizenToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.complaintNumber).toBe(createdComplaintNumber);
    expect(Array.isArray(res.body.data.statusHistory)).toBe(true);
  });

  it('POST /api/complaints/:id/comments — should allow citizen and staff communication', async () => {
    const res = await request(app)
      .post(`/api/complaints/${createdComplaintId}/comments`)
      .set('Authorization', `Bearer ${citizenToken}`)
      .send({
        message: 'Could you please fix this before the monsoon downpour tomorrow?',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.comment.message).toContain('monsoon');
  });

  it('POST /api/officers/tasks/:id/start — should allow assigned field officer to mark work in progress', async () => {
    const res = await request(app)
      .post(`/api/officers/tasks/${createdComplaintId}/start`)
      .set('Authorization', `Bearer ${officerToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.complaint.status).toBe('in_progress');
  });

  it('POST /api/officers/tasks/:id/resolve — should allow officer to submit resolution evidence', async () => {
    const res = await request(app)
      .post(`/api/officers/tasks/${createdComplaintId}/resolve`)
      .set('Authorization', `Bearer ${officerToken}`)
      .field('description', 'Pothole excavated, base stabilized, and asphalt hot mix compacted.');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.complaint.status).toBe('verification_pending');
    expect(res.body.data.aiVerification).toBeDefined();
  });

  it('POST /api/complaints/:id/verify — should allow citizen to confirm resolution and close complaint', async () => {
    const res = await request(app)
      .post(`/api/complaints/${createdComplaintId}/verify`)
      .set('Authorization', `Bearer ${citizenToken}`)
      .send({
        isVerified: true,
        rating: 5,
        feedback: 'Excellent work by the municipal repair crew!',
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.complaint.status).toBe('resolved');
    expect(res.body.data.complaint.satisfactionRating).toBe(5);
  });
});

import request from 'supertest';
import mongoose from 'mongoose';
import app from '../app';
import { imageVerificationService } from '../services/imageVerificationService';
import { EvidenceVerification } from '../models/EvidenceVerification';
import { Complaint } from '../models/Complaint';
import { User } from '../models/User';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';

describe('Advanced Image Authenticity & Civic Evidence Verification Engine', () => {
  let officerToken: string;
  let citizenToken: string;
  let officerId: mongoose.Types.ObjectId;
  let citizenId: mongoose.Types.ObjectId;

  beforeAll(async () => {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(env.MONGODB_URI);
    }

    const cLogin = await request(app).post('/api/auth/login').send({ email: 'citizen.rahul@example.com', password: 'Citizen@123' });
    citizenToken = cLogin.body.data.token;

    const oLogin = await request(app).post('/api/auth/login').send({ email: 'admin@civicconnect.gov.in', password: 'Admin@123' });
    officerToken = oLogin.body.data.token;
  });

  afterAll(async () => {
    await mongoose.disconnect();
  });

  describe('Perceptual Hashing & Similarity Check', () => {
    it('should generate deterministic 16-character hexadecimal dHash for an image buffer', () => {
      const sampleBuffer = Buffer.alloc(1024, 128);
      const hash1 = imageVerificationService.calculatePerceptualHash(sampleBuffer);
      const hash2 = imageVerificationService.calculatePerceptualHash(sampleBuffer);

      expect(typeof hash1).toBe('string');
      expect(hash1.length).toBe(16);
      expect(hash1).toBe(hash2);
    });

    it('should compute zero distance for identical perceptual hashes', () => {
      const hash = 'a1b2c3d4e5f60718';
      const distance = imageVerificationService.calculateHammingDistance(hash, hash);
      expect(distance).toBe(0);
    });

    it('should compute correct Hamming distance for differing bit hashes', () => {
      const hash1 = '0000000000000000';
      const hash2 = '0000000000000001';
      const distance = imageVerificationService.calculateHammingDistance(hash1, hash2);
      expect(distance).toBe(1);
    });
  });

  describe('EXIF & Metadata Analysis', () => {
    it('should safely mark missing EXIF as "Metadata unavailable" rather than flagging as fake', () => {
      const strippedBuffer = Buffer.from('RIFF....WEBPVP8 ...');
      const metadata = imageVerificationService.extractMetadata(strippedBuffer, 'image/webp', 'test.webp');

      expect(metadata.available).toBe(false);
      expect(metadata.hasEditingSoftware).toBe(false);
      expect(metadata.findings).toContain(
        'EXIF metadata is unavailable or stripped (standard for web and messaging uploads).'
      );
    });

    it('should detect camera manufacturer metadata if present in buffer', () => {
      const exifBuffer = Buffer.from('Exif..Apple iPhone 15 Pro Max..2026:08:20 10:00:00');
      const metadata = imageVerificationService.extractMetadata(exifBuffer, 'image/jpeg', 'camera.jpg');

      expect(metadata.available).toBe(true);
      expect(metadata.cameraMake).toBe('Apple');
      expect(metadata.captureTimestamp).toBeDefined();
    });

    it('should flag editing software tag without falsely marking image as fake', () => {
      const editedBuffer = Buffer.from('Photoshop 2024..Adobe Software..');
      const metadata = imageVerificationService.extractMetadata(editedBuffer, 'image/jpeg', 'edited.jpg');

      expect(metadata.hasEditingSoftware).toBe(true);
      expect(metadata.software).toBe('Photoshop');
    });
  });

  describe('REST API: POST /api/evidence/verify', () => {
    it('should return 400 when no photo is provided', async () => {
      const res = await request(app).post('/api/evidence/verify').send({});
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('MISSING_IMAGE');
    });

    it('should verify image evidence and return structured multi-signal evaluation', async () => {
      // Create a simulated genuine camera image buffer
      const dummyPhotoBuffer = Buffer.from('FakeJPEGHeader...Apple Camera Photo Evidence Data...');

      const res = await request(app)
        .post('/api/evidence/verify')
        .attach('photo', dummyPhotoBuffer, 'pothole_evidence.jpg')
        .field('category', 'pothole')
        .field('description', 'Severe deep pothole on MG Road near city junction');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.verificationStatus).toBeDefined();
      expect(res.body.data.overallRiskScore).toBeGreaterThanOrEqual(0);
      expect(res.body.data.overallRiskScore).toBeLessThanOrEqual(100);
      expect(res.body.data.assessmentToken).toBeDefined();
      expect(res.body.data.citizenMessage).toBeDefined();
    });
  });

  describe('Human-in-the-loop Municipal Review: POST /api/evidence/:id/human-review', () => {
    it('should reject review submission if user is not authorized staff', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app)
        .post(`/api/evidence/${fakeId}/human-review`)
        .set('Authorization', `Bearer ${citizenToken}`)
        .send({ decision: 'ACCEPTED', notes: 'Citizen trying to approve' });

      expect(res.status).toBe(403);
    });

    it('should allow municipal officers to record auditable human determination and override AI', async () => {
      // Create a test evidence verification record
      const record = await EvidenceVerification.create({
        perceptualHash: '1234567890abcdef',
        verificationStatus: 'REVIEW',
        overallRiskScore: 45,
        confidence: 0.8,
        recommendedAction: 'REVIEW',
        aiVisual: {
          authenticityStatus: 'NEEDS_REVIEW',
          syntheticProbability: 0.2,
          manipulationProbability: 0.1,
          visualArtifacts: [],
          syntheticIndicators: [],
          visualRealismScore: 75,
          reasoningSummary: 'Compression artifact check',
          model: 'gemini-3.6-flash',
          analyzedAt: new Date(),
        },
        civicRelevance: {
          isCivicIssueVisible: true,
          detectedIssueType: 'pothole',
          relevanceConfidence: 0.9,
          categoryMatch: true,
          reasoning: 'Pothole visible',
        },
        metadata: {
          available: false,
          hasEditingSoftware: false,
          fileSizeBytes: 1024,
          mimeType: 'image/jpeg',
          findings: [],
        },
        consistency: {
          locationConsistency: 'NOT_AVAILABLE',
          timestampConsistency: 'NOT_AVAILABLE',
        },
        duplicateCheck: {
          isDuplicate: false,
          similarityScore: 0,
          findings: 'Unique image',
        },
        citizenMessage: 'Evidence check pending',
        officerNotes: 'Review required',
      });

      const res = await request(app)
        .post(`/api/evidence/${record._id}/human-review`)
        .set('Authorization', `Bearer ${officerToken}`)
        .send({
          decision: 'ACCEPTED',
          notes: 'Inspected on-site by Ward Engineer. Genuine asphalt damage verified.',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.verificationStatus).toBe('PASS');
      expect(res.body.data.humanReview).toBeDefined();
      expect(res.body.data.humanReview.decision).toBe('ACCEPTED');
      expect(res.body.data.humanReview.reviewerRole).toBe('municipal_admin');
    });
  });
});

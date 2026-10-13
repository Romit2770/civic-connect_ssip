import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { User, IUser } from '../models/User';
import { EmailOtpVerification } from '../models/EmailOtpVerification';
import { sendOtpEmail } from '../services/emailService';
import { env } from '../config/env';
import { logAuditAction } from '../middleware/audit';

function generateToken(user: IUser): string {
  return jwt.sign(
    {
      userId: user._id.toString(),
      role: user.role,
      departmentId: user.departmentId?.toString(),
    },
    env.JWT_SECRET,
    { expiresIn: env.JWT_EXPIRY as any }
  );
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Dispatches a 6-digit verification OTP to the citizen's email address via Brevo
 */
export async function sendEmailOtp(req: Request, res: Response) {
  try {
    const { email, name } = req.body;

    if (!email || typeof email !== 'string' || !EMAIL_REGEX.test(email.trim())) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address.',
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // 1. Duplicate check: Ensure email is not already registered
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email address already exists. Please sign in.',
      });
    }

    // 2. Cooldown check: Prevent spamming OTP requests (60-second cooldown)
    const existingVerification = await EmailOtpVerification.findOne({ email: normalizedEmail });
    if (existingVerification && existingVerification.lastSentAt) {
      const elapsedMs = Date.now() - new Date(existingVerification.lastSentAt).getTime();
      const COOLDOWN_MS = 60 * 1000;
      if (elapsedMs < COOLDOWN_MS) {
        const remainingSec = Math.ceil((COOLDOWN_MS - elapsedMs) / 1000);
        return res.status(429).json({
          success: false,
          message: `Please wait ${remainingSec} second${remainingSec === 1 ? '' : 's'} before requesting a new OTP.`,
        });
      }
    }

    // 3. Cryptographically secure 6-digit OTP generation
    const otp = crypto.randomInt(100000, 1000000).toString();
    const otpHash = await bcrypt.hash(otp, 10);

    // 4. Upsert verification record with 5-minute expiry
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
    await EmailOtpVerification.findOneAndUpdate(
      { email: normalizedEmail },
      {
        otpHash,
        attempts: 0,
        verified: false,
        expiresAt,
        lastSentAt: new Date(),
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    // 5. Dispatch via Brevo Transactional Email Service
    await sendOtpEmail({
      email: normalizedEmail,
      otp,
      name,
    });

    return res.status(200).json({
      success: true,
      message: 'Verification OTP sent successfully to your email address.',
    });
  } catch (error: any) {
    console.error('❌ Failed to send email verification OTP:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to send verification email. Please try again.',
    });
  }
}

/**
 * Validates the citizen's entered 6-digit OTP against the hashed record in DB
 */
export async function verifyEmailOtp(req: Request, res: Response) {
  try {
    const { email, otp } = req.body;

    if (!email || !otp || typeof otp !== 'string') {
      return res.status(400).json({
        success: false,
        verified: false,
        message: 'Email and 6-digit OTP are required.',
      });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const cleanOtp = otp.trim();

    if (!/^\d{6}$/.test(cleanOtp)) {
      return res.status(400).json({
        success: false,
        verified: false,
        message: 'OTP must be exactly 6 digits.',
      });
    }

    // 1. Fetch verification record
    const record = await EmailOtpVerification.findOne({ email: normalizedEmail });
    if (!record) {
      return res.status(400).json({
        success: false,
        verified: false,
        message: 'No OTP verification request found. Please request a new OTP.',
      });
    }

    // 2. Check if expired
    if (new Date() > new Date(record.expiresAt)) {
      return res.status(400).json({
        success: false,
        verified: false,
        message: 'This OTP has expired. Please request a new OTP.',
      });
    }

    // 3. Check max attempts (limit: 5)
    if (record.attempts >= 5) {
      return res.status(429).json({
        success: false,
        verified: false,
        message: 'Maximum verification attempts exceeded. Please request a new OTP.',
      });
    }

    // 4. Compare hash
    const isMatch = await bcrypt.compare(cleanOtp, record.otpHash);
    if (!isMatch) {
      record.attempts += 1;
      await record.save();
      const remainingAttempts = Math.max(0, 5 - record.attempts);
      return res.status(400).json({
        success: false,
        verified: false,
        message: `Incorrect OTP code. ${remainingAttempts} attempt${remainingAttempts === 1 ? '' : 's'} remaining.`,
      });
    }

    // 5. Successful verification: Extend expiry to 15 mins to give ample time to complete registration form
    record.verified = true;
    record.verifiedAt = new Date();
    record.expiresAt = new Date(Date.now() + 15 * 60 * 1000);
    await record.save();

    return res.status(200).json({
      success: true,
      verified: true,
      message: 'Email verified successfully.',
    });
  } catch (error: any) {
    console.error('❌ Failed to verify email OTP:', error);
    return res.status(500).json({
      success: false,
      verified: false,
      message: error.message || 'An error occurred during verification. Please try again.',
    });
  }
}

export async function register(req: Request, res: Response) {
  try {
    const { name, email, password, phone, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'MISSING_FIELDS',
          message: 'Name, email, and password are required.',
        },
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Check duplicate
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        error: {
          code: 'USER_EXISTS',
          message: 'An account with this email address already exists.',
        },
      });
    }

    // Verify that the email was actually verified via OTP within valid window
    const verification = await EmailOtpVerification.findOne({
      email: normalizedEmail,
      verified: true,
      expiresAt: { $gt: new Date() },
    });

    if (!verification) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'EMAIL_NOT_VERIFIED',
          message: 'Please verify your email address before creating your account.',
        },
      });
    }

    // Citizens can self-register. Staff roles default to citizen unless created by admin
    const assignedRole = role === 'citizen' || !role ? 'citizen' : role;

    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password,
      phone: phone?.trim(),
      role: assignedRole,
      isEmailVerified: true,
    });

    // Cleanup the temporary verification record upon successful account creation
    await EmailOtpVerification.deleteMany({ email: normalizedEmail });

    const token = generateToken(user);

    await logAuditAction({
      req,
      actorId: user._id,
      actorRole: user.role,
      actorName: user.name,
      action: 'USER_REGISTERED',
      entityType: 'User',
      entityId: user._id.toString(),
      details: { email: user.email, role: user.role },
    });

    res.status(201).json({
      success: true,
      message: 'Account registered successfully',
      data: {
        token,
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          phone: user.phone,
          isEmailVerified: true,
        },
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: { code: 'REGISTRATION_FAILED', message: error.message },
    });
  }
}

const DEMO_ACCOUNTS_PROVISION: Record<string, any> = {
  // Citizen Demo Account
  'citizen.rahul@example.com': {
    name: 'Rahul Mehta',
    password: 'Citizen@123',
    phone: '+91 9876543210',
    role: 'citizen',
  },
  // Government Sector Demo Accounts
  'officer.rajesh@civicconnect.gov.in': {
    name: 'Rajesh Patel',
    password: 'Officer@123',
    phone: '+91 9876543211',
    role: 'field_officer',
    badgeNumber: 'FW-PWD-001',
    designation: 'PWD Senior Field Inspector',
  },
  'officer.ramesh@civicconnect.gov.in': {
    name: 'Ramesh Patel',
    password: 'Officer@123',
    phone: '+91 9876543224',
    role: 'field_officer',
    badgeNumber: 'PWD-FW-101',
    designation: 'PWD Senior Field Inspector',
  },
  'officer.suresh@civicconnect.gov.in': {
    name: 'Suresh Patel',
    password: 'Officer@123',
    phone: '+91 9876543225',
    role: 'field_officer',
    badgeNumber: 'SWM-FW-102',
    designation: 'Sanitation & Solid Waste Supervisor',
  },
  'admin@civicconnect.gov.in': {
    name: 'Suresh Sharma',
    password: 'Admin@123',
    phone: '+91 9876543212',
    role: 'municipal_admin',
    badgeNumber: 'ADM-HQ-001',
    designation: 'Municipal Operations Desk',
  },
  'superadmin@civicconnect.gov.in': {
    name: 'Super Administrator',
    password: 'Admin@123',
    phone: '+91 9876543213',
    role: 'super_admin',
    badgeNumber: 'ROOT-001',
    designation: 'State Operations Command',
  },
  // University Sector Demo Accounts
  'admin@university.edu': {
    name: 'Dr. Rahul Patel',
    password: 'University@123',
    phone: '+91 9427102900',
    role: 'university_admin',
    adminId: 'UNI-ADMIN-001',
    username: 'charusat_admin',
    designation: 'Dean of Research & Innovation',
    institutionName: 'Charusat University',
  },
  'univ.admin@nitjsr.ac.in': {
    name: 'Dr. Ramesh Kumar',
    password: 'Univ@123',
    phone: '+91 9431102901',
    role: 'university_admin',
    adminId: 'UNI-ADMIN-002',
    username: 'nitjsr_admin',
    designation: 'Dean of Academic & R&D',
    institutionName: 'National Institute of Technology Jamshedpur',
  },
  'faculty.mentor@bitmesra.ac.in': {
    name: 'Prof. Ananya Sen',
    password: 'Faculty@123',
    phone: '+91 9431102902',
    role: 'faculty_mentor',
    institutionName: 'Birla Institute of Technology Mesra',
  },
  'student.lead@iitism.ac.in': {
    name: 'Aakash Verma',
    password: 'Student@123',
    phone: '+91 9431102903',
    role: 'student_lead',
    institutionName: 'IIT (ISM) Dhanbad',
  },
  // Industry Sector Demo Accounts
  'admin@abc.com': {
    name: 'Amit Shah',
    password: 'Industry@123',
    phone: '+91 9825102900',
    role: 'industry_admin',
    adminId: 'IND-ADMIN-001',
    username: 'abc_admin',
    designation: 'Director of Technology',
    organizationName: 'ABC Technologies Pvt. Ltd.',
  },
  'industry.admin@tatasteel.com': {
    name: 'Suresh Nambiar',
    password: 'Industry@123',
    phone: '+91 9835102904',
    role: 'industry_admin',
    adminId: 'IND-ADMIN-002',
    username: 'tatasteel_admin',
    designation: 'Vice President of Technology',
    organizationName: 'Tata Steel Ltd. Urban Innovation Division',
  },
  'csr.lead@tata.com': {
    name: 'Meera Chawla',
    password: 'Industry@123',
    phone: '+91 9835102905',
    role: 'csr_lead',
    organizationName: 'Tata Community Initiatives Trust',
  },
  'partner.lead@jindalsteel.com': {
    name: 'Rohan Mittal',
    password: 'Industry@123',
    phone: '+91 9835102906',
    role: 'corporate_partner',
    adminId: 'IND-ADMIN-003',
    username: 'jindal_admin',
    designation: 'Director - Infrastructure Solutions',
    organizationName: 'Jindal Steel & Power CSR Wing',
  },
};

export async function login(req: Request, res: Response) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_INPUT', message: 'Email/Mobile and password are required.' },
      });
    }

    const inputLower = email.trim().toLowerCase();
    let user = await User.findOne({
      $or: [{ email: inputLower }, { phone: email.trim() }],
    })
      .select('+password')
      .populate('departmentId', 'name slug');

    // Auto-provision demo account if not in MongoDB
    if (!user && DEMO_ACCOUNTS_PROVISION[inputLower]) {
      const demoData = DEMO_ACCOUNTS_PROVISION[inputLower];
      user = await User.create({
        email: inputLower,
        name: demoData.name,
        password: demoData.password,
        phone: demoData.phone,
        role: demoData.role,
        adminId: demoData.adminId,
        username: demoData.username,
        designation: demoData.designation,
        institutionName: demoData.institutionName,
        organizationName: demoData.organizationName,
        isActive: true,
      });
      // Re-fetch with password select
      user = await User.findById(user._id)
        .select('+password')
        .populate('departmentId', 'name slug');
    }

    if (!user) {
      return res.status(401).json({
        success: false,
        error: { code: 'INVALID_CREDENTIALS', message: 'Invalid email/phone or password.' },
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password.' },
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        error: { code: 'ACCOUNT_DISABLED', message: 'Account is deactivated. Contact municipal admin.' },
      });
    }

    user.lastLoginAt = new Date();
    await user.save();

    const token = generateToken(user);

    await logAuditAction({
      req,
      actorId: user._id,
      actorRole: user.role,
      actorName: user.name,
      action: 'USER_LOGIN',
      entityType: 'User',
      entityId: user._id.toString(),
    });

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          phone: user.phone,
          department: user.departmentId,
          badgeNumber: user.badgeNumber,
          institutionName: user.institutionName,
          organizationName: user.organizationName,
          adminId: user.adminId,
          username: user.username,
          designation: user.designation,
          lastLoginAt: user.lastLoginAt,
        },
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: { code: 'LOGIN_FAILED', message: error.message },
    });
  }
}

export async function getMe(req: Request, res: Response) {
  try {
    const user = await User.findById(req.user!._id)
      .populate('departmentId', 'name slug icon')
      .populate('wardId', 'wardNumber name zone');

    if (!user) {
      return res.status(404).json({
        success: false,
        error: { code: 'USER_NOT_FOUND', message: 'User profile not found.' },
      });
    }

    res.json({
      success: true,
      data: {
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          phone: user.phone,
          department: user.departmentId,
          ward: user.wardId,
          badgeNumber: user.badgeNumber,
          avatar: user.avatar,
          institutionName: user.institutionName,
          organizationName: user.organizationName,
          registrationId: user.registrationId,
          isActive: user.isActive !== false,
          createdAt: user.createdAt,
          lastLoginAt: user.lastLoginAt,
          isEmailVerified: user.isEmailVerified,
        },
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: { code: 'FETCH_PROFILE_FAILED', message: error.message },
    });
  }
}

export async function updateProfile(req: Request, res: Response) {
  try {
    const { name, phone } = req.body;
    const user = await User.findById(req.user!._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (name && typeof name === 'string') user.name = name.trim();
    if (phone !== undefined) user.phone = String(phone).trim();
    await user.save();

    await logAuditAction({
      req,
      action: 'USER_UPDATE_PROFILE',
      entityType: 'User',
      entityId: user._id.toString(),
    });

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          phone: user.phone,
          department: user.departmentId,
          ward: user.wardId,
          badgeNumber: user.badgeNumber,
          avatar: user.avatar,
          registrationId: user.registrationId,
          isActive: user.isActive !== false,
          createdAt: user.createdAt,
          lastLoginAt: user.lastLoginAt,
          isEmailVerified: user.isEmailVerified,
        },
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}

export async function changePassword(req: Request, res: Response) {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword || newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters long.',
      });
    }

    const user = await User.findById(req.user!._id).select('+password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Current password does not match.' });
    }

    user.password = newPassword;
    await user.save();

    await logAuditAction({
      req,
      action: 'PASSWORD_CHANGED',
      entityType: 'User',
      entityId: user._id.toString(),
    });

    res.json({ success: true, message: 'Password changed successfully.' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}

export async function logout(req: Request, res: Response) {
  if (req.user) {
    await logAuditAction({
      req,
      action: 'USER_LOGOUT',
      entityType: 'User',
      entityId: req.user._id.toString(),
    });
  }
  res.json({ success: true, message: 'Logged out successfully' });
}

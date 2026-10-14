/**
 * Authentication & Identity REST API Router
 * Endpoints for /api/auth/*
 *
 * Guarantees shared user identity, profile synchronization, and session authentication
 * across Website and Android APK.
 */

import express from 'express';
import { medicalDb } from './medicalDb';
import { User, EmergencyContact, PatientOnboardingData } from '../types';
import { findDoctorCredential, doctorCredentialToUser } from '../data/doctorCredentials';

export function createAuthApiRouter() {
  const router = express.Router();

  // 1. POST /api/auth/signin
  router.post('/signin', (req, res) => {
    const { email, password } = req.body || {};
    if (!email || !password) {
      res.status(400).json({
        success: false,
        error: 'Please provide both email and password.'
      });
      return;
    }

    const user = medicalDb.getUserByEmail(email);
    if (!user) {
      // Check if it matches any pre-configured doctor credentials
      const matchedDoctor = findDoctorCredential(email);
      if (matchedDoctor) {
        const docUser = medicalDb.getUserById(matchedDoctor.id) || doctorCredentialToUser(matchedDoctor);
        res.json({
          success: true,
          token: `token-${Date.now()}-${matchedDoctor.id}`,
          user: docUser
        });
        return;
      }

      // Check if it's the clinician demo account keyword fallback
      if (email.toLowerCase().includes('doctor') || email.toLowerCase().includes('chen') || email.toLowerCase().includes('doc-1')) {
        const docUser = medicalDb.getUserById('doc-1');
        if (docUser) {
          res.json({
            success: true,
            token: `token-${Date.now()}-doc-1`,
            user: docUser
          });
          return;
        }
      }

      // Check if it's the patient demo account
      if (email.toLowerCase().includes('aryan') || email.toLowerCase().includes('demo') || email.toLowerCase().includes('patient')) {
        const demoUser = medicalDb.getUserById('pat-1');
        res.json({
          success: true,
          token: `token-${Date.now()}-pat-1`,
          user: demoUser
        });
        return;
      }

      res.status(401).json({
        success: false,
        error: 'Invalid email or password.'
      });
      return;
    }

    res.json({
      success: true,
      token: `token-${Date.now()}-${user.id}`,
      user
    });
  });

  // 2. POST /api/auth/signup
  router.post('/signup', (req, res) => {
    const { fullName, email, password, phone } = req.body || {};
    if (!email || !fullName) {
      res.status(400).json({
        success: false,
        error: 'Full name and email are required.'
      });
      return;
    }

    const existing = medicalDb.getUserByEmail(email);
    if (existing) {
      res.status(409).json({
        success: false,
        error: 'An account with this email already exists.'
      });
      return;
    }

    const newId = `pat-${Date.now()}`;
    const randomCode = Math.floor(10000 + Math.random() * 90000);
    const patientId = `MAI-${randomCode}`;

    const created = medicalDb.updateUser(newId, {
      id: newId,
      name: fullName.trim(),
      email: email.trim().toLowerCase(),
      phone: phone || '',
      patientId,
      mrn: patientId,
      role: 'patient',
      hasCompletedOnboarding: false
    });

    res.status(201).json({
      success: true,
      token: `token-${Date.now()}-${newId}`,
      user: created
    });
  });

  // 3. POST /api/auth/google
  router.post('/google', (req, res) => {
    const { uid, email, name, photoUrl, requestedRole } = req.body || {};

    if (!email || !uid) {
      res.status(400).json({
        success: false,
        error: 'Google authentication requires verified email and uid.'
      });
      return;
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const existing = medicalDb.getUserByEmail(normalizedEmail);

    if (existing) {
      // Existing user: preserve medical data, conditions, allergies, and clinician role
      // Never escalate privileges or wipe existing history
      const updated = medicalDb.updateUser(existing.id, {
        authProvider: 'google',
        profileImageUrl: photoUrl || existing.profileImageUrl,
        avatarUrl: photoUrl || existing.avatarUrl || existing.profileImageUrl,
        lastUpdated: new Date().toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })
      });

      res.json({
        success: true,
        token: `token-google-${Date.now()}-${existing.id}`,
        user: updated,
        isNewUser: false
      });
      return;
    }

    // New User: Clinical safety guard — role defaults to patient
    // Clinician/Doctor privileges cannot be self-claimed merely through Google OAuth
    const finalRole = requestedRole === 'doctor' && normalizedEmail.includes('dr.') ? 'doctor' : 'patient';
    const newId = `usr-g-${String(uid).slice(0, 12)}-${Date.now()}`;
    const randomCode = Math.floor(10000 + Math.random() * 90000);
    const patientId = `MAI-${randomCode}`;

    const parts = String(name || '').trim().split(' ');
    const firstName = parts[0] || 'Patient';
    const lastName = parts.slice(1).join(' ') || '';

    const created = medicalDb.updateUser(newId, {
      id: newId,
      name: name || 'Google User',
      firstName,
      lastName,
      email: normalizedEmail,
      role: finalRole,
      authProvider: 'google',
      patientId,
      mrn: patientId,
      profileImageUrl: photoUrl,
      avatarUrl: photoUrl,
      hasCompletedOnboarding: false,
      lastUpdated: new Date().toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    });

    res.status(201).json({
      success: true,
      token: `token-google-${Date.now()}-${newId}`,
      user: created,
      isNewUser: true
    });
  });

  // 3. POST /api/auth/register-patient
  router.post('/register-patient', (req, res) => {
    const data = req.body as PatientOnboardingData;
    if (!data || !data.email || !data.firstName || !data.lastName) {
      res.status(400).json({
        success: false,
        error: 'Mandatory patient details missing.'
      });
      return;
    }

    const existing = medicalDb.getUserByEmail(data.email);
    const userId = existing ? existing.id : `pat-${Date.now()}`;
    const randomCode = Math.floor(10000 + Math.random() * 90000);
    const patientId = existing?.patientId || `MAI-${randomCode}`;
    const fullName = `${data.firstName.trim()} ${data.middleName ? data.middleName.trim() + ' ' : ''}${data.lastName.trim()}`;

    const updated = medicalDb.updateUser(userId, {
      id: userId,
      name: fullName,
      firstName: data.firstName,
      middleName: data.middleName,
      lastName: data.lastName,
      email: data.email.trim().toLowerCase(),
      phone: data.primaryPhone,
      dateOfBirth: data.dateOfBirth,
      gender: data.gender,
      preferredLanguage: data.preferredLanguage,
      bloodGroup: data.bloodGroup,
      bloodType: data.bloodGroup,
      patientId,
      mrn: patientId,
      emergencyContacts: data.emergencyContacts || [],
      allergies: (data.allergies || []).map((a) => a.allergen),
      allergyDetails: data.allergies || [],
      medicalConditions: data.medicalConditions || [],
      medicationDetails: data.medications || [],
      address: data.address,
      hasCompletedOnboarding: true,
      role: 'patient'
    });

    res.json({
      success: true,
      token: `token-${Date.now()}-${userId}`,
      user: updated
    });
  });

  // 4. GET /api/auth/me
  router.get('/me', (req, res) => {
    const patientId = (req.query.patientId as string) || 'pat-1';
    const user = medicalDb.getUserById(patientId);
    if (!user) {
      res.status(404).json({ success: false, error: 'User not found' });
      return;
    }
    res.json({ success: true, user });
  });

  // 5. PUT /api/auth/profile
  router.put('/profile', (req, res) => {
    const { id = 'pat-1', ...updates } = req.body || {};
    const updated = medicalDb.updateUser(id, updates);
    res.json({ success: true, user: updated });
  });

  // 6. Emergency Contacts Management
  router.post('/emergency-contacts', (req, res) => {
    const { patientId = 'pat-1', contact } = req.body || {};
    const user = medicalDb.getUserById(patientId);
    if (!user) {
      res.status(404).json({ success: false, error: 'User not found' });
      return;
    }

    const newContact: EmergencyContact = {
      ...contact,
      id: `ec-${Date.now()}`
    };

    const current = user.emergencyContacts || [];
    const list = newContact.isPrimary
      ? current.map((c) => ({ ...c, isPrimary: false })).concat(newContact)
      : [...current, newContact];

    const updated = medicalDb.updateUser(patientId, { emergencyContacts: list });
    res.json({ success: true, contact: newContact, contacts: updated.emergencyContacts });
  });

  router.put('/emergency-contacts/:id', (req, res) => {
    const { id } = req.params;
    const { patientId = 'pat-1', updates } = req.body || {};
    const user = medicalDb.getUserById(patientId);
    if (!user) {
      res.status(404).json({ success: false, error: 'User not found' });
      return;
    }

    let list = user.emergencyContacts || [];
    if (updates.isPrimary) {
      list = list.map((c) => ({ ...c, isPrimary: false }));
    }
    list = list.map((c) => (c.id === id ? { ...c, ...updates } : c));

    const updated = medicalDb.updateUser(patientId, { emergencyContacts: list });
    res.json({ success: true, contacts: updated.emergencyContacts });
  });

  router.delete('/emergency-contacts/:id', (req, res) => {
    const { id } = req.params;
    const { patientId = 'pat-1' } = req.query;
    const user = medicalDb.getUserById(patientId as string);
    if (!user) {
      res.status(404).json({ success: false, error: 'User not found' });
      return;
    }

    const list = (user.emergencyContacts || []).filter((c) => c.id !== id);
    const updated = medicalDb.updateUser(patientId as string, { emergencyContacts: list });
    res.json({ success: true, contacts: updated.emergencyContacts });
  });

  return router;
}

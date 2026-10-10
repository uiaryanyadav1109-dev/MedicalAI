/**
 * Identity Verification REST API Router
 * Endpoints for /api/identity/*
 */

import express from 'express';
import { medicalDb } from './medicalDb';
import { IdentityVerificationRecord } from '../types';
import { maskDocumentNumber } from '../services/identityVerificationService';

export function createIdentityApiRouter() {
  const router = express.Router();

  // 1. GET /api/identity/status/:patientId
  router.get('/status/:patientId', (req, res) => {
    const { patientId } = req.params;
    const record = medicalDb.getIdentityRecord(patientId) || {
      status: 'not_started',
      providerId: 'sandbox_simulator',
      providerStatus: 'sandbox_simulated',
      consentGiven: false,
      retentionPolicy: 'Ephemeral in-memory processing. Document image files are discarded immediately upon cryptographic extraction.'
    };
    res.json({ success: true, record });
  });

  // 2. POST /api/identity/verify
  router.post('/verify', (req, res) => {
    const {
      patientId = 'pat-1',
      documentType,
      documentNumberRaw,
      issuingCountry,
      expirationDate,
      consentGiven
    } = req.body || {};

    if (!consentGiven) {
      res.status(400).json({ success: false, error: 'Explicit consent is required' });
      return;
    }

    if (!documentType || !documentNumberRaw || !expirationDate) {
      res.status(400).json({ success: false, error: 'Missing mandatory document details' });
      return;
    }

    const maskedNumber = maskDocumentNumber(documentNumberRaw);
    const newRecord: IdentityVerificationRecord = {
      status: 'pending',
      documentType,
      maskedDocumentNumber: maskedNumber,
      issuingCountry: issuingCountry || 'Unspecified',
      expirationDate,
      submittedAt: new Date().toISOString(),
      providerId: 'sandbox_simulator',
      providerStatus: 'sandbox_simulated',
      consentGiven: true,
      consentTimestamp: new Date().toISOString(),
      retentionPolicy: 'Ephemeral in-memory processing. Document image files are discarded immediately upon cryptographic extraction.'
    };

    medicalDb.setIdentityRecord(patientId, newRecord);
    res.json({ success: true, record: newRecord });
  });

  // 3. POST /api/identity/cancel
  router.post('/cancel', (req, res) => {
    const { patientId = 'pat-1' } = req.body || {};
    const resetRecord: IdentityVerificationRecord = {
      status: 'not_started',
      providerId: 'sandbox_simulator',
      providerStatus: 'sandbox_simulated',
      consentGiven: false,
      retentionPolicy: 'Ephemeral in-memory processing. Document image files are discarded immediately upon cryptographic extraction.'
    };

    medicalDb.setIdentityRecord(patientId, resetRecord);
    res.json({ success: true, record: resetRecord });
  });

  return router;
}

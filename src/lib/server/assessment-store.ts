import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import {
  AssessmentTokenSession,
  IndependentHumanAssessment,
  AssessmentSubmissionPayload,
} from '@/types/assessment';
import { CakeCategory, StorageCondition } from '@/types/test-run';

const DATA_DIR = path.join(process.cwd(), 'data');
const SESSIONS_FILE = path.join(DATA_DIR, 'assessment-sessions.json');

// In-memory cache synced with disk file
let sessionsCache: Map<string, AssessmentTokenSession> | null = null;

function ensureDataDirectory() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function loadSessions(): Map<string, AssessmentTokenSession> {
  if (sessionsCache) return sessionsCache;

  ensureDataDirectory();
  sessionsCache = new Map<string, AssessmentTokenSession>();

  if (fs.existsSync(SESSIONS_FILE)) {
    try {
      const content = fs.readFileSync(SESSIONS_FILE, 'utf-8');
      const list = JSON.parse(content) as AssessmentTokenSession[];
      for (const item of list) {
        sessionsCache.set(item.token, item);
      }
    } catch (err) {
      console.error('Error loading assessment sessions file:', err);
    }
  }

  return sessionsCache;
}

function persistSessions() {
  if (!sessionsCache) return;
  ensureDataDirectory();
  try {
    const list = Array.from(sessionsCache.values());
    fs.writeFileSync(SESSIONS_FILE, JSON.stringify(list, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error persisting assessment sessions file:', err);
  }
}

export class ServerAssessmentStore {
  /**
   * Create an unguessable token session for a test run (valid for 2 hours)
   */
  public static createSession(params: {
    testId: string;
    sampleId: string;
    cakeCategory: CakeCategory;
    storageCondition: StorageCondition;
  }): AssessmentTokenSession {
    const sessions = loadSessions();

    // Generate 32-char unguessable hex token
    const token = crypto.randomBytes(16).toString('hex');
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 2 * 60 * 60 * 1000); // 2 hours

    const session: AssessmentTokenSession = {
      token,
      testId: params.testId,
      sampleId: params.sampleId,
      cakeCategory: params.cakeCategory,
      storageCondition: params.storageCondition,
      createdAt: now.toISOString(),
      expiresAt: expiresAt.toISOString(),
      status: 'Pending',
    };

    sessions.set(token, session);
    persistSessions();
    return session;
  }

  /**
   * Retrieve session by token with expiry check
   */
  public static getSession(token: string): AssessmentTokenSession | null {
    const sessions = loadSessions();
    const session = sessions.get(token);
    if (!session) return null;

    // Check expiry
    if (session.status === 'Pending' && new Date(session.expiresAt).getTime() < Date.now()) {
      session.status = 'Expired';
      persistSessions();
    }

    return session;
  }

  /**
   * Submit assessment from second device
   */
  public static submitAssessment(
    token: string,
    payload: AssessmentSubmissionPayload
  ): { success: boolean; error?: string; assessment?: IndependentHumanAssessment } {
    const session = this.getSession(token);
    if (!session) {
      return { success: false, error: 'Assessment token not found or invalid' };
    }

    if (session.status === 'Expired') {
      return { success: false, error: 'Assessment session has expired' };
    }

    if (session.status === 'Submitted') {
      return { success: false, error: 'Assessment has already been submitted for this test' };
    }

    const assessment: IndependentHumanAssessment = {
      id: `ASM-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`,
      testId: session.testId,
      token,
      visualCondition: payload.visualCondition,
      smellAssessment: payload.smellAssessment,
      humanAssessment: payload.humanAssessment,
      confidence: payload.confidence,
      observations: payload.observations?.trim() || undefined,
      assessorIdentifier: payload.assessorIdentifier?.trim() || undefined,
      submittedAt: new Date().toISOString(),
    };

    session.assessment = assessment;
    session.status = 'Submitted';
    persistSessions();

    return { success: true, assessment };
  }

  /**
   * List all stored sessions
   */
  public static getAllSessions(): AssessmentTokenSession[] {
    const sessions = loadSessions();
    return Array.from(sessions.values());
  }
}

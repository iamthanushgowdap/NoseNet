import { IStorageAdapter } from '@/lib/storage/storage-adapter';
import { DemoLoginSchema } from '@/lib/validation/auth.schema';
import { DemoRole, DemoSession } from '@/types/auth';
import { generateId } from '@/lib/utils';

export class AuthService {
  constructor(private storage: IStorageAdapter) {}

  async getSession(): Promise<DemoSession | null> {
    return this.storage.getSession();
  }

  async login(displayName: string, role: DemoRole): Promise<DemoSession> {
    const validated = DemoLoginSchema.parse({ displayName, role });
    const session: DemoSession = {
      userId: generateId('user'),
      displayName: validated.displayName,
      role: validated.role,
      loginAt: new Date().toISOString(),
    };
    await this.storage.setSession(session);
    return session;
  }

  async switchRole(newRole: DemoRole): Promise<DemoSession | null> {
    const current = await this.storage.getSession();
    if (!current) return null;
    const updated: DemoSession = {
      ...current,
      role: newRole,
    };
    await this.storage.setSession(updated);
    return updated;
  }

  async logout(): Promise<void> {
    await this.storage.setSession(null);
  }
}

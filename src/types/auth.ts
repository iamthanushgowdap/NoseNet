export type DemoRole = 'researcher' | 'assessor';

export interface DemoSession {
  userId: string;
  displayName: string;
  role: DemoRole;
  loginAt: string;
}

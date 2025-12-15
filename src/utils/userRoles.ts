export const ALLOWED_EMAIL_DOMAINS = ['@fpt.edu.vn', '@fe.edu.vn'] as const;

export const ROLE_ID_MAP = {
  student: 1,
  lecturer: 2,
  staff: 3,
  security: 4,
  admin: 5,
} as const;

export type SupportedRole = keyof typeof ROLE_ID_MAP;
export type RegistrableRole = Exclude<SupportedRole, 'admin'>;

export const REGISTRABLE_ROLES: RegistrableRole[] = ['student', 'lecturer', 'staff', 'security'];

export const isAllowedEmailDomain = (email: string): boolean => {
  const normalized = email.toLowerCase();
  return ALLOWED_EMAIL_DOMAINS.some((domain) => normalized.endsWith(domain));
};

export const inferCampusFromEmail = (email: string): 'FU_FPT' | 'NVH' => {
  return email.toLowerCase().endsWith('@fe.edu.vn') ? 'NVH' : 'FU_FPT';
};

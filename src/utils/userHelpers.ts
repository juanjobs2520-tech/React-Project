import { StudentProfile, TeacherProfile, User } from '../models/User';

export const getProfile = (user: User): TeacherProfile | StudentProfile | null => {
  if (user.profile && typeof user.profile === 'object') {
    return user.profile as TeacherProfile | StudentProfile;
  }
  return null;
};

export const getUserFullName = (user: User): string => {
  const profile = getProfile(user);
  if (profile?.first_name || profile?.last_name) {
    return `${profile.first_name ?? ''} ${profile.last_name ?? ''}`.trim();
  }
  return user.email ?? user.code ?? '—';
};

export const formatDate = (value?: string): string => {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString('es-CO', { year: 'numeric', month: 'short', day: 'numeric' });
};

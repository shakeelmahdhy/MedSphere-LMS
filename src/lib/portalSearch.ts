import { coursesAPI, adminAPI, userAPI } from './api';

export type SearchResult = {
  label: string;
  path: string;
  type: 'course' | 'user' | 'page';
  subtitle?: string;
};

let learnerIndexCache: SearchResult[] | null = null;
let adminIndexCache: SearchResult[] | null = null;

const learnerPages: SearchResult[] = [
  { label: 'Dashboard', path: '/dashboard', type: 'page' },
  { label: 'My Courses', path: '/dashboard/courses', type: 'page' },
  { label: 'Browse Courses', path: '/dashboard/browse', type: 'page' },
  { label: 'Schedule', path: '/dashboard/schedule', type: 'page' },
  { label: 'Certificates', path: '/dashboard/certificates', type: 'page' },
  { label: 'Community', path: '/dashboard/community', type: 'page' },
  { label: 'Messages', path: '/dashboard/messages', type: 'page' },
  { label: 'Profile', path: '/dashboard/profile', type: 'page' },
  { label: 'Settings', path: '/dashboard/settings', type: 'page' },
];

const adminPages: SearchResult[] = [
  { label: 'Admin Dashboard', path: '/admin/dashboard', type: 'page' },
  { label: 'Course Management', path: '/admin/dashboard/courses', type: 'page' },
  { label: 'User Management', path: '/admin/dashboard/users', type: 'page' },
  { label: 'Team Management', path: '/admin/dashboard/teams', type: 'page' },
  { label: 'Schedule Management', path: '/admin/dashboard/schedules', type: 'page' },
  { label: 'Analytics', path: '/admin/dashboard/analytics', type: 'page' },
  { label: 'Settings', path: '/admin/dashboard/settings', type: 'page' },
];

export async function buildLearnerSearchIndex(): Promise<SearchResult[]> {
  if (learnerIndexCache) return learnerIndexCache;

  const items: SearchResult[] = [...learnerPages];

  try {
    const [published, enrolled] = await Promise.all([
      coursesAPI.getAll('published'),
      userAPI.getMyCourses(),
    ]);

    published.forEach((course) => {
      items.push({
        label: course.title,
        path: `/dashboard/courses/${course.id}`,
        type: 'course',
        subtitle: course.category,
      });
    });

    enrolled.forEach((enrollment) => {
      if (!enrollment.course) return;
      const path = `/dashboard/courses/${enrollment.course_id}`;
      if (!items.some((i) => i.path === path)) {
        items.push({
          label: enrollment.course.title,
          path,
          type: 'course',
          subtitle: 'Enrolled',
        });
      }
    });
  } catch {
    // Pages still searchable if API fails
  }

  learnerIndexCache = items;
  return items;
}

export async function buildAdminSearchIndex(): Promise<SearchResult[]> {
  if (adminIndexCache) return adminIndexCache;

  const items: SearchResult[] = [...adminPages];

  try {
    const [courses, users] = await Promise.all([
      coursesAPI.getAll(),
      adminAPI.getUsers(),
    ]);

    courses.forEach((course) => {
      items.push({
        label: course.title,
        path: '/admin/dashboard/courses',
        type: 'course',
        subtitle: `${course.status} · ${course.category}`,
      });
    });

    users
      .filter((u) => u.role === 'learner')
      .forEach((user) => {
        items.push({
          label: user.name,
          path: '/admin/dashboard/users',
          type: 'user',
          subtitle: user.email,
        });
      });
  } catch {
    // Pages still searchable
  }

  adminIndexCache = items;
  return items;
}

export function filterSearchResults(index: SearchResult[], query: string): SearchResult[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return index
    .filter(
      (item) =>
        item.label.toLowerCase().includes(q) ||
        item.subtitle?.toLowerCase().includes(q) ||
        item.type.includes(q)
    )
    .slice(0, 12);
}

export function clearSearchCaches() {
  learnerIndexCache = null;
  adminIndexCache = null;
}

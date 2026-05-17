// API Configuration and Client
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

// Helper function to get auth token
const getAuthToken = (): string | null => {
  return localStorage.getItem('token');
};

// Helper function to get auth headers
const getAuthHeaders = (): HeadersInit => {
  const token = getAuthToken();
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

// API Client with error handling
async function apiClient<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const config: RequestInit = {
    ...options,
    headers: {
      ...getAuthHeaders(),
      ...options.headers,
    },
  };

  // If the body is FormData, delete the Content-Type header so the browser sets it automatically with the boundary
  if (config.body instanceof FormData) {
    const headers = config.headers as Record<string, string>;
    delete headers['Content-Type'];
  }

  try {
    const response = await fetch(url, config);

    if (!response.ok) {
      if (response.status === 401 && !endpoint.includes('/auth/login')) {
        localStorage.clear();
        window.location.href = '/login';
        throw new Error('Session expired. Please login again.');
      }
      const error = await response.json().catch(() => ({
        detail: response.statusText,
      }));
      throw new Error(error.detail || 'An error occurred');
    }

    return await response.json();
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Network error occurred');
  }
}

// ==================== AUTH API ====================

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  role: 'learner' | 'admin';
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: {
    id: number;
    name: string;
    email: string;
    role: 'admin' | 'learner';
    is_active: boolean;
    created_at: string;
    avatar_url?: string;
    bio?: string;
  };

}

export const authAPI = {
  login: (data: LoginRequest) =>
    apiClient<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  register: (data: RegisterRequest) =>
    apiClient<{ success: boolean; message: string; user: any }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  logout: () =>
    apiClient<{ success: boolean }>('/auth/logout', {
      method: 'POST',
    }),

  getCurrentUser: () =>
    apiClient<any>('/auth/me', {
      method: 'GET',
    }),

  changePassword: (currentPassword: string, newPassword: string) =>
    apiClient<{ success: boolean }>('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({
        current_password: currentPassword,
        new_password: newPassword,
      }),
    }),

  checkAdminExists: () => apiClient<{ exists: boolean }>('/auth/admin-exists'),

  updateProfile: (data: Partial<any>) =>
    apiClient<any>('/auth/me', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  uploadProfilePicture: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return apiClient<{ url: string }>('/users/profile-picture', {
      method: 'POST',
      body: formData,
    });
  },
};

// ==================== COURSES API ====================

export interface LearnerAnalytics {
  courses_in_progress: number;
  certificates_earned: number;
  learning_hours: number;
  completion_rate: number;
}

export interface Course {
  id: number;
  title: string;
  description: string;
  category: string;
  type: string;
  level: string;
  status: string;
  price: number;
  duration: string;
  thumbnail_url?: string;
  instructor_id: number;
  created_at: string;
  enrolled_count?: number;
  completed_count?: number;
}

export interface CreateCourseRequest {
  title: string;
  description: string;
  category: string;
  type: string;
  price?: number;
  duration?: string;
  level?: string;
  contents?: any[];
  quizzes?: any[];
}

export const coursesAPI = {
  getAll: (status?: string) => {
    const params = status ? `?status=${status}` : '';
    return apiClient<Course[]>(`/courses${params}`);
  },

  getById: (id: string) => apiClient<Course>(`/courses/${id}`),

  create: (data: CreateCourseRequest) =>
    apiClient<Course>('/courses', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: string, data: Partial<CreateCourseRequest>) =>
    apiClient<Course>(`/courses/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    apiClient<{ success: boolean }>(`/courses/${id}`, {
      method: 'DELETE',
    }),

  buy: (id: string) =>
    apiClient<{ success: boolean }>(`/courses/${id}/buy`, {
      method: 'POST',
    }),

  publish: (id: string) =>
    apiClient<{ success: boolean }>(`/courses/${id}/publish`, {
      method: 'POST',
    }),

  archive: (id: string) =>
    apiClient<{ success: boolean }>(`/courses/${id}/archive`, {
      method: 'POST',
    }),

  enroll: (id: string, userIds: string[], dueDate?: string) =>
    apiClient<{ success: boolean }>(`/courses/${id}/enroll`, {
      method: 'POST',
      body: JSON.stringify({ user_ids: userIds, due_date: dueDate }),
    }),

  withdraw: (id: string, userIds: string[]) =>
    apiClient<{ success: boolean }>(`/courses/${id}/withdraw`, {
      method: 'POST',
      body: JSON.stringify({ user_ids: userIds }),
    }),

  getEnrollments: (id: string) =>
    apiClient<any[]>(`/courses/${id}/enrollments`),
};

// ==================== USER API ====================

export const userAPI = {
  getMyCourses: () => apiClient<any[]>('/users/me/courses'),

  getCourseProgress: (courseId: string) =>
    apiClient<any>(`/users/me/courses/${courseId}/progress`),

  getMyCertificates: () => apiClient<any[]>('/users/me/certificates'),

  getDashboard: () => apiClient<any>('/users/me/dashboard'),
  getEnrollment: (courseId: string) => apiClient<any>(`/enrollments/course/${courseId}`),
  completeContent: (enrollmentId: string, contentId: string) =>
    apiClient<{ success: boolean; progress: number }>(`/enrollments/${enrollmentId}/complete-content/${contentId}`, {
      method: 'POST',
    }),
  submitQuiz: (quizId: string, data: { course_id: number; answers: any[] }) =>
    apiClient<any>(`/quizzes/${quizId}/submit`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};

// ==================== ADMIN API ====================

export interface CreateUserRequest {
  name: string;
  email: string;
  password: string;
  role: string;
  organization?: string;
}

export const adminAPI = {
  // Tasks & Assignments
  getEnrolledUsers: (courseId: string) => apiClient<any[]>(`/courses/${courseId}/enrolled-users`),
  assignTasks: (data: any) => apiClient<any>('/admin/tasks/assign', {
    method: 'POST',
    body: JSON.stringify(data),
  }),

  // Users
  getUsers: (status?: string) => {
    const params = status ? `?status=${status}` : '';
    return apiClient<any[]>(`/admin/users${params}`);
  },

  getUser: (id: string) => apiClient<any>(`/admin/users/${id}`),

  createUser: (data: CreateUserRequest) =>
    apiClient<{ success: boolean }>('/admin/users', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateUser: (id: string, data: Partial<any>) =>
    apiClient<{ success: boolean }>(`/admin/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  deleteUser: (id: string) =>
    apiClient<{ success: boolean }>(`/admin/users/${id}`, {
      method: 'DELETE',
    }),

  bulkAssignCourse: (userIds: string[], courseId: string, dueDate?: string) =>
    apiClient<{ success: boolean }>('/admin/users/bulk-assign-course', {
      method: 'POST',
      body: JSON.stringify({ user_ids: userIds, course_id: courseId, due_date: dueDate }),
    }),

  bulkAssignGroup: (userIds: string[], groupId: string) =>
    apiClient<{ success: boolean }>('/admin/users/bulk-assign-group', {
      method: 'POST',
      body: JSON.stringify({ user_ids: userIds, group_id: groupId }),
    }),

  // Groups
  getGroups: () => apiClient<any[]>('/admin/groups'),

  createGroup: (name: string, location: string) =>
    apiClient<{ success: boolean }>('/admin/groups', {
      method: 'POST',
      body: JSON.stringify({ name, location }),
    }),

  updateGroup: (id: string, name: string, location: string) =>
    apiClient<{ success: boolean }>(`/admin/groups/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ name, location }),
    }),

  deleteGroup: (id: string) =>
    apiClient<{ success: boolean }>(`/admin/groups/${id}`, {
      method: 'DELETE',
    }),

  // Teams
  getTeams: () => apiClient<any[]>('/admin/teams'),

  createTeam: (name: string, location: string, adminId?: string) =>
    apiClient<{ success: boolean }>('/admin/teams', {
      method: 'POST',
      body: JSON.stringify({ name, location, admin_id: adminId }),
    }),

  updateTeam: (id: string, name: string, location: string, adminId?: string) =>
    apiClient<{ success: boolean }>(`/admin/teams/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ name, location, admin_id: adminId }),
    }),

  deleteTeam: (id: string) =>
    apiClient<{ success: boolean }>(`/admin/teams/${id}`, {
      method: 'DELETE',
    }),

  getTeamCourses: (teamId: string | number) => apiClient<any[]>(`/admin/team-learning-stats/${teamId}`),

  addTeamMember: (teamId: string | number, userId: string | number) =>
    apiClient<{ success: boolean }>(`/admin/teams/${teamId}/members`, {
      method: 'POST',
      body: JSON.stringify({ user_id: userId }),
    }),

  removeTeamMember: (teamId: string | number, userId: string | number) =>
    apiClient<{ success: boolean }>(`/admin/teams/${teamId}/members/${userId}`, {
      method: 'DELETE',
    }),
  // Roles
  getRoles: () => apiClient<any[]>('/admin/roles'),

  createRole: (name: string, description: string, permissions: string[]) =>
    apiClient<{ success: boolean }>('/admin/roles', {
      method: 'POST',
      body: JSON.stringify({ name, description, permissions }),
    }),

  updateRole: (id: string, name: string, description: string, permissions: string[]) =>
    apiClient<{ success: boolean }>(`/admin/roles/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ name, description, permissions }),
    }),

  deleteRole: (id: string) =>
    apiClient<{ success: boolean }>(`/admin/roles/${id}`, {
      method: 'DELETE',
    }),

  // Analytics
  getDashboard: () => apiClient<any>('/admin/analytics/dashboard'),

  // Schedules
  getAllSchedules: () => apiClient<any[]>('/admin/schedules'),
  createSchedule: (data: any) => apiClient<any>('/admin/schedules', {
    method: 'POST',
    body: JSON.stringify(data)
  }),

  deleteSchedule: (id: string | number) => apiClient<{ success: boolean }>(`/admin/schedules/${id}`, {
    method: 'DELETE',
  }),
  // Community
  createChannel: (data: any) => apiClient<any>('/admin/community/channels', {
    method: 'POST',
    body: JSON.stringify(data)
  }),

  deleteChannel: (id: string | number) => apiClient<{ success: boolean }>(`/admin/community/channels/${id}`, {
    method: 'DELETE',
  }),
  // Courses (re-using existing coursesAPI for admin if needed)
  getCourses: () => apiClient<any[]>('/courses'),

  // Certificates
  getAllCertificates: () => apiClient<any[]>('/admin/certificates/all'),
  generateCertificate: (data: any) => apiClient<any>('/admin/certificates/generate', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  deleteCertificate: (id: string | number) => apiClient<{ success: boolean }>(`/admin/certificates/${id}`, {
    method: 'DELETE',
  }),
  uploadFile: (file: File, onProgress?: (percent: number) => void) => {
    return new Promise<{ url: string; filename: string }>((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      const formData = new FormData();
      formData.append('file', file);

      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable && onProgress) {
          const percent = Math.round((e.loaded / e.total) * 100);
          onProgress(percent);
        }
      });

      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve(JSON.parse(xhr.responseText));
        } else {
          try {
            const error = JSON.parse(xhr.responseText);
            reject(new Error(error.detail || xhr.statusText));
          } catch {
            reject(new Error(xhr.statusText));
          }
        }
      });

      xhr.addEventListener('error', () => reject(new Error('Network error')));

      xhr.open('POST', `${API_BASE_URL}/upload`);
      const token = getAuthToken();
      if (token) xhr.setRequestHeader('Authorization', `Bearer ${token}`);
      xhr.send(formData);
    });
  },
  
  // Settings
  getSettings: () => apiClient<any>('/admin/settings'),
  updateSettings: (data: any) => apiClient<any>('/admin/settings', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
};


// ==================== COMMUNITY API ====================

export const communityAPI = {
  getChannels: () => apiClient<any[]>('/community/channels'),

  getChannelMessages: (channelId: string, limit: number = 50) =>
    apiClient<any[]>(`/community/channels/${channelId}/messages?limit=${limit}`),

  sendChannelMessage: (channelId: string, content: string) =>
    apiClient<{ success: boolean }>(`/community/channels/${channelId}/messages`, {
      method: 'POST',
      body: JSON.stringify({ content }),
    }),

  sendMessage: (channelId: string, content: string) =>
    apiClient<any>(`/community/channels/${channelId}/messages`, {
      method: 'POST',
      body: JSON.stringify({ content }),
    }),

  getMessages: (channelId: string) => apiClient<any[]>(`/community/channels/${channelId}/messages`),

  editMessage: (messageId: string, content: string) =>
    apiClient<{ success: boolean }>(`/community/messages/${messageId}`, {
      method: 'PUT',
      body: JSON.stringify({ content }),
    }),

  deleteMessage: (messageId: string) =>
    apiClient<{ success: boolean }>(`/community/messages/${messageId}`, {
      method: 'DELETE',
    }),

  reactToMessage: (messageId: string, emoji: string) =>
    apiClient<{ success: boolean }>(`/community/messages/${messageId}/react`, {
      method: 'POST',
      body: JSON.stringify({ emoji }),
    }),

  createChannel: (data: { name: string; description: string }) =>
    apiClient<any>('/admin/community/channels', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  deleteChannel: (id: string) =>
    apiClient<any>(`/admin/community/channels/${id}`, {
      method: 'DELETE',
    }),

  addMembers: (channelId: string, userIds: number[]) =>
    apiClient<{ success: boolean }>(`/admin/community/channels/${channelId}/members`, {
      method: 'POST',
      body: JSON.stringify(userIds),
    }),
};


// ==================== MESSAGES API ====================

export const messagesAPI = {
  getUsers: () => apiClient<any[]>('/messages/users'),
  getConversations: () => apiClient<any[]>('/messages/conversations'),

  getMessagesWithUser: (userId: string, limit: number = 50) =>
    apiClient<any[]>(`/messages/conversations/${userId}?limit=${limit}`),

  sendMessage: (receiverId: string, content: string) =>
    apiClient<{ success: boolean }>('/messages/send', {
      method: 'POST',
      body: JSON.stringify({ receiver_id: receiverId, content }),
    }),

  getUnreadCount: () => apiClient<{ unread_count: number }>('/messages/unread-count'),
};

// ==================== NOTIFICATIONS API ====================

export const notificationsAPI = {
  getAll: (limit: number = 20) =>
    apiClient<any[]>(`/notifications?limit=${limit}`),

  getUnreadCount: () =>
    apiClient<{ unread_count: number }>('/notifications/unread-count'),

  markAsRead: (id: string) =>
    apiClient<{ success: boolean }>(`/notifications/${id}/read`, {
      method: 'PUT',
    }),

  markAllAsRead: () =>
    apiClient<{ success: boolean }>('/notifications/mark-all-read', {
      method: 'PUT',
    }),

  delete: (id: string) =>
    apiClient<{ success: boolean }>(`/notifications/${id}`, {
      method: 'DELETE',
    }),
};

// ==================== CERTIFICATES API ====================

export const certificatesAPI = {
  getMyCertificates: () => apiClient<any[]>('/certificates/my'),

  getById: (id: string) => apiClient<any>(`/certificates/${id}`),

  download: (id: string) => apiClient<any>(`/certificates/${id}/download`),

  // Admin only
  generateCertificate: (userId: string, courseId: string) =>
    apiClient<{ success: boolean }>('/admin/certificates/generate', {
      method: 'POST',
      body: JSON.stringify({ user_id: userId, course_id: courseId }),
    }),

  getAllCertificates: () => apiClient<any[]>('/admin/certificates/all'),
};

// ==================== CALENDAR API ====================

export const calendarAPI = {
  getUpcomingDeadlines: () =>
    apiClient<any[]>('/calendar/upcoming-deadlines'),
};

export const learnerAPI = {
  getAnalytics: () => apiClient<any>('/learner/analytics'),
};

export const scheduleAPI = {
  getSchedules: () => apiClient<any[]>('/schedules'),
  createSchedule: (data: any) => apiClient<any>('/admin/schedules', {
    method: 'POST',
    body: JSON.stringify(data)
  })
};

// Export all APIs
export const api = {
  auth: authAPI,
  courses: coursesAPI,
  user: userAPI,
  admin: adminAPI,
  community: communityAPI,
  messages: messagesAPI,
  notifications: notificationsAPI,
  certificates: certificatesAPI,
  calendar: calendarAPI,
  schedule: scheduleAPI,
  learner: learnerAPI,
};

export default api;

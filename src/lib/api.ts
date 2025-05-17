/**
 * Utility function to handle API requests
 */
export async function fetchApi<T>(
  url: string,
  options: RequestInit = {}
): Promise<T> {
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  const response = await fetch(url, {
    ...options,
    headers,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'An error occurred');
  }

  return data as T;
}

/**
 * Register a new user
 */
export async function registerUser(name: string, email: string, password: string) {
  return fetchApi('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify({ name, email, password }),
  });
}

/**
 * Get the current user's profile
 */
export async function getUserProfile() {
  return fetchApi('/api/user/profile');
}

/**
 * Update the current user's profile
 */
export async function updateUserProfile(data: any) {
  return fetchApi('/api/user/profile', {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

/**
 * Change the user's password
 */
export async function changePassword(currentPassword: string, newPassword: string) {
  return fetchApi('/api/user/change-password', {
    method: 'POST',
    body: JSON.stringify({ currentPassword, newPassword }),
  });
}

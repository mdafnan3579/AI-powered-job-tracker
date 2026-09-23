'use client';

import { useCallback, useEffect, useState } from 'react';

async function request(url, options) {
  const res = await fetch(url, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...(options?.headers ?? {}) },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.error ?? 'Request failed.');
  return data;
}

export function useApplications() {
  const [applications, setApplications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const mutate = useCallback(async () => {
    try {
      const data = await request('/api/applications');
      setApplications(Array.isArray(data) ? data : []);
      setError(null);
    } catch (err) {
      setError(err?.message ?? 'Failed to load applications.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch on mount
    mutate();
  }, [mutate]);

  const retry = useCallback(async () => {
    setIsLoading(true);
    await mutate();
  }, [mutate]);

  const createApplication = useCallback(
    async (payload) => {
      const created = await request('/api/applications', { method: 'POST', body: JSON.stringify(payload ?? {}) });
      await mutate();
      return created;
    },
    [mutate]
  );

  const updateApplication = useCallback(
    async (id, updates) => {
      const updated = await request(`/api/applications/${id}`, { method: 'PATCH', body: JSON.stringify(updates ?? {}) });
      setApplications((prev) => prev.map((a) => (a.id === id ? { ...a, ...updated } : a)));
      return updated;
    },
    []
  );

  const deleteApplication = useCallback(async (id) => {
    await request(`/api/applications/${id}`, { method: 'DELETE' });
    setApplications((prev) => prev.filter((a) => a.id !== id));
  }, []);

  // Optimistic update; reverts by re-fetching if the request fails.
  const updateStatus = useCallback(
    async (id, status) => {
      setApplications((prev) => prev.map((a) => (a.id === id ? { ...a, status } : a)));
      try {
        return await request(`/api/applications/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) });
      } catch (err) {
        await mutate();
        throw err;
      }
    },
    [mutate]
  );

  return {
    applications,
    isLoading,
    error,
    mutate,
    retry,
    createApplication,
    updateApplication,
    deleteApplication,
    updateStatus,
  };
}

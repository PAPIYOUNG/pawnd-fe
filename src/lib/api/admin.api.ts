 async dashboardSummary(friendId: string) {
    return await authFetch<string>(`/friends/${friendId}`, {
      method: 'DELETE',
    });
  },
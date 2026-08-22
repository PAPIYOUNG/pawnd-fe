export async function summaryAction(): Promise<ErrorActionResult> {
  try {
    await FriendApi.unfriend(friendId);
  } catch (error) {
    if (error instanceof APiError) {
      return {
        success: false,
        message: error.message,
        code: 'API_ERROR',
      };
    }
    throw error;
  }
  redirect('/friends');
}

/**
 * Exported function for backward compatibility with Home.tsx
 * Use pushNotificationService directly for better control and error handling
 */
import { pushNotificationService } from "@/utils/pushNotificationService";

export async function enableNotifications(): Promise<boolean> {
  try {
    await pushNotificationService.subscribe();
    return true;
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Failed to enable notifications";
    console.error(errorMessage);
    return false;
  }
}

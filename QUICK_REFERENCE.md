# Push Notification - Quick Reference & Code Snippets

## 🚀 Quick Start

### 1. Check Imports

All files should import from the correct service:

```typescript
// ✅ CORRECT
import { pushNotificationService } from "@/utils/pushNotificationService";

// ❌ OLD (don't use)
import { pushNotificationService } from "@/utils/pushNotification";
```

### 2. Verify Environment Variables

```bash
# .env.local
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001/api
NEXT_PUBLIC_VAPID_PUBLIC_KEY=your_vapid_public_key_here
```

### 3. Enable Component in Navbar

```tsx
// In Navbar.tsx - Already done ✅
import EnableNotificationsButton from "@/component/EnableNotificationButton/EnableButtonComponent";

// In dropdown menu:
<div className="...">
  <EnableNotificationsButton />
</div>;
```

---

## 🧩 Copy-Paste Code Snippets

### Snippet 1: Use Service in Any Component

```tsx
"use client";
import { useState, useEffect } from "react";
import { pushNotificationService } from "@/utils/pushNotificationService";

export default function MyComponent() {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function checkStatus() {
      try {
        const subscribed = await pushNotificationService.isSubscribed();
        setIsSubscribed(subscribed);
      } catch (error) {
        console.error("Failed to check status:", error);
      } finally {
        setIsLoading(false);
      }
    }
    checkStatus();
  }, []);

  const handleSubscribe = async () => {
    try {
      setIsLoading(true);
      await pushNotificationService.subscribe();
      setIsSubscribed(true);
    } catch (error) {
      console.error("Subscribe failed:", error);
      alert(error instanceof Error ? error.message : "Failed to subscribe");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <button onClick={handleSubscribe} disabled={isLoading}>
      {isSubscribed ? "Unsubscribe" : "Subscribe"}
    </button>
  );
}
```

---

### Snippet 2: Display User's Subscriptions

```tsx
"use client";
import { useState, useEffect } from "react";
import { pushNotificationService } from "@/utils/pushNotificationService";

export default function SubscriptionsList() {
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetch() {
      try {
        const subs = await pushNotificationService.getUserSubscriptions();
        setSubscriptions(subs);
      } catch (error) {
        console.error("Failed to fetch subscriptions:", error);
      } finally {
        setLoading(false);
      }
    }
    fetch();
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h3>Your Device Subscriptions ({subscriptions.length})</h3>
      {subscriptions.map((sub) => (
        <div key={sub.id} className="p-3 border rounded mb-2">
          <p>Endpoint: {sub.endpoint.substring(0, 50)}...</p>
          <p>Created: {new Date(sub.createdAt).toLocaleDateString()}</p>
          <button
            onClick={() => pushNotificationService.unsubscribeById(sub.id)}
          >
            Remove
          </button>
        </div>
      ))}
    </div>
  );
}
```

---

### Snippet 3: Check Browser Support & Permission

```tsx
"use client";
import { useEffect, useState } from "react";
import { pushNotificationService } from "@/utils/pushNotificationService";

export default function NotificationStatus() {
  const [status, setStatus] = useState({
    isSupported: false,
    permission: "default" as NotificationPermission,
    isSubscribed: false,
  });

  useEffect(() => {
    const isSupported = pushNotificationService.isBrowserSupported();
    const permission = pushNotificationService.getNotificationPermission();

    (async () => {
      const isSubscribed = isSupported
        ? await pushNotificationService.isSubscribed()
        : false;

      setStatus({
        isSupported,
        permission,
        isSubscribed,
      });
    })();
  }, []);

  return (
    <div className="p-4 bg-blue-50 rounded">
      <h3>Push Notification Status</h3>
      <p>Browser Support: {status.isSupported ? "✅ Yes" : "❌ No"}</p>
      <p>Permission: {status.permission}</p>
      <p>Subscribed: {status.isSubscribed ? "✅ Yes" : "❌ No"}</p>
    </div>
  );
}
```

---

### Snippet 4: One-Click Subscribe Function

```tsx
"use client";
import { pushNotificationService } from "@/utils/pushNotificationService";

export async function quickSubscribe() {
  try {
    console.log("Subscribing to push notifications...");

    // Check support
    if (!pushNotificationService.isBrowserSupported()) {
      throw new Error("Your browser doesn't support push notifications");
    }

    // Check if already subscribed
    const isSubscribed = await pushNotificationService.isSubscribed();
    if (isSubscribed) {
      console.log("Already subscribed!");
      return true;
    }

    // Subscribe
    const result = await pushNotificationService.subscribe();
    console.log("Subscription successful!");
    return result;
  } catch (error) {
    console.error("Subscription error:", error);
    return false;
  }
}

// Usage in any component:
// <button onClick={() => quickSubscribe()}>Subscribe</button>
```

---

## 🔍 Debugging Checklist

### Issue: "Service Worker not found"

```javascript
// Check in browser console:
navigator.serviceWorker.getRegistrations().then((regs) => {
  console.log("Service Workers:", regs);
  if (regs.length === 0) {
    console.error("No service workers registered!");
    console.log("Ensure /public/sw.js exists");
  }
});
```

### Issue: "VAPID key missing"

```javascript
// Check environment variable:
console.log(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY);
// Should log your VAPID key, not undefined
```

### Issue: "Token not found"

```javascript
// Check localStorage:
console.log("User token:", localStorage.getItem("user-token"));
console.log("User ID:", localStorage.getItem("userId"));
// Both should be set after login
```

### Issue: "Already subscribed but button shows enable"

```javascript
// Force re-check:
(async () => {
  const subs = await fetch(
    "http://localhost:3001/api/push-notification/user/all",
    {
      headers: {
        Authorization: "Bearer " + localStorage.getItem("user-token"),
      },
    },
  ).then((r) => r.json());
  console.log("Backend subscriptions:", subs);
})();
```

### Issue: "Permission error in console"

```javascript
// Check Notification permission:
console.log("Notification permission:", Notification.permission);
// Should be: "granted", "denied", or "default"

// List all permissions:
navigator.permissions
  .query({ name: "notifications" })
  .then((result) => console.log(result.state));
```

---

## 🔧 Common Fixes

### Fix 1: Reset Notification State

```javascript
// In browser console to reset, then refresh:
localStorage.removeItem("notification_init_done");
localStorage.removeItem("notification_last_status");
// Now page will re-initialize
```

### Fix 2: Clear Old Service Worker

```javascript
// In browser console:
navigator.serviceWorker.getRegistrations().then((regs) => {
  regs.forEach((reg) => reg.unregister());
});
// Then refresh page
```

### Fix 3: Check API Connectivity

```javascript
// Test API endpoint:
fetch("http://localhost:3001/api/push-notification/user/all", {
  headers: {
    Authorization: "Bearer " + localStorage.getItem("user-token"),
    "Content-Type": "application/json",
  },
})
  .then((r) => r.json())
  .then(console.log)
  .catch(console.error);
```

### Fix 4: View Stored Subscriptions

```javascript
// Check localStorage:
Object.keys(localStorage).forEach((key) => {
  if (key.includes("notification")) {
    console.log(key + ":", localStorage.getItem(key));
  }
});
```

---

## 📊 API Response Examples

### Success Subscribe

```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "endpoint": "https://fcm.googleapis.com/fcm/send/...",
    "data": {
      "p256dh": "BPlr9...",
      "auth": "LCd0..."
    },
    "userId": 123,
    "createdAt": "2026-02-13T10:30:00Z",
    "updatedAt": null
  },
  "message": "Push notification subscription created successfully"
}
```

### Error Response

```json
{
  "statusCode": 400,
  "message": "Bad Request",
  "error": "Invalid endpoint format"
}
```

### Get User Subscriptions

```json
{
  "success": true,
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "endpoint": "https://fcm.googleapis.com/...",
      "data": { "p256dh": "...", "auth": "..." },
      "userId": 123,
      "createdAt": "2026-02-13T10:30:00Z",
      "updatedAt": null
    }
  ],
  "count": 1
}
```

---

## 🎯 Service Methods Reference

| Method                            | Parameters | Returns                             | Throws |
| --------------------------------- | ---------- | ----------------------------------- | ------ |
| `subscribe()`                     | None       | `Promise<boolean>`                  | Error  |
| `unsubscribeById(id)`             | `string`   | `Promise<void>`                     | Error  |
| `unsubscribeAll()`                | None       | `Promise<void>`                     | Error  |
| `getUserSubscriptions()`          | None       | `Promise<array>`                    | Error  |
| `isSubscribed()`                  | None       | `Promise<boolean>`                  | Never  |
| `isBrowserSupported()`            | None       | `boolean`                           | Never  |
| `getNotificationPermission()`     | None       | `NotificationPermission`            | Never  |
| `requestNotificationPermission()` | None       | `Promise<NotificationPermission>`   | Never  |
| `getCurrentBrowserSubscription()` | None       | `Promise<PushSubscription \| null>` | Never  |

---

## 🌐 Browser DevTools Tips

### Chrome DevTools

```
1. Open DevTools (F12)
2. Go to Application tab
3. Service Workers section - view registrations
4. Local Storage - view notification_init_done
5. Network tab - monitor API calls
```

### Firefox DevTools

```
1. Open DevTools (F12)
2. Storage tab
3. Local Storage - view notification_init_done
4. Network tab - monitor API calls
```

### Console Commands

```javascript
// View all service workers
navigator.serviceWorker.getRegistrations();

// Get current push subscription
navigator.serviceWorker.ready.then((reg) => reg.pushManager.getSubscription());

// Check notification permission
Notification.permission;

// Request permission
Notification.requestPermission();
```

---

## 📝 Testing Script

Run this in browser console to test everything:

```javascript
(async () => {
  const service = window.pushNotificationService;
  console.log("=== TESTING PUSH NOTIFICATION SERVICE ===");

  console.log("1. Browser Support:", service.isBrowserSupported());
  console.log(
    "2. Notification Permission:",
    service.getNotificationPermission(),
  );

  try {
    console.log("3. Checking subscription status...");
    const isSubscribed = await service.isSubscribed();
    console.log("   Is Subscribed:", isSubscribed);

    console.log("4. Getting user subscriptions...");
    const subs = await service.getUserSubscriptions();
    console.log("   User Subscriptions:", subs);
    console.log("   Subscription Count:", subs.length);
  } catch (error) {
    console.error("Error:", error.message);
  }

  console.log("=== TEST COMPLETE ===");
})();
```

---

## ✅ Pre-Deployment Verification

Run these checks before deploying:

```bash
# 1. Check all imports are correct
grep -r "pushNotificationService" src/

# 2. Verify service file exists
ls -la src/utils/pushNotificationService.ts

# 3. Check no TypeScript errors
npm run build

# 4. Check for console errors
npm run dev
# Open browser console - should be clean

# 5. Verify environment variables
echo $NEXT_PUBLIC_VAPID_PUBLIC_KEY
echo $NEXT_PUBLIC_API_BASE_URL
```

---

## 🎓 Tips & Tricks

### Tip 1: Test Subscription Without Frontend

```bash
curl -X POST http://localhost:3001/api/push-notification/subscribe \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "endpoint": "https://example.com/endpoint",
    "keys": {
      "p256dh": "test_key_1",
      "auth": "test_key_2"
    }
  }'
```

### Tip 2: Simulate User Logout (Clear State)

```javascript
// In console:
localStorage.removeItem("user-token");
localStorage.removeItem("notification_init_done");
location.reload();
```

### Tip 3: Force Notification Permission Request

```javascript
// In console:
localStorage.removeItem("notification_init_done");
// Then navigate to home page
```

### Tip 4: Monitor API Calls

```javascript
// Add to service constructor or subscribe method:
console.time("API Call");
const response = await Api.post(...);
console.timeEnd("API Call");
console.log("Response:", response.data);
```

---

## 🚨 Error Message Reference

| Error                                              | Meaning                             | Solution                         |
| -------------------------------------------------- | ----------------------------------- | -------------------------------- |
| "Your browser does not support push notifications" | Browser too old or missing API      | Use modern browser               |
| "VAPID public key is not configured"               | Env var missing                     | Set NEXT_PUBLIC_VAPID_PUBLIC_KEY |
| "Authentication required. Please log in."          | No token in localStorage            | Log in first                     |
| "Notification permission denied"                   | User blocked notifications          | Enable in browser settings       |
| "Failed to register Service Worker"                | /sw.js missing                      | Check public/sw.js exists        |
| "Invalid subscription ID"                          | Bad UUID format                     | Verify subscription ID           |
| "Unauthorized access"                              | User accessing other's subscription | Check backend auth               |

---

**✅ You're now equipped to debug and deploy! 🚀**

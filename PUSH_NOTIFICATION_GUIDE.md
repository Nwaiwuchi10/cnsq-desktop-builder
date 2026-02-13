# Push Notification Implementation - Quick Reference & Architecture

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                   Frontend Push Notification                 │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌───────────────────────────────────────────────────────┐ │
│  │         pushNotificationService                        │ │
│  │  (Production-grade singleton service)                 │ │
│  │                                                        │ │
│  │  ✅ Browser support detection                         │ │
│  │  ✅ VAPID key validation                              │ │
│  │  ✅ ServiceWorker registration                        │ │
│  │  ✅ Subscription management                           │ │
│  │  ✅ Backend API communication                         │ │
│  │  ✅ Error handling & recovery                         │ │
│  │  ✅ Token validation                                  │ │
│  └───────────────────────────────────────────────────────┘ │
│              ▲                                ▲             │
│              │                                │             │
│    ┌─────────┴───────────┐     ┌─────────────┴─────────┐  │
│    │                     │     │                       │  │
│    │  EnableButton       │     │  Home.tsx             │  │
│    │  Component          │     │  (Initial Setup)      │  │
│    │                     │     │                       │  │
│    │ • UI Controls       │     │ • First-time check    │  │
│    │ • User Feedback     │     │ • Auto-subscribe      │  │
│    │ • State Mgmt        │     │ • Toast display       │  │
│    │ • Error Display     │     │                       │  │
│    └─────────────────────┘     └───────────────────────┘  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
           │                              │
           ▼                              ▼
┌──────────────────────────────────────────────────────────────┐
│              Backend (NestJS)                                │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  PushNotificationController                                │
│  ├─ POST  /push-notification/subscribe                     │
│  ├─ GET   /push-notification/user/all                      │
│  ├─ GET   /push-notification/:id                           │
│  ├─ DELETE /push-notification/unsubscribe/:id              │
│  └─ DELETE /push-notification/unsubscribe/all              │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

---

## Service API Reference

### Service Initialization

```typescript
import { pushNotificationService } from "@/utils/pushNotificationService";

// Service is automatically initialized as singleton
// Methods can be called directly
```

### Core Methods

#### 1. **subscribe()**: Subscribe user to push notifications

```typescript
const success = await pushNotificationService.subscribe();
// Returns: boolean
// Throws: Error with descriptive message
```

**What it does:**

- Validates browser support
- Checks VAPID key
- Validates auth token
- Requests notification permission
- Registers service worker
- Checks if already subscribed
- Creates push subscription
- Saves to backend

---

#### 2. **isSubscribed()**: Check if user is subscribed

```typescript
const isSubscribed = await pushNotificationService.isSubscribed();
// Returns: boolean
// Does not throw
```

**Use cases:**

- Check status on page load
- Show subscribe/unsubscribe status
- Avoid duplicate subscriptions

---

#### 3. **getUserSubscriptions()**: Get all subscriptions for user

```typescript
const subscriptions = await pushNotificationService.getUserSubscriptions();
// Returns: Array of subscription objects
// Each contains: id, endpoint, data (keys), userId, createdAt, updatedAt
```

**Response structure:**

```typescript
{
  id: string;
  endpoint: string;
  data: {
    p256dh: string;
    auth: string;
  }
  userId: number;
  createdAt: string;
  updatedAt: string | null;
}
[];
```

---

#### 4. **unsubscribeById(subscriptionId)**: Remove specific subscription

```typescript
await pushNotificationService.unsubscribeById(subscriptionId);
// Returns: void
// Throws: Error if invalid ID or not authenticated
```

---

#### 5. **unsubscribeAll()**: Remove all user subscriptions

```typescript
await pushNotificationService.unsubscribeAll();
// Returns: void
// Throws: Error if not authenticated
```

---

#### 6. **isBrowserSupported()**: Check browser compatibility

```typescript
const isSupported = pushNotificationService.isBrowserSupported();
// Returns: boolean
// Does not throw
```

**Checks:**

- ServiceWorker API availability
- Notification API availability

---

#### 7. **getNotificationPermission()**: Get current permission status

```typescript
const permission = pushNotificationService.getNotificationPermission();
// Returns: "granted" | "denied" | "default"
```

---

#### 8. **requestNotificationPermission()**: Request permission

```typescript
const permission =
  await pushNotificationService.requestNotificationPermission();
// Returns: "granted" | "denied" | "default"
```

---

#### 9. **getCurrentBrowserSubscription()**: Get browser's push subscription

```typescript
const subscription =
  await pushNotificationService.getCurrentBrowserSubscription();
// Returns: PushSubscription | null
```

---

## Component Implementation Guide

### EnableButtonComponent Usage

```typescript
import EnableNotificationsButton from "@/component/EnableNotificationButton/EnableButtonComponent";

export default function YourComponent() {
  return (
    <div>
      <EnableNotificationsButton />
    </div>
  );
}
```

**Features:**

- ✅ Automatic status checking on mount
- ✅ Loading states with spinner
- ✅ Subscribe/unsubscribe toggle
- ✅ Error messages with icons
- ✅ Success toast messages
- ✅ Browser support warning
- ✅ Full accessibility (ARIA)
- ✅ Auto-hide messages after 5s

---

### Service Usage Pattern

```typescript
"use client";
import { useState, useEffect } from "react";
import { pushNotificationService } from "@/utils/pushNotificationService";

export default function MyComponent() {
  const [status, setStatus] = useState({
    isSubscribed: false,
    isLoading: true,
    error: null
  });

  useEffect(() => {
    async function checkStatus() {
      try {
        const isSubscribed = await pushNotificationService.isSubscribed();
        setStatus(prev => ({ ...prev, isSubscribed, isLoading: false }));
      } catch (error) {
        setStatus(prev => ({
          ...prev,
          error: error instanceof Error ? error.message : "Unknown error",
          isLoading: false
        }));
      }
    }
    checkStatus();
  }, []);

  const handleSubscribe = async () => {
    try {
      setStatus(prev => ({ ...prev, isLoading: true }));
      await pushNotificationService.subscribe();
      setStatus(prev => ({
        ...prev,
        isSubscribed: true,
        isLoading: false
      }));
    } catch (error) {
      setStatus(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : "Unknown error",
        isLoading: false
      }));
    }
  };

  if (status.isLoading) return <div>Loading...</div>;

  return (
    <div>
      <button onClick={handleSubscribe}>
        {status.isSubscribed ? "Unsubscribe" : "Subscribe"}
      </button>
      {status.error && <p style={{color: "red"}}>{status.error}</p>}
    </div>
  );
}
```

---

## State Management Pattern

### EnableButtonComponent State

```typescript
interface NotificationStatus {
  isSubscribed: boolean; // Is user subscribed to push notifications
  isLoading: boolean; // Is operation in progress
  error: string | null; // Error message, if any
  success: string | null; // Success message, if any
}

const [status, setStatus] = useState<NotificationStatus>({
  isSubscribed: false,
  isLoading: true,
  error: null,
  success: null,
});
```

### Home.tsx Notification Status

```typescript
const [notificationStatus, setNotificationStatus] = useState<{
  isEnabled: boolean | null; // Is notifications enabled (null = checking)
  isLoading: boolean; // Is setup in progress
}>({
  isEnabled: null,
  isLoading: true,
});
```

---

## Error Handling Hierarchy

### Level 1: Service Level

```typescript
// Throws detailed errors
try {
  await pushNotificationService.subscribe();
} catch (error) {
  // Example errors:
  // "Your browser does not support push notifications..."
  // "VAPID public key is not configured..."
  // "Authentication required. Please log in."
  // "Notification permission denied..."
}
```

### Level 2: Component Level

```typescript
// Catches and displays to users
try {
  const result = await pushNotificationService.subscribe();
} catch (error) {
  const errorMessage =
    error instanceof Error ? error.message : "An unexpected error occurred";

  setStatus((prev) => ({
    ...prev,
    error: errorMessage,
    isLoading: false,
  }));
}
```

### Level 3: User Feedback

```typescript
// Displays in UI
{showMessage && status.error && (
  <div className="...bg-red-50..." role="alert">
    <AlertCircle size={16} className="text-red-600" />
    <span>{status.error}</span>
  </div>
)}
```

---

## Backend API Integration Points

### 1. Subscribe Endpoint

**Request:**

```http
POST /push-notification/subscribe
Authorization: Bearer {token}
Content-Type: application/json

{
  "endpoint": "https://...",
  "keys": {
    "p256dh": "...",
    "auth": "..."
  }
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "endpoint": "https://...",
    "data": {
      "p256dh": "...",
      "auth": "..."
    },
    "userId": 123,
    "createdAt": "2026-02-13T...",
    "updatedAt": null
  },
  "message": "Push notification subscription created successfully"
}
```

---

### 2. Get User Subscriptions

**Request:**

```http
GET /push-notification/user/all
Authorization: Bearer {token}
```

**Response:**

```json
{
  "success": true,
  "data": [...],
  "count": 2
}
```

---

### 3. Unsubscribe

**Request:**

```http
DELETE /push-notification/unsubscribe/{subscriptionId}
Authorization: Bearer {token}
```

**Response:**

```json
{
  "success": true,
  "message": "Push notification subscription deleted successfully"
}
```

---

### 4. Unsubscribe All

**Request:**

```http
DELETE /push-notification/unsubscribe/all
Authorization: Bearer {token}
```

**Response:**

```json
{
  "success": true,
  "message": "All push subscriptions deleted successfully"
}
```

---

## Environment Variables

Required in `.env.local`:

```env
# API Configuration
NEXT_PUBLIC_API_BASE_URL=http://your-api.com/api

# Push Notification
NEXT_PUBLIC_VAPID_PUBLIC_KEY=your_vapid_public_key_here
```

Get VAPID keys from:

- Generate at: [web-push-codelab](https://web-push-codelab.glitch.me/)
- Or via command: `npx web-push generate-vapid-keys`

---

## Debugging Tips

### Enable detailed logging

```typescript
// In pushNotificationService.ts
console.log("Service Worker registered:", registration);
console.log("Push subscription created:", subscription);
console.log("Backend response:", response.data);
```

### Check browser support

```typescript
console.log("ServiceWorker:", "serviceWorker" in navigator);
console.log("Notification API:", "Notification" in window);
console.log("Permission:", Notification.permission);
```

### Inspect stored subscriptions

```javascript
// In browser console
fetch("http://your-api.com/api/push-notification/user/all", {
  headers: {
    Authorization: "Bearer " + localStorage.getItem("user-token"),
  },
})
  .then((r) => r.json())
  .then(console.log);
```

### Check service worker registration

```javascript
// In browser console
navigator.serviceWorker.getRegistrations().then((regs) => {
  regs.forEach((reg) => {
    console.log("Service Worker:", reg);
    reg.pushManager.getSubscription().then(console.log);
  });
});
```

---

## Common Issues & Solutions

| Issue                            | Cause                     | Solution                                           |
| -------------------------------- | ------------------------- | -------------------------------------------------- |
| "Notification permission denied" | User rejected permission  | Explain need for notifications in UX               |
| "VAPID public key missing"       | Env var not set           | Add `NEXT_PUBLIC_VAPID_PUBLIC_KEY` to `.env.local` |
| Re-subscribes on every visit     | No status checking        | Service now prevents duplicate subscriptions       |
| No feedback on subscribe         | No loading state          | EnableButtonComponent shows loading spinner        |
| Authorization failed             | Token not in localStorage | Component checks token before subscribe            |
| Service Worker fails             | `/sw.js` missing          | Ensure service worker file exists in public/       |

---

## Production Checklist

- [ ] VAPID keys configured in `.env.local`
- [ ] Service worker registered at `/public/sw.js`
- [ ] Bearer token stored in `localStorage['user-token']`
- [ ] Backend API base URL configured
- [ ] EnableButtonComponent added to Navbar/Menu
- [ ] Home.tsx has notification initialization
- [ ] Tested on Chrome, Firefox, Safari, Edge
- [ ] Tested subscribe/unsubscribe flow
- [ ] Error messages display correctly
- [ ] Loading states show properly
- [ ] Toast notifications auto-hide
- [ ] Accessibility tested with screen reader
- [ ] Network error handling verified
- [ ] Permission denial handled gracefully

---

**✅ Implementation is complete and production-ready!**

# Mobile App API Integration & Development PRD

## Overview
This document outlines the phased development plan and API integration specifications for the Church Management Mobile App (Flutter).

**Technology Stack:**
-   **Frontend:** Flutter (Dart)
-   **State Management:** Riverpod
-   **Networking:** Dio
-   **Backend:** Node.js + Express + Prisma

---

## Phase 1: Authentication & Foundation
**Goal:** Secure user login, session management, and push notification registration.

### features
1.  **Splash Screen**: Check valid token.
2.  **Login Screen**: Email & Password input.
3.  **Push Token Registration**: Register FCM token on successful login.

### API Specifications

#### 1. Login
-   **Endpoint**: `POST /api/auth/login`
-   **Request**:
    ```json
    { "email": "user@example.com", "password": "password123" }
    ```
-   **Response**:
    ```json
    {
        "token": "jwt_token_string",
        "user": { "id": 1, "email": "...", "role": "MEMBER" }
    }
    ```

#### 2. Register Device Token
-   **Endpoint**: `POST /api/notifications/register-token`
-   **Headers**: `Authorization: Bearer <token>`
-   **Request**:
    ```json
    { "token": "fcm_token_string", "platform": "android|ios" }
    ```
-   **Response**: `{ "message": "Device token registered" }`

### UI Requirements
*   **[Pending]** Login Screen Design (User to provide)

---

## Phase 2: Dashboard & Core Content
**Goal:** Display dynamic content (Announcements, Events) on the home screen.

### Features
1.  **Home Dashboard**: dynamic widgets.
2.  **Notice Board**: List of recent announcements.
3.  **Events List**: Upcoming and Live events.

### API Specifications

#### 1. Get Announcements
-   **Endpoint**: `GET /api/content/announcements`
-   **Response**:
    ```json
    [
        { "id": 1, "title": "Sunday Service", "content": "...", "date": "2023-10-27" }
    ]
    ```

#### 2. Get Events
-   **Endpoint**: `GET /api/events`
-   **Query Params**: `?type=upcoming` (Suggested)
-   **Response**:
    ```json
    [
        { "id": 1, "title": "Worship Night", "startDate": "...", "isLive": false }
    ]
    ```

### UI Requirements
*   **[Pending]** Home Dashboard Design (User to provide)
*   **[Pending]** Event Detail View (User to provide)

---

## Phase 3: Directory & Profile (New APIs Required)
**Goal:** Allow users to view their family details and search the member directory.

### Features
1.  **My Profile**: Personal details + Family Card.
2.  **Member Directory**: Searchable list of all members.
3.  **Family View**: Deep dive into family members.
4.  **Update Family**: Option to update family member details.
5.  **Add Family Member**: Option to create and add a new family member.

### API Specifications

#### 1. Get My Profile (Deep Fetch)
-   **[NEW] Endpoint**: `GET /api/mobile/profile`
-   **Response**:
    ```json
    {
        "user": { ... },
        "member": {
            "firstName": "John",
            "family": {
                "id": 1,
                "name": "Doe Family",
                "members": [ ... ]
            }
        }
    }
    ```

#### 2. Member Directory
-   **[NEW] Endpoint**: `GET /api/mobile/directory`
-   **Query Params**: `?search=john`
-   **Response**: List of members with minimal details (Name, Family, Phone).

#### 3. Update Family Member
-   **[NEW] Endpoint**: `PUT /api/mobile/family/members/:memberId`
-   **Request**:
    ```json
    {
        "firstName": "Jane",
        "lastName": "Doe",
        "mobile": "9876543210",
        "dob": "1995-05-15",
        "relationship": "SPOUSE"
    }
    ```
-   **Response**:
    ```json
    { "success": true, "message": "Family member updated successfully" }
    ```

#### 4. Add Family Member
-   **[NEW] Endpoint**: `POST /api/mobile/family/members`
-   **Request**:
    ```json
    {
        "firstName": "Baby",
        "lastName": "Doe",
        "mobile": "",
        "dob": "2023-01-01",
        "relationship": "CHILD"
    }
    ```
-   **Response**:
    ```json
    { "success": true, "message": "Family member added successfully", "id": 123 }
    ```

### UI Requirements
*   **[Pending]** Profile Screen Design (User to provide)
*   **[Pending]** Directory List Design (User to provide)

---

## Phase 4: Gallery & Media
**Goal:** View photo albums and categories.

### Features
1.  **Gallery Categories**: List of folders.
2.  **Album View**: Grid of images.
3.  **Image Viewer**: Full-screen zoomable image.

### API Specifications

#### 1. Get Categories
-   **Endpoint**: `GET /api/mobile/gallery/categories`
-   **Response**: List of gallery categories.

#### 2. Get Albums
-   **Endpoint**: `GET /api/mobile/gallery/albums?categoryId=1`
-   **Response**: List of albums, optionally filtered by category.

### UI Requirements
*   **[Pending]** Gallery Grid Design (User to provide)

---

## Phase 5: Notifications & History
**Goal:** View past broadcast messages.

### Features
1.  **Notification Center**: List of received messages.

### API Specifications

#### 1. Get My Notifications
-   **Endpoint**: `GET /api/notifications`
-   **Response**: List of user-specific notifications and broadcasts.

### UI Requirements
*   **[Pending]** Notification List Design (User to provide)

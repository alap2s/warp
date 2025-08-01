# Project "Warp": A Technical Overview

**1. Project Summary**

"Warp" is a progressive web application built by [@alap](https://www.instagram.com/test_alap_final/). Inspired by Einstein's theory of relativity, it allows users to create their own "reality warp" in a shared digital space. Users can invite friends to join their warps, fostering a sense of shared, temporary realities. The application is designed to be a lightweight, experimental, and engaging social experience.

**2. Core Technologies**

*   **Frontend**: Built with **Next.js 15** and **React 19**, providing a modern, performant, and server-rendered user interface.
*   **Backend**: Powered by **Firebase**, which handles authentication, database, file storage, and serverless functions.
*   **Database**: **Cloud Firestore** is used as the primary database for storing user profiles, warps, and notifications.
*   **Styling**: **Tailwind CSS** is used for utility-first styling, enabling rapid and consistent UI development.
*   **3D Graphics**: The application features an interactive 3D grid, rendered with **Three.js** and **React Three Fiber**.
*   **Animations**: **Framer Motion** is used to create fluid and engaging animations throughout the application.
*   **PWA**: The application is a fully-featured **Progressive Web App**, allowing it to be installed on a user's device and work offline.

**3. Key Features**

*   **Anonymous Authentication**: Users are seamlessly onboarded with anonymous Firebase Authentication, removing the friction of a traditional sign-up process.
*   **User Profiles**: After onboarding, users can create a profile with a unique username and an avatar.
*   **The "Warp" Concept**: The central feature of the application. A "warp" is a user-created event or space that exists for a limited time.
*   **Interactive 3D Grid**: The main user interface is a 3D grid where users can view and interact with warps.
*   **Real-time Notifications**: Users receive real-time notifications when new warps are created or when someone joins their warp.
*   **Deep Linking**: Users can share links to their warps, which will redirect new users to the warp after they've completed the onboarding process.

**4. Application Architecture**

*   **Frontend**: The Next.js application is structured with a clear separation of concerns:
    *   `src/app`: Contains the main application routes and pages.
    *   `src/components`: A library of reusable React components.
    *   `src/context`: Manages global application state for authentication and the grid.
    *   `src/lib`: Contains the core application logic, including Firebase interactions, hooks, and type definitions.
*   **Backend (Firebase Cloud Functions)**: The backend logic is handled by a set of serverless Cloud Functions:
    *   `sendNotificationOnWarpCreate`: Triggered when a new warp is created, and sends notifications to all other users.
    *   `sendNotificationOnWarpJoin`: Triggered when a user joins a warp, and sends a notification to the warp's owner.
    *   `cleanupOldData`: A scheduled function that runs hourly to enforce the data retention policy.

**5. Data Management and Policies**

*   **Data Retention**: To keep the database lean and manage costs, the application implements a strict data retention policy:
    *   **Warps**: Automatically deleted 24 hours after their scheduled time.
    *   **Notifications**: Automatically deleted along with their associated warp.
*   **Configuration**: The data retention periods are defined in a dedicated configuration file (`functions/src/config.ts`), making them easy to modify in the future.

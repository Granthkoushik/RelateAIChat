# RelateAI - AI Conversational Platform

## Overview
RelateAI is a safe, age-appropriate AI conversational platform that helps users communicate, express themselves, and explore thoughts with an intelligent AI assistant. The application provides different conversation vaults and adapts content based on user age (teen mode for under 18, adult mode for 18+).

## Features

### Core Features
- **User Authentication**: Secure login via Replit Auth (supports Google, GitHub, X, Apple, and email/password)
- **Age-Based Modes**: Automatic assignment to Teen Mode (under 18) or Adult Mode (18+)
- **Conversation Vaults**:
  - Normal Vault: Persistent conversations saved to database
  - Temporary Vault: Ephemeral chats that can be cleared
  - Family & Friends Vaults: Coming soon features
- **Chat Interface**: ChatGPT-style conversation UI with message bubbles, scrollable history
- **Settings & Profile Management**:
  - Theme customization (Light, Dark, Gray, Auto)
  - Profile editing (Name, Email, Phone, Age)
  - Age Handling Toggle with passcode protection

### Future Features (Planned)
- Mood tracking and emotional insights
- Personalized recommendations
- Family and Friends dedicated vaults
- Analytics dashboard

## Architecture

### Technology Stack
- **Frontend**: React, TypeScript, TailwindCSS, Shadcn UI
- **Backend**: Express.js, Node.js
- **Database**: PostgreSQL (Neon)
- **Authentication**: Replit Auth (OpenID Connect)
- **ORM**: Drizzle ORM
- **State Management**: TanStack Query (React Query)

### Project Structure
```
├── client/               # Frontend React application
│   ├── src/
│   │   ├── components/  # Reusable UI components
│   │   ├── contexts/    # React contexts (ThemeContext)
│   │   ├── hooks/       # Custom hooks (useAuth)
│   │   ├── lib/         # Utilities (queryClient, authUtils)
│   │   └── pages/       # Page components (Landing, Home, Chat, Settings)
├── server/              # Backend Express server
│   ├── db.ts           # Database connection
│   ├── storage.ts      # Data access layer
│   ├── replitAuth.ts   # Replit Auth integration
│   └── routes.ts       # API routes
└── shared/              # Shared types and schemas
    └── schema.ts       # Database schema and validation
```

### Database Schema

**users** - User profiles and settings
- id (varchar, primary key, UUID)
- email, firstName, lastName, profileImageUrl (from Replit Auth)
- phoneNumber, age (custom fields)
- ageMode (auto-calculated: "teen" | "adult")
- theme ("light" | "dark" | "gray" | "auto")
- ageHandlingEnabled, ageHandlingPasscode (bcrypt hashed)
- createdAt, updatedAt

**sessions** - Session storage for Replit Auth
- sid (primary key)
- sess (jsonb)
- expire (timestamp)

**chat_messages** - Conversation history
- id (varchar, primary key, UUID)
- userId (foreign key to users)
- vault ("normal" | "temporary" | "family" | "friends")
- role ("user" | "assistant")
- content (text)
- model (e.g., "normal_teen", "temp_adult")
- createdAt

### API Endpoints

**Authentication**
- `GET /api/login` - Initiate login flow
- `GET /api/logout` - Logout user
- `GET /api/callback` - OAuth callback
- `GET /api/auth/user` - Get current user (protected)

**Profile**
- `PATCH /api/profile` - Update user profile (protected)

**Settings**
- `PATCH /api/settings` - Update user settings (protected)

**Chat**
- `GET /api/messages/:vault` - Get messages for a vault (protected)
- `POST /api/messages` - Send message and get AI response (protected)
- `DELETE /api/messages/temporary` - Clear temporary vault (protected)

### Theme System
The application supports four themes:
- **Light**: Bright, high-contrast interface
- **Dark**: Dark mode for low-light environments
- **Gray**: Muted, neutral tones
- **Auto**: Follows system preference

Theme preferences are synced to the database and persist across sessions.

### Age Mode System
- Users under 18 are automatically assigned **Teen Mode**
- Users 18+ are assigned **Adult Mode**
- Age mode determines which AI model is used (normal_teen, temp_teen, normal_adult, temp_adult)
- Age Handling Toggle allows users to temporarily modify age-based filtering with passcode protection

## Development

### Running the Application
```bash
npm run dev
```
This starts both the Express backend (port 5000) and Vite frontend dev server.

### Database Migrations
```bash
npm run db:push        # Push schema changes to database
npm run db:push --force # Force push (if conflicts)
```

### Environment Variables
The following are automatically provided by Replit:
- `DATABASE_URL` - PostgreSQL connection string
- `SESSION_SECRET` - Session encryption secret
- `REPL_ID` - Replit application ID
- `ISSUER_URL` - OIDC issuer URL (defaults to https://replit.com/oidc)

## AI Backend Integration

### Current Status
The application currently uses mock AI responses for demonstration purposes.

### Future Integration
The chat functionality is designed to integrate with a Python LLaMA backend:
- Endpoint: `/chat` on Python backend service
- Request format: `{ "message": "user message", "model": "model_name" }`
- Supported models: `normal_teen`, `temp_teen`, `normal_adult`, `temp_adult`
- Response format: `{ "response": "AI generated text" }`

To integrate the Python backend:
1. Update the `generateAIResponse` function in `server/routes.ts`
2. Make HTTP POST request to Python backend `/chat` endpoint
3. Pass user message and appropriate model based on vault and age mode
4. Return the AI response to be saved in the database

## Design System
The application follows professional design guidelines:
- Inter font for headings and UI
- System fonts for chat messages (optimal readability)
- Consistent spacing: 2, 4, 8, 12, 16 units
- ChatGPT-inspired message bubbles with rounded corners
- Responsive design for mobile, tablet, and desktop
- Accessible: min-height 44px for interactive elements, proper contrast ratios

## User Flow

### First-Time User
1. Visit landing page → Click "Log in"
2. Authenticate via Replit Auth (Google, GitHub, etc.)
3. Redirected to Home page
4. Can optionally update profile with phone number and age in Settings
5. Start chatting in Normal or Temporary vault

### Returning User
1. Auto-logged in (session persists)
2. Land on Home page
3. Quick access to Chat via "Start Chatting" button
4. Previous conversations preserved in Normal vault

## Recent Changes
- Initial MVP implementation with all core features
- Complete database schema with users, sessions, and chat messages
- Full authentication flow with Replit Auth
- Theme system with 4 theme options
- Chat interface with vault switching
- Settings page with profile editing and age handling toggle

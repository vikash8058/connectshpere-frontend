# ConnectSphere Frontend

**React + Vite** frontend for the ConnectSphere Social Media Platform.

## 🚀 Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Copy env file and fill in your values
cp .env.example .env

# 3. Start dev server (make sure your Spring Boot backend is running on :8080)
npm run dev
```

Open http://localhost:5173

## ⚙️ Environment Variables

| Variable              | Description                          | Default                    |
|-----------------------|--------------------------------------|----------------------------|
| `VITE_API_URL`        | Spring Boot backend base URL         | `http://localhost:8080`    |
| `VITE_GOOGLE_CLIENT_ID` | Google OAuth client ID (optional)  | —                          |
| `VITE_GITHUB_CLIENT_ID` | GitHub OAuth client ID (optional)  | —                          |

> **Note:** OAuth is handled entirely by Spring Security on the backend.
> The frontend just redirects to `/oauth2/authorization/google` or `/oauth2/authorization/github`.
> After login, Spring redirects back to `/oauth/callback?token=...`

## 📁 Project Structure

```
src/
├── api/           # Axios API clients (one per service)
├── context/       # AuthContext (global user state)
├── utils/         # Helpers: timeAgo, formatters, constants
├── components/
│   ├── common/    # Avatar, Spinner, Modal, EmptyState
│   ├── layout/    # Navbar, Sidebar, RightPanel, AppLayout
│   ├── post/      # PostCard, PostForm, ReactionBar
│   ├── comment/   # CommentForm, CommentItem, CommentList
│   ├── story/     # StoryRing, StoryViewer
│   └── notification/ # NotificationBell, NotificationItem
└── pages/
    ├── auth/      # LoginPage, RegisterPage, OAuthCallback
    ├── admin/     # DashboardPage, UsersPage, PostsPage, ReportsPage, BroadcastPage
    ├── FeedPage, ExplorePage, ProfilePage, PostDetailPage
    ├── NotificationsPage, HashtagPage, SettingsPage, FollowersPage
```

## 🔗 API Proxy

In development, Vite proxies all API calls to your backend:

| Path prefix       | Target               |
|-------------------|----------------------|
| `/auth/*`         | `localhost:8080`     |
| `/posts/*`        | `localhost:8080`     |
| `/comments/*`     | `localhost:8080`     |
| `/likes/*`        | `localhost:8080`     |
| `/follows/*`      | `localhost:8080`     |
| `/notifications/*`| `localhost:8080`     |
| `/media/*`        | `localhost:8080`     |
| `/stories/*`      | `localhost:8080`     |
| `/search/*`       | `localhost:8080`     |
| `/hashtags/*`     | `localhost:8080`     |
| `/admin/*`        | `localhost:8080`     |
| `/oauth2/*`       | `localhost:8080`     |

## 🔑 OAuth2 Setup (Google + GitHub)

### Backend (Spring Boot)
Your `application.yml` should have:
```yaml
spring:
  security:
    oauth2:
      client:
        registration:
          google:
            client-id: YOUR_GOOGLE_CLIENT_ID
            client-secret: YOUR_GOOGLE_SECRET
            redirect-uri: http://localhost:8080/login/oauth2/code/google
          github:
            client-id: YOUR_GITHUB_CLIENT_ID
            client-secret: YOUR_GITHUB_SECRET
            redirect-uri: http://localhost:8080/login/oauth2/code/github
```

After OAuth success, redirect to:
```
http://localhost:5173/oauth/callback?token=JWT&userId=1&username=john&role=USER&email=john@example.com
```

## 🏗️ Build for Production

```bash
npm run build
# Output goes to dist/ — deploy to Nginx, Vercel, Netlify, etc.
```

## 🎨 Design System

- **Font:** Playfair Display (headings) + DM Sans (body)
- **Theme:** Warm amber & cream light theme
- **Responsive:** Works on mobile (bottom nav), tablet, desktop
- **Colors:** Defined as CSS variables in `src/index.css`

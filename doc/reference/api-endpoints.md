# API Endpoints Reference

The GitPeek Express backend exposes an API under `/api` for authentication, GitHub data proxying, caching, and analytics.

Base URL (Local Development): `http://localhost:5000/api`

---

## 1. Authentication Endpoints (`/api/auth`)

### Register User
Registers a new local user with email and password.

**Endpoint:** `/api/auth/register`  
**Method:** `POST`  
**Body:**
```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "password": "secretpassword",
  "githubUsername": "janedoe"
}
```

---

### Login User
Authenticates an existing user and returns a Bearer JWT token.

**Endpoint:** `/api/auth/login`  
**Method:** `POST`  
**Body:**
```json
{
  "email": "jane@example.com",
  "password": "secretpassword"
}
```

---

### GitHub OAuth URL
Gets the authorization URL for GitHub OAuth.

**Endpoint:** `/api/auth/github/url`  
**Method:** `GET`

---

### GitHub OAuth Callback / Instant Connect
Exchanges OAuth authorization code or username for an application JWT session token.

**Endpoint:** `/api/auth/github/callback`  
**Method:** `POST`  
**Body:**
```json
{
  "code": "oauth_code_from_github",
  "githubUsername": "optional_instant_connect_username"
}
```

---

### Current User Profile
Gets the profile of the currently authenticated user.

**Endpoint:** `/api/auth/me`  
**Method:** `GET`  
**Headers:** `Authorization: Bearer <token>`

---

### Link GitHub Account
Links a GitHub username to the logged-in user account.

**Endpoint:** `/api/auth/link-github`  
**Method:** `POST`  
**Headers:** `Authorization: Bearer <token>`  
**Body:**
```json
{
  "githubUsername": "octocat"
}
```

---

## 2. GitHub Profile & Repositories (`/api`)

### Get User Profile & Repositories
Fetches a user profile and public repositories from MongoDB cache (if fresh) or directly from GitHub API.

**Endpoint:** `/api/github/:username`  
**Method:** `GET`

---

### Force Refresh Profile
Purges cached data and fetches live profile & repository data from GitHub.

**Endpoint:** `/api/github/refresh/:username`  
**Method:** `POST`

---

### List Cached Users
Retrieves a list of all cached user profiles.

**Endpoint:** `/api/users`  
**Method:** `GET`

---

### Get Search History
Lists recent search queries.

**Endpoint:** `/api/history`  
**Method:** `GET`

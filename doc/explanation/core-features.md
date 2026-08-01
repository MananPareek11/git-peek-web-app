# Core Features

GitPeek is built to provide a focused, high-performance experience for analyzing GitHub profiles and developer metrics. Here are the core features powering the application:

---

## 1. Authentication System (GitHub OAuth & Normal Login)
GitPeek supports full user authentication with two options:
- **Email & Password Login**: Native user sign-up and sign-in backed by hashed passwords (`bcryptjs`) and JSON Web Tokens (`jsonwebtoken`).
- **GitHub OAuth Login**: Standard OAuth 2.0 flow allowing users to log in directly with their GitHub account or link their GitHub profile.

---

## 2. GitHub Profile PDF Resume Generator
Developers can generate and export a comprehensive, downloadable PDF summary of any GitHub profile with one click.
- **Client-Side High Resolution Rendering**: Built with `jspdf` and `html2canvas` using dynamic code splitting so heavy PDF libraries load on-demand without slowing down page load speed.
- **Included Report Data**:
  - Bio metadata, avatar, join date, followers, and public repos count.
  - Overall total stars and total forks across projects.
  - Programming language distribution progress bars with exact percentages.
  - Featured projects list detailing star counts, fork counts, and topics.

---

## 3. Rate-Limit Circumventing Architecture
The primary challenge of using the GitHub REST API on the frontend is the strict unauthenticated rate limit (60 requests per hour per IP). GitPeek solves this by routing all requests through a custom Node.js backend proxy with optional Personal Access Tokens, elevating the limit to 5,000 requests per hour.

---

## 4. 24-Hour Automated Profile Caching
User searches are cached in MongoDB for 24 hours. Subsequent queries for the same profile load instantly from cache while reducing unnecessary network requests to GitHub.

---

## 5. Dynamic Repository Filtering and Sorting
Client-side processing allows users to filter and sort repositories dynamically:
- **Sorting**: Order by Recently Updated, Newest Created, Oldest Created, Stars Count, Forks Count, and Alphabetical (A-Z).
- **Filtering**: Real-time text search by repository name/description and filter dropdown by programming language.

---

## 6. Spotify-Inspired Glassmorphic Aesthetic
Deep dark backgrounds, vibrant accent colors (`#1ed760`), glassmorphic panels, custom-styled dropdown controls, and micro-animations deliver a premium developer experience.

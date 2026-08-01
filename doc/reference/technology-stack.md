# Technology Stack

GitPeek is a full-stack JavaScript application utilizing modern web technologies. This reference document details the libraries, frameworks, and tools powering the application.

---

## Frontend (Client)

The frontend is a React-based Single Page Application (SPA).

- **Framework:** [React 19](https://react.dev/) - UI library for building component-based interfaces.
- **Build Tool:** [Vite 8](https://vite.dev/) - Frontend build tool with dynamic code splitting (`manualChunks`).
- **Routing:** [React Router 7](https://reactrouter.com/) - Declarative routing.
- **Authentication:** Custom `AuthContext` with Bearer token header interceptors in Axios.
- **PDF Export:** [jsPDF](https://github.com/parallax/jsPDF) & [html2canvas](https://html2canvas.hertzen.com/) - On-demand client-side PDF document generation.
- **Icons:** [React Icons](https://react-icons.github.io/react-icons/) (`Fa` FontAwesome icon set).
- **Styling:** CSS Modules with dark glassmorphic design tokens and custom styled controls.

---

## Backend (Server)

The backend is a Node.js Express server providing API proxying, caching, and authentication.

- **Runtime:** [Node.js](https://nodejs.org/) (ES Modules).
- **Framework:** [Express.js](https://expressjs.com/) - Web framework.
- **Database & ODM:** [MongoDB](https://www.mongodb.com/) & [Mongoose](https://mongoosejs.com/) - Schema models for users, auth credentials, cached profiles, and search history.
- **Authentication & Security:**
  - `bcryptjs`: Password hashing for email registration.
  - `jsonwebtoken`: Signed JWT session tokens.
- **HTTP Client:** [Axios](https://axios-http.com/) - Client for GitHub REST API calls.

---

## External APIs

- **[GitHub REST API (v3)](https://docs.github.com/en/rest)**: Developer profiles, repositories, and OAuth authentication.

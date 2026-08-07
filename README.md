<div align="center">
  <img src="https://via.placeholder.com/150?text=SkillSwap+Logo" alt="SkillSwap Logo" width="120" />
  
  <h1 align="center">SkillSwap</h1>
  <p align="center">
    <strong>A modern, collaborative platform for students and professionals to exchange skills and build projects together.</strong>
  </p>

  <p align="center">
    <a href="https://github.com/yourusername/skillswap/stargazers"><img src="https://img.shields.io/github/stars/yourusername/skillswap?style=for-the-badge&color=yellow" alt="Stars" /></a>
    <a href="https://github.com/yourusername/skillswap/network/members"><img src="https://img.shields.io/github/forks/yourusername/skillswap?style=for-the-badge&color=blue" alt="Forks" /></a>
    <a href="https://github.com/yourusername/skillswap/issues"><img src="https://img.shields.io/github/issues/yourusername/skillswap?style=for-the-badge&color=red" alt="Issues" /></a>
    <a href="https://github.com/yourusername/skillswap/blob/main/LICENSE"><img src="https://img.shields.io/github/license/yourusername/skillswap?style=for-the-badge&color=green" alt="License" /></a>
    <br />
    <img src="https://img.shields.io/badge/Next.js-14-black?style=flat-square&logo=next.js" alt="Next.js" />
    <img src="https://img.shields.io/badge/TypeScript-Ready-blue?style=flat-square&logo=typescript" alt="TypeScript" />
    <img src="https://img.shields.io/badge/Prisma-ORM-1B222D?style=flat-square&logo=prisma" alt="Prisma" />
    <img src="https://img.shields.io/badge/Tailwind-CSS-38B2AC?style=flat-square&logo=tailwind-css" alt="Tailwind" />
  </p>
</div>

---

## 📖 Overview

SkillSwap is a robust, full-stack web application designed to bridge the gap between learning and building. In a world where individuals possess complementary skills—such as a developer needing a designer, or a marketer needing a frontend engineer—SkillSwap acts as the central hub for discovering talent, forming connections, and collaborating on real-world projects.

Built with performance, security, and user experience in mind, SkillSwap offers a seamless interface inspired by modern SaaS platforms. From finding connections to managing a fully-fledged Project Workspace with real-time discussions and task tracking, SkillSwap provides all the tools necessary to turn ideas into reality.

---

## ✨ Features

SkillSwap is packed with production-ready features designed for high engagement and seamless collaboration.

### 🔐 Core & Authentication
- **Secure Authentication:** Powered by Firebase Auth with JWT validation on protected API routes.
- **Profile Management:** Users can set up detailed profiles including University, Department, Semester, Bio, and Avatars.
- **Skill Matrix:** Users can add and manage specific skills with proficiency levels to showcase their expertise.

### 🤝 Networking
- **Connection System:** Send, accept, or reject match requests to build your professional network.
- **Intelligent Search:** Search across the platform for users with specific skills, projects, or universities.
- **Notifications Engine:** Receive real-time alerts for connection requests, project invitations, and messages.

### 🚀 Project Collaboration
- **Project Discovery:** Browse public projects, filter by categories, and request to join teams.
- **Join Request Workflow:** Project owners receive dedicated alerts to review applicant profiles and accept/reject requests.
- **Dedicated Workspaces:** Every accepted project automatically spins up an isolated collaborative Workspace.

### 💬 Communication (Workspaces & Direct)
- **Real-time Discussion:** Group chats per project featuring markdown support, rich media attachments, and emoji reactions.
- **Direct Messaging:** Private 1-on-1 chat interface for your accepted connections.
- **Member Management:** Real-time synchronized member lists with Role Badges and Owner moderation controls.

### ⚙️ System & Settings
- **Dashboard:** Centralized overview of active projects, pending tasks, and recent activities.
- **Account Settings:** Manage privacy preferences, update account details, and configure notification rules.
- **Responsive UI:** Fully fluid layouts optimized for Desktop, Tablet, and Mobile.

---

## 📸 Screenshots

| Dashboard | Workspace Discussion |
| :---: | :---: |
| <img src="https://via.placeholder.com/600x350?text=Dashboard+Preview" alt="Dashboard" /> | <img src="https://via.placeholder.com/600x350?text=Workspace+Discussion" alt="Workspace Discussion" /> |

| User Profile | Search & Discover |
| :---: | :---: |
| <img src="https://via.placeholder.com/600x350?text=User+Profile" alt="User Profile" /> | <img src="https://via.placeholder.com/600x350?text=Search+Projects" alt="Search Projects" /> |

---

## 🛠 Technology Stack

SkillSwap leverages a modern, bleeding-edge tech stack to ensure maximum performance and developer velocity.

| Layer | Technology | Description |
| --- | --- | --- |
| **Frontend** | [Next.js (App Router)](https://nextjs.org/) | React framework for server-side rendering and static generation. |
| **Styling** | [Tailwind CSS](https://tailwindcss.com/) | Utility-first CSS framework for rapid UI development. |
| **Components** | [shadcn/ui](https://ui.shadcn.com/) | Beautifully designed, accessible, and customizable React components. |
| **Icons** | [Lucide React](https://lucide.dev/) | Clean and modern iconography. |
| **Backend** | Next.js API Routes | Serverless edge functions handling RESTful endpoints. |
| **Database** | PostgreSQL | Relational database for structured data integrity. |
| **ORM** | [Prisma](https://www.prisma.io/) | Next-generation Node.js and TypeScript ORM. |
| **Authentication** | [Firebase Auth](https://firebase.google.com/) | Robust, secure identity and session management. |
| **Markdown** | React-Markdown + Remark-GFM | Safe rendering of markdown in discussion forums. |

---

## 📐 Architecture

SkillSwap follows a modern client-server architecture utilizing Next.js Server Components for heavy lifting and Client Components for interactivity. 

```mermaid
graph TD
    Client[Browser / Client] -->|HTTP Requests / Actions| NextJS[Next.js App Router]
    NextJS -->|Protected Routes| Auth[Firebase Auth JWT Verification]
    NextJS -->|Server Actions / APIs| Prisma[Prisma ORM]
    Prisma -->|Raw Queries / Migrations| DB[(PostgreSQL Database)]
    
    Client -.->|State Management| React[React Local State]
    Auth -.->|Session| Client
```

---

## 📁 Folder Structure

```text
SkillSwap/
├── prisma/                  # Database schema and migrations
│   └── schema.prisma        # Prisma data models
├── public/                  # Static assets (images, icons)
├── src/
│   ├── app/                 # Next.js App Router pages and layouts
│   │   ├── (dashboard)/     # Authenticated dashboard routes
│   │   ├── api/             # Backend REST API routes
│   │   ├── profile/         # Public user profile pages
│   │   ├── projects/        # Project discovery and details
│   │   ├── workspace/       # Isolated project collaboration hubs
│   │   └── chat/            # Direct messaging interfaces
│   ├── components/          # Reusable UI components
│   │   └── ui/              # shadcn/ui generic components
│   ├── lib/                 # Third-party library initializations (Prisma, Firebase)
│   └── utils/               # Helper functions (Auth validation, formatters)
├── package.json             # Dependencies and scripts
└── tailwind.config.ts       # Tailwind CSS configuration
```

---

## 🗄️ Database Design

The relational database is structured to support complex networking and project management without sacrificing performance.

### Core Models:
- **`User` & `Profile`**: Separates core auth data from public-facing profile information.
- **`Skill` & `UserSkill`**: A many-to-many relationship mapping users to their respective proficiencies.
- **`MatchRequest`**: Handles the logic for sending, accepting, and rejecting network connections.
- **`Project`**: The core entity for collaboration, containing metadata like title, description, and team size.
- **`ProjectMember`**: Maps accepted users to a project. *Note: Workspaces automatically derive their access control from this table.*
- **`ProjectJoinRequest`**: Tracks pending applications from users wanting to join a project.
- **`Conversation` & `Message`**: A polymorphic messaging system that supports both Direct Messages (1-on-1) and Workspace Group Chats. Includes native threading (`parentId`) and emojis (`MessageReaction`).
- **`Notification`**: A centralized table for platform-wide alerts (messages, requests, system alerts).

---

## 🔐 Authentication Flow

1. **Sign Up/Log In:** The client authenticates directly with Firebase Auth.
2. **Session Persistence:** Firebase manages the secure HTTP-only session token.
3. **API Protection:** Every protected API route invokes `verifyAuth(request)`. This utility decodes the JWT, verifies it against Firebase Admin, and attaches the `user` object to the request context.
4. **Unauthorized Access:** If the token is invalid or missing, the API throws a strict `403 Forbidden` or `401 Unauthorized`, instantly halting database execution.

---

## 🔗 Connection System

SkillSwap treats professional networking as a first-class citizen.
- **Discover:** Find users on the `/search` page based on overlapping skills.
- **Request:** Send a connection request (`MatchRequest`). The recipient gets a real-time Notification.
- **Review:** The recipient can Accept or Reject the request.
- **Collaborate:** Once accepted, a direct `Conversation` is automatically initialized, unlocking the ability to send Direct Messages.

---

## 🏗️ Project Collaboration Flow

The lifecycle of a project on SkillSwap:

```mermaid
sequenceDiagram
    participant Creator
    participant Platform
    participant Applicant
    
    Creator->>Platform: Creates New Project
    Platform-->>Applicant: Project appears in Discovery Feed
    Applicant->>Platform: Submits Join Request
    Platform->>Creator: Sends Notification
    Creator->>Platform: Reviews & Accepts Request
    Platform->>Platform: Creates ProjectMember Record
    Platform->>Platform: Grants Workspace Access
    Platform-->>Applicant: Sends Acceptance Notification
    Applicant->>Platform: Enters Workspace Discussion
```

---

## 🏢 Workspace

The Workspace is an isolated environment generated exclusively for accepted `ProjectMembers`. It acts as the command center for your team:

- **Overview:** High-level statistics, recent activities, and upcoming deadlines.
- **Discussion:** A real-time, Markdown-supported group chat. Features include Emoji Reactions, threaded replies, date separators, and robust file attachment parsing.
- **Members:** A dynamic, synchronized list of the team. Automatically derives state from the `ProjectMember` table. Project Owners can moderate and remove members here.
- **Tasks (Coming Soon):** Kanban-style task tracking.
- **Files & Announcements (Coming Soon):** Shared asset repository and important team broadcasts.

---

## 📱 Responsive Design

SkillSwap's UI is strictly engineered to be fluid and fully responsive:
- **Desktop (1024px+):** Expansive grid layouts, persistent sidebars, and dense data tables.
- **Tablet (768px - 1024px):** Collapsible sidebars, adjusted grid columns, and optimized touch targets.
- **Mobile (<768px):** Bottom navigation bars, hamburger menus, stacked cards, and full-screen modal takeovers to ensure complete functionality on the go.

---

## 🛡️ Security

- **Database Integrity:** Prisma ORM prevents SQL injection by default through parameterized queries.
- **Authorization:** API routes strictly verify ownership. (e.g., A user cannot delete a `ProjectMember` unless their ID matches the `Project.ownerId`).
- **Data Privacy:** Passwords are never stored on our database; identity is entirely delegated to Firebase's encrypted infrastructure.
- **Cascade Deletions:** Database relationships utilize `onDelete: Cascade` to ensure that deleting a Project securely wipes all related tasks, messages, and files without leaving orphaned data.

---

## 🚀 Installation & Local Development

Follow these steps to get SkillSwap running on your local machine.

### 1. Clone the repository
```bash
git clone https://github.com/yourusername/skillswap.git
cd skillswap
```

### 2. Install dependencies
```bash
npm install
# or
yarn install
```

### 3. Setup Environment Variables
Create a `.env` file in the root directory and populate it:
```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/skillswap?schema=public"

# Firebase Client
NEXT_PUBLIC_FIREBASE_API_KEY="your_api_key"
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="your_domain"
NEXT_PUBLIC_FIREBASE_PROJECT_ID="your_project_id"

# Firebase Admin
FIREBASE_CLIENT_EMAIL="your_client_email"
FIREBASE_PRIVATE_KEY="your_private_key"
```

### 4. Database Initialization
Push the Prisma schema to your database and generate the TypeScript client:
```bash
npx prisma db push
npx prisma generate
```

### 5. Start the Development Server
```bash
npm run dev
```
Visit `http://localhost:3000` in your browser.

---

## 🛣️ Future Roadmap

- [ ] **Real-time WebSockets:** Migrate polling to Socket.io or Pusher for instantaneous chat delivery.
- [ ] **AI Project Matching:** Implement an AI recommendation engine to suggest teammates based on skill gaps.
- [ ] **Kanban Task Board:** Complete the drag-and-drop task management tab inside Workspaces.
- [ ] **AWS S3 Integration:** Enable robust, scalable file storage for project assets.
- [ ] **Video/Audio Calls:** Native WebRTC integration for team standups.
- [ ] **Mobile App:** A React Native wrapper for iOS and Android platforms.

---

## 🤝 Contributing

We welcome contributions from the community! To contribute:
1. Fork the repository.
2. Create a new branch (`git checkout -b feature/amazing-feature`).
3. Commit your changes (`git commit -m 'Add amazing feature'`).
4. Push to the branch (`git push origin feature/amazing-feature`).
5. Open a Pull Request.

Please ensure your code passes `npx tsc --noEmit` and follows the existing ESLint configurations.

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Author

**Your Name**
- GitHub: [@yourusername](https://github.com/yourusername)
- LinkedIn: [Your Name](https://linkedin.com/in/yourusername)
- Portfolio: [yourwebsite.com](https://yourwebsite.com)
- Email: your.email@example.com

---

## 🙏 Acknowledgements
- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs/)
- [shadcn/ui](https://ui.shadcn.com/) for the incredible component library.
- [Vercel](https://vercel.com/) for hosting and deployment inspiration.

<div align="center">
  <br />
  <p align="center">
  Made with ❤️ by the <strong>SkillSwap Team</strong><br><br>

  👨‍💻 <strong>Sanjid Talukder</strong> — Full Stack Development, System Architecture, Database Design, UI/UX Implementation, Backend APIs, Workspace, Messaging, Testing & Deployment Lead.<br>

  🧪 <strong>Adib Al Zawan</strong> — Project Review, Testing, Quality Assurance & Feature Validation.<br>

  🧪 <strong>Mizan</strong> — Project Review, Testing, Bug Verification & Feedback.
</p>
</div>

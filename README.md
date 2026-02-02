<p align="center">
  <img width="400" height="400" alt="image" src="https://github.com/user-attachments/assets/daf2a942-a3e7-4e47-911f-79194ba4de96" />
</p>

<p align="center">
  One-time Secure File Sharing Platform
</p>



<p align="center">
  <img src="https://img.shields.io/badge/Next.js-16.1.4-black?style=flat-square&logo=next.js" alt="Next.js" />
  <img src="https://img.shields.io/badge/React-19.2.3-61DAFB?style=flat-square&logo=react" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/TailwindCSS-4-06B6D4?style=flat-square&logo=tailwindcss" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/Firebase-Auth-FFCA28?style=flat-square&logo=firebase" alt="Firebase" />
  <img src="https://img.shields.io/badge/AWS-S3%20%2B%20DynamoDB-FF9900?style=flat-square&logo=amazon-aws" alt="AWS" />
</p>

<img width="1919" height="1079" alt="image" src="https://github.com/user-attachments/assets/47dc2040-9ea2-4157-bf29-e948735a4a9d" />


## Overview

**OneDrop** is a unique file-sharing application that reimagines how you organize and share files. Instead of traditional folder structures, OneDrop uses an interactive canvas with draggable "boxes" — visual containers for your files that can be organized freely on a flow-based interface.

Create boxes, drop files into them, and share with anyone using time-limited secure links. Perfect for quick file transfers, project organization, or collaborative workflows.


## Features

### Visual Box System
- **Interactive Canvas** — Organize your boxes on a free-form canvas using React Flow
- **Drag & Drop** — Create boxes and upload files with intuitive drag-and-drop
- **Custom Box Images** — Each box gets a unique visual representation
- **Delete by Dragging** — Simply drag boxes to the trash zone to delete

### Secure Authentication
- **Google Sign-In** — Quick and secure authentication via Firebase
- **Token-Based API** — All API routes protected with Firebase token verification
- **User Isolation** — Each user's boxes and files are completely private

### Easy Sharing
- **Share Links** — Generate temporary share links for any box
- **Time-Limited Access** — Share links automatically expire after 10 minutes
- **Bulk Download** — Recipients can download all files as a ZIP archive
- **No Account Required** — Anyone with the link can access shared files

### Cloud-Powered Storage
- **S3 Storage** — Files stored securely in AWS S3
- **Presigned URLs** — Direct uploads to S3 for maximum performance
- **DynamoDB Backend** — Fast and scalable metadata storage


## Demo

| Feature | Preview |
|---------|---------|
| **Login Page** | Clean, modern authentication with Google Sign-In |
| **Drop Canvas** | Interactive box management on a flow-based canvas |
| **Box Contents** | View files inside a box with size and type info |
| **Share Dialog** | One-click share link generation |


## Tech Stack

### Frontend
| Technology | Purpose |
|------------|---------|
| **Next.js 16** | React framework with App Router |
| **React 19** | UI library with latest features |
| **TypeScript** | Type-safe development |
| **Tailwind CSS 4** | Utility-first styling |
| **React Flow** | Interactive node-based canvas |
| **Radix UI** | Accessible UI primitives |
| **Lucide Icons** | Beautiful icon set |
| **Sonner** | Toast notifications |

### Backend
| Technology | Purpose |
|------------|---------|
| **Next.js API Routes** | Serverless API endpoints |
| **Firebase Admin** | Server-side token verification |
| **AWS S3** | File storage with presigned URLs |
| **AWS DynamoDB** | NoSQL database for metadata |
| **Archiver** | ZIP file generation for downloads |

### Authentication
| Technology | Purpose |
|------------|---------|
| **Firebase Auth** | User authentication |
| **Google OAuth** | Social sign-in provider |


## Getting Started

### Prerequisites

- **Node.js** 18+ 
- **npm**, **yarn**, **pnpm**, or **bun**
- **Firebase Project** with Authentication enabled
- **AWS Account** with S3 and DynamoDB access
  
### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/onedrop.git
   cd onedrop
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Set up environment variables**
   
   Create a `.env` file in the root directory

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000)


## Environment Variables

Create a `.env` file with the following variables:

### Firebase (Client-Side)
```env
NEXT_PUBLIC_API_KEY=your_firebase_api_key
NEXT_PUBLIC_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_PROJECT_ID=your_project_id
NEXT_PUBLIC_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_APP_ID=your_app_id
NEXT_PUBLIC_MEASUREMENT_ID=your_measurement_id
```

### Firebase Admin (Server-Side)
```env
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your_project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

### AWS Configuration
```env
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
S3_REGION=us-east-1
S3_BUCKET=your-bucket-name
BOXES_TABLE=onedrop-boxes
BOX_SHARES_TABLE=onedrop-box-shares
```


## API Reference

### Authentication
All API endpoints (except share routes) require a Firebase ID token in the `Authorization` header:
```
Authorization: Bearer <firebase_id_token>
```

### Endpoints

#### Boxes

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/boxes` | List all boxes for authenticated user |
| `POST` | `/api/boxes` | Create a new box |
| `DELETE` | `/api/boxes/[boxId]` | Delete a box and its files |
| `GET` | `/api/boxes/[boxId]/files` | List files in a box |
| `POST` | `/api/boxes/[boxId]/files` | Get presigned URL for file upload |
| `POST` | `/api/boxes/[boxId]/share` | Generate a share link |

#### Shares (Public)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/shares/[shareToken]` | Get shared box files |
| `GET` | `/api/shares/[shareToken]/download` | Download all files as ZIP |



## Project Structure

```
onedrop/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Authentication routes
│   │   ├── login/               # Login page
│   │   ├── register/            # Registration page
│   │   └── AuthGate.tsx         # Auth protection wrapper
│   ├── api/                      # API routes
│   │   ├── boxes/               # Box CRUD operations
│   │   └── shares/              # Share link handling
│   ├── drop/                     # Main application page
│   ├── share/                    # Public share page
│   ├── globals.css              # Global styles
│   ├── layout.tsx               # Root layout
│   └── page.tsx                 # Landing page
├── backend/                      # Backend services
│   ├── auth/                    # Firebase token verification
│   ├── config/                  # Environment configuration
│   ├── services/                # AWS services (S3, DynamoDB)
│   └── utils/                   # Utility functions
├── components/                   # React components
│   ├── ui/                      # Shadcn/ui components
│   ├── BoxNode.tsx              # Box component for React Flow
│   ├── GoogleAuthButton.tsx     # Google sign-in button
│   ├── NewBox.tsx               # Box creation dialog
│   └── UploadToast.tsx          # Upload notification toasts
├── firebase/                     # Firebase configuration
├── lib/                          # Utility libraries
├── public/                       # Static assets
│   └── boximgs/                 # Box image assets
└── ...config files
```



## AWS Setup

### S3 Bucket Configuration

1. Create an S3 bucket with the following settings:
   - **Block all public access**: Enabled (files accessed via presigned URLs)
   - **CORS Configuration**:
   ```json
   [
     {
       "AllowedHeaders": ["*"],
       "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
       "AllowedOrigins": ["https://your-domain.com", "http://localhost:3000"],
       "ExposeHeaders": ["ETag"]
     }
   ]
   ```

### DynamoDB Tables

Create two tables with the following schemas:

**Boxes Table** (`onedrop-boxes`)
| Attribute | Type | Key |
|-----------|------|-----|
| `boxId` | String | Partition Key |
| `ownerId` | String | GSI Partition Key |
| `boxName` | String | — |
| `boxImage` | String | — |
| `status` | Boolean | — |
| `createdAt` | Number | — |

**Box Shares Table** (`onedrop-box-shares`)
| Attribute | Type | Key |
|-----------|------|-----|
| `shareToken` | String | Partition Key |
| `boxId` | String | — |
| `ownerId` | String | — |
| `expiresAt` | Number | — |
| `downloadCount` | Number | — |



## Deployment

### Vercel (Recommended)

1. **Connect your repository** to Vercel

2. **Add environment variables** in Vercel dashboard

3. **Deploy**
   ```bash
   vercel --prod
   ```

The project includes a `vercel.json` for CORS configuration.



## License

This project is licensed under the MIT License


## Acknowledgments

- [React Flow](https://reactflow.dev/) — For the amazing canvas library
- [Shadcn/ui](https://ui.shadcn.com/) — For beautiful UI components
- [Lucide](https://lucide.dev/) — For the icon set
- [Vercel](https://vercel.com/) — For hosting and deployment


<p align="right">
  <i>Developed by Aarvee.</i>
</p>

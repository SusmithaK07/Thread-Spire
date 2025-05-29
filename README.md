# ThreadSpire

A modern thread-based discussion platform built with Next.js and Supabase.

## Features

- User authentication with NextAuth.js
- Thread creation and management
- Real-time reactions and bookmarks
- User profiles and collections
- Rate limiting and security features

## Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account
- Upstash Redis account (for rate limiting)
- SMTP server (for password reset)

## Setup

1. Clone the repository:
```bash
git clone https://github.com/yourusername/threadspire.git
cd threadspire
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file based on `.env.example`:
```bash
cp .env.example .env
```

4. Update the environment variables in `.env` with your credentials:
- Supabase project URL and keys
- NextAuth secret
- Redis URL and token
- SMTP server details

5. Start the development server:
```bash
npm run dev
```

## Environment Variables

- `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase service role key
- `NEXTAUTH_URL`: Your application URL (e.g., http://localhost:3000)
- `NEXTAUTH_SECRET`: A random string for NextAuth.js
- `UPSTASH_REDIS_REST_URL`: Your Upstash Redis URL
- `UPSTASH_REDIS_REST_TOKEN`: Your Upstash Redis token
- `SMTP_*`: Your SMTP server details for password reset emails

## Security Features

- Rate limiting on API routes
- Secure headers
- Password hashing
- Session management
- Protected routes

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🚀 Deploying to Render

This application is configured for deployment on [Render](https://render.com/). Follow these steps to deploy:

1. Fork or clone this repository to your GitHub account.

2. Sign up for a Render account if you don't have one already.

3. Create a new Web Service on Render and connect your GitHub repository.

4. Use the following settings:
   - **Environment**: Node
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`

5. Add the following environment variables in the Render dashboard:
   - `VITE_SUPABASE_URL`: Your Supabase project URL
   - `VITE_SUPABASE_ANON_KEY`: Your Supabase anonymous key
   - `NODE_ENV`: Set to `production`

6. Deploy your application and wait for the build to complete.

7. Your application should now be live at the URL provided by Render!

## Local Development

To run the application locally:

1. Clone the repository:
   ```
   git clone <repository-url>
   cd threadspire
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env` file in the root directory with the following content:
   ```
   VITE_SUPABASE_URL=https://ecvsmyznwxulnxvyapqm.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVjdnNteXpud3h1bG54dnlhcHFtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc2Nzg4OTYsImV4cCI6MjA2MzI1NDg5Nn0.i0wP77SR-RgCzYfY18QXm9yYoXKHgGh8utUqWkT_WTk
   PORT=3000
   NODE_ENV=development
   ```

4. Start the development server:
   ```
   npm run dev
   ```

5. Open your browser and navigate to `http://localhost:3000`

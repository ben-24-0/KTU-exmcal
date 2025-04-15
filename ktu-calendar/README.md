# KTU Exam Calendar

A modern and responsive web application for managing and viewing KTU examination schedules. Students can view their semester-wise exam schedule in both calendar and list views, while administrators can manage exam dates and details.

## Features

- Semester-wise exam schedule viewing
- Calendar view with exam highlights
- List view with exam details and study leave information
- Admin panel for managing exam schedules
- Responsive design for mobile and desktop
- Secure authentication for admin access

## Tech Stack

- React with TypeScript
- Material UI for components and styling
- Firebase for authentication and database
- React Calendar for calendar view
- Date-fns for date manipulation
- React Router for navigation

## Setup Instructions

1. Clone the repository:
```bash
git clone <repository-url>
cd ktu-calendar
```

2. Install dependencies:
```bash
npm install
```

3. Create a Firebase project and get your configuration:
   - Go to the Firebase Console (https://console.firebase.google.com/)
   - Create a new project
   - Enable Authentication with Email/Password
   - Create a Firestore database
   - Get your Firebase configuration from Project Settings

4. Update Firebase configuration:
   - Open `src/config/firebase.ts`
   - Replace the placeholder config with your Firebase configuration

5. Start the development server:
```bash
npm run dev
```

## Admin Access

To access the admin panel:
1. Create an admin user in Firebase Authentication
2. Navigate to `/login` in the application
3. Log in with your admin credentials
4. Access the admin panel to manage exams

## Development

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## License

MIT

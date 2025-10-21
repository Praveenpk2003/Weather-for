# SkyNow - Weather Forecast App with Authentication

A React.js application with complete authentication system and real-time weather data for your current location.

## Features

- 🔐 **Complete Authentication System**
  - User registration with validation
  - Secure login with JWT tokens
  - Password reset functionality
  - Protected routes
  - Token-based authentication

- 🌤️ **Real-Time Weather Data**
  - Current location weather detection
  - Beautiful weather display with icons
  - Detailed weather information (temperature, humidity, pressure, wind)
  - Location-based weather updates
  - Powered by OpenWeatherMap API

- 🎨 **Modern UI/UX**
  - Built with Tailwind CSS
  - Responsive design
  - Beautiful form components
  - Loading states and error handling
  - Interactive weather cards

- 🛡️ **Security Features**
  - JWT token management
  - Automatic token expiration handling
  - Protected routes
  - Form validation
  - Secure password handling

## Tech Stack

- **Frontend**: React.js with JavaScript
- **Styling**: Tailwind CSS
- **Routing**: React Router DOM
- **State Management**: React Context API
- **HTTP Client**: Axios & Fetch API
- **Weather API**: OpenWeatherMap
- **Location Services**: Browser Geolocation API

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd weather-auth-app
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
# Copy the example environment file
cp env.example .env

# Edit .env and add your OpenWeatherMap API key
# Get your free API key from https://openweathermap.org/api
```

4. Start the development server:
```bash
npm start
```

5. Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

### Weather API Setup

1. Visit [OpenWeatherMap](https://openweathermap.org/api) and sign up for a free account
2. Get your API key from the dashboard
3. Add it to your `.env` file:
```env
REACT_APP_WEATHER_API_KEY=your_api_key_here
```

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Button.jsx      # Custom button component
│   ├── FormInput.jsx   # Form input component
│   ├── ProtectedRoute.jsx # Route protection component
│   └── WeatherCard.jsx # Weather display component
├── contexts/           # React contexts
│   └── AuthContext.jsx # Authentication context
├── pages/              # Page components
│   ├── Login.jsx       # Login page
│   ├── Register.jsx    # Registration page
│   ├── ForgotPassword.jsx # Password reset request
│   ├── ResetPassword.jsx  # Password reset form
│   ├── Dashboard.jsx   # Protected dashboard with weather
│   ├── Home.jsx        # Landing page
│   └── Features.jsx    # Features page
├── services/           # API services
│   ├── authService.js  # Authentication service
│   ├── mockAuthService.js # Mock service for development
│   └── weatherService.js # Weather API service
└── App.jsx             # Main app component with routing
```

## Authentication Flow

### 1. Registration
- User fills out registration form
- Form validation ensures data integrity
- JWT token is generated and stored
- User is redirected to dashboard

### 2. Login
- User enters email and password
- Credentials are validated
- JWT token is generated and stored
- User is redirected to dashboard

### 3. Password Reset
- User requests password reset via email
- Reset link is sent (simulated in mock service)
- User clicks link and enters new password
- Password is updated and user can login

### 4. Protected Routes
- Routes are protected by authentication status
- Unauthenticated users are redirected to login
- JWT tokens are automatically included in API requests

## Mock Service

The application includes a mock authentication service for development and testing:

- **Test Users**:
  - Email: `john@example.com`, Password: `password123`
  - Email: `jane@example.com`, Password: `password123`

- **Features**:
  - Simulates API delays
  - JWT token generation
  - User registration and login
  - Password reset functionality

## Environment Variables

Create a `.env` file in the root directory:

```env
# Weather API Configuration
REACT_APP_WEATHER_API_KEY=your_openweathermap_api_key_here

# Authentication API Configuration (if using real backend)
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_USE_MOCK_SERVICE=true
```

### Required API Keys

- **OpenWeatherMap API**: Get your free API key from [OpenWeatherMap](https://openweathermap.org/api)
  - Sign up for a free account
  - Navigate to API keys section
  - Copy your API key and add it to `.env` file

## Backend Integration

To connect to a real backend:

1. Set `REACT_APP_USE_MOCK_SERVICE=false` in your `.env` file
2. Update `REACT_APP_API_URL` to point to your backend
3. Ensure your backend implements the following endpoints:

```
POST /api/auth/register
POST /api/auth/login
GET  /api/auth/verify
POST /api/auth/forgot-password
POST /api/auth/reset-password
GET  /api/auth/me
```

## Available Scripts

- `npm start` - Runs the app in development mode
- `npm test` - Launches the test runner
- `npm run build` - Builds the app for production
- `npm run eject` - Ejects from Create React App

## Customization

### Styling
- Modify `tailwind.config.js` to customize the design system
- Update colors, fonts, and spacing as needed
- All components use Tailwind utility classes

### Components
- All components are modular and reusable
- Easy to customize and extend
- TypeScript interfaces ensure type safety


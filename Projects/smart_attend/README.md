# SmartAttend

SmartAttend is a Flutter attendance app with lecturer and student flows, backed by a small Node.js/Express authentication API.

## Project layout

- Flutter app: Projects/smart_attend
- API server: Projects/smart_attend/server.js
- Runtime user store: Projects/smart_attend/data/users.json (created automatically and ignored by Git)

## Run the backend

From Projects/smart_attend:

npm install
npm start

The API listens on port 5000 by default. Set PORT to use another port.

## Run the Flutter app

From Projects/smart_attend:

flutter pub get
flutter run --dart-define=API_BASE_URL=http://<your-computer-ip>:5000

The API URL must be reachable from the device or emulator running Flutter. The app defaults to the existing development address when no API_BASE_URL is supplied.

## Authentication API

- POST /api/auth/register creates a lecturer or student account.
- POST /api/auth/login authenticates an account and returns a user profile plus token.
- GET /api/health checks that the server is running.

Passwords are hashed with Node's built-in scrypt implementation. The JSON user store is suitable for local development; use a real database before production deployment.

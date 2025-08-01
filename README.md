# EspressoLabs Real-Time Chat Application

A real-time chat application built with ReactJS and Node.js that allows users to join different chat rooms and interact in real time using Socket.IO.

## Features

✅ **Real-Time Communication**
- Bidirectional messaging using Socket.IO
- Messages broadcast to all users within specific chat rooms
- Live connection status indicator

✅ **Simple Authentication**
- Quick login with name and email
- User avatars with photo support
- Pre-configured demo users for testing

✅ **Multiple Chat Rooms**
- Create and join chat rooms dynamically
- Display list of active chat rooms
- Show online users in each room
- Isolated message history for each room (in-memory)

✅ **Responsive Design**
- Modern UI built with Tailwind CSS and shadcn/ui
- Mobile-friendly responsive layout
- Real-time user presence indicators

## Tech Stack

- **Frontend**: ReactJS with TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Node.js with Express & Socket.IO
- **Real-time Communication**: Socket.IO
- **Storage**: In-memory (for the 90-minute challenge)

## Setup Instructions

### Prerequisites
- Node.js (v16 or higher)
- npm or pnpm

### Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the server:
   ```bash
   npm start
   ```
   
   The backend server will run on `http://localhost:3001`

### Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   pnpm install
   ```

3. Start the development server:
   ```bash
   pnpm run dev --host
   ```
   
   The frontend will be available at `http://localhost:5173`

### Running the Application
1. Start both backend and frontend servers
2. Open your browser and navigate to `http://localhost:5173`
3. Use one of the quick login options or enter your own details
4. Create a new chat room or join an existing one
5. Start chatting in real-time!

## Architecture Overview

The application follows a client-server architecture with real-time communication:

### Backend (Node.js + Express + Socket.IO)
- **Express Server**: Handles HTTP requests and serves API endpoints
- **Socket.IO Server**: Manages WebSocket connections for real-time communication
- **In-Memory Storage**: Stores chat rooms, messages, and user data
- **Event Handlers**: Manages user authentication, room creation/joining, and message broadcasting

### Frontend (React + TypeScript)
- **React Components**: Modular UI components for login, chat interface, and room management
- **Socket.IO Client**: Handles real-time communication with the backend
- **State Management**: React hooks for managing application state
- **Responsive Design**: Tailwind CSS for modern, mobile-friendly UI

### Data Flow
1. User authenticates via the login form
2. Socket.IO establishes real-time connection
3. User can create new rooms or join existing ones
4. Messages are sent via Socket.IO and broadcast to all room members
5. Real-time updates for user presence and room lists

## What I'd Improve with More Time

### Scalability & Performance
- **Database Integration**: Replace in-memory storage with PostgreSQL/MongoDB for persistence
- **Redis for Session Management**: Implement Redis for scalable session storage
- **Horizontal Scaling**: Add support for multiple server instances with Redis pub/sub
- **Message Pagination**: Implement pagination for chat history in large rooms

### Authentication & Security
- **OAuth Integration**: Implement proper Google/Microsoft OAuth2 authentication
- **JWT Tokens**: Add secure token-based authentication
- **Rate Limiting**: Implement rate limiting for messages and API calls
- **Input Sanitization**: Add comprehensive input validation and sanitization

### Features & UX
- **File Sharing**: Support for image and file uploads
- **Message Reactions**: Add emoji reactions to messages
- **Private Messaging**: Direct messages between users
- **Message Search**: Search functionality within chat history
- **Push Notifications**: Browser notifications for new messages
- **Typing Indicators**: Show when users are typing

### Testing & Deployment
- **Unit Testing**: Comprehensive Jest tests for components and API endpoints
- **E2E Testing**: Cypress tests for complete user workflows
- **Docker Containerization**: Docker setup for easy deployment
- **CI/CD Pipeline**: Automated testing and deployment pipeline
- **Monitoring**: Application monitoring and error tracking

### Code Quality
- **Error Handling**: Comprehensive error handling and user feedback
- **Code Splitting**: Optimize bundle size with code splitting
- **Performance Optimization**: Implement memoization and virtual scrolling
- **Accessibility**: WCAG compliance for better accessibility

## Demo Video

[Video demo would be recorded showing the application in action, demonstrating user login, room creation, joining rooms, and real-time messaging]

## Project Structure

```
espresso-chat-app/
├── backend/
│   ├── server.js          # Main server file with Socket.IO setup
│   ├── package.json       # Backend dependencies
│   └── .env              # Environment variables
├── frontend/
│   ├── src/
│   │   ├── components/    # React components
│   │   │   ├── ui/       # shadcn/ui components
│   │   │   ├── LoginForm.jsx
│   │   │   ├── ChatInterface.jsx
│   │   │   ├── ChatRoom.jsx
│   │   │   ├── RoomList.jsx
│   │   │   └── CreateRoomDialog.jsx
│   │   ├── App.jsx       # Main App component
│   │   └── main.jsx      # Entry point
│   ├── package.json      # Frontend dependencies
│   └── index.html        # HTML template
└── README.md             # This file
```

## Development Notes

- Built within the 90-minute time constraint as specified in the challenge
- Focused on core functionality and clean code structure
- Used modern React patterns with hooks and functional components
- Implemented responsive design for mobile compatibility
- Real-time features work seamlessly across multiple browser tabs/windows

---

Built for the EspressoLabs coding challenge - demonstrating real-time web application development skills with modern JavaScript technologies.

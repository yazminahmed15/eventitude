🎟️ Eventitude - Event Management Platform
A full-stack event management system designed to streamline event planning and user interactions.

📖 Overview
Eventitude is a scalable event management platform built with a modern frontend-backend separation approach. The goal of this project is to provide a lightweight, fast, and responsive system for managing events while adhering to strict API specifications.

This project was developed as part of a university assessment, with an emphasis on:

Implementing a RESTful API according to a provided Swagger specification.
Ensuring the database structure aligns with the given schema.
Writing unit and integration tests to validate API functionality.
Developing a Vue.js frontend to interact with the backend API.

🚀 Features
✅ User authentication (login, registration) 🔐
✅ Create, update, and delete events 📅
✅ Event filtering & searching 🔍
✅ Attendee registration & management 🎫
✅ Responsive & interactive UI 💻
✅ Scalable API with SQLite database 🛠️
✅ Automated testing to validate API endpoints ✅

🛠️ Technologies Used

🌐 Frontend (Client-side)
Vue.js – Reactive front-end framework
Vue Router – Navigation and routing
Axios – API communication
Bootstrap – UI styling

🖥️ Backend (Server-side)
Node.js & Express.js – Backend framework
SQLite – Lightweight database
Sequelize – ORM for database management
JWT Authentication – Secure user login
Swagger API Specification – Standardized API documentation

🛠️ Development & Testing
Jest & Supertest – API testing framework
Postman – API testing tool
npm & Node Package Manager – Dependency management


📂 Project Structure

eventitude/
│── backend/               # API and database logic
│   ├── app/               # Core backend logic (routes, controllers, models)
│   ├── config/            # Configuration files
│   ├── tests/             # API test scripts
│   ├── db.sqlite          # SQLite database file
│── frontend/              # Vue.js front-end
│   ├── src/               # Source code for front-end
│   ├── components/        # Reusable UI components
│   ├── views/             # Pages and views
│   ├── router/            # Vue Router settings
│── README.md              # Project documentation
│── package.json           # Node.js dependencies


📌 How to Run the Project

1️⃣ Clone the Repository

git clone https://github.com/yourusername/eventitude.git
cd eventitude

2️⃣ Set Up the Backend
Navigate to the backend directory:

cd backend

Install dependencies:

npm install

Start the development server:

npm run dev
The API will run at http://localhost:3000

3️⃣ Set Up the Frontend
Open a new terminal window and navigate to the frontend:

cd frontend

Install dependencies:

npm install

Run the front-end application:

npm run serve
Open http://localhost:8080 in your browser.


📡 API Endpoints
The backend follows a RESTful API design. Below are some key endpoints:

Method	Endpoint	      Description
POST	  /auth/register	Register a new user
POST	  /auth/login	    User login
GET	    /events	        Get all events
POST	  /events	        Create a new event
PUT	    /events/:id	    Update an existing event
DELETE	/events/:id	    Delete an event
🔹 Full API documentation available on Swagger: Eventitude API Docs

✅ Running Tests
To ensure the API conforms to the given Swagger specification, the project includes automated test scripts.

Start the backend server:

npm run dev

In a new terminal window, run:

npm test

The test suite will validate all API endpoints.


🛠️ Future Improvements
🔹 Implement real-time event updates with WebSockets
🔹 Add payment integration (Stripe or PayPal) for ticketed events
🔹 Implement user roles (admin, attendee, organizer)
🔹 Improve front-end animations & UI design

📜 License
This project is licensed under the MIT License.

⭐ Like this project? Give it a star on GitHub!
🚀 Happy coding & event planning! 🎉

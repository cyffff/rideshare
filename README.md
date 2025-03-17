# Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.\
You will also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

# RideShare Application

A modern ride-sharing platform built with Spring Boot and React.

## Features

- **User Authentication**: Secure login and registration system with JWT
- **Ride Booking**: Easy-to-use interface for booking rides
- **Driver Dashboard**: Comprehensive dashboard for drivers to manage rides
- **Real-time Tracking**: Track rides in real-time (simulated)
- **Payment Processing**: Integrated payment system with Stripe
- **Ride History**: View past rides and ratings
- **Rating System**: Rate drivers and passengers after rides

## Technology Stack

### Backend
- **Java 17**
- **Spring Boot 3.0**
- **Spring Security** with JWT Authentication
- **Spring Data JPA** with MySQL
- **Maven** for dependency management
- **Stripe API** for payment processing

### Frontend
- **React 19** with TypeScript
- **React Router** for navigation
- **Material-UI** for modern UI components
- **Axios** for API requests
- **Google Maps API** integration (simulated)

## Project Structure

The project is organized as a monorepo with backend and frontend directories:

```
rideshare/
├── src/                  # Backend Java code
│   └── main/
│       ├── java/         # Java source files
│       └── resources/    # Application properties
├── frontend/             # React frontend
│   ├── public/           # Static assets
│   └── src/              # React components
├── pom.xml               # Maven configuration
└── README.md
```

## Setup Instructions

### Prerequisites
- Java 17 or higher
- Node.js 16 or higher
- Maven 3.6 or higher
- MySQL 8.0 or higher

### Database Setup
1. Create a MySQL database:
```sql
CREATE DATABASE rideshare;
```

2. Configure the database connection in `src/main/resources/application.yml`

### Backend Setup
1. Navigate to the project root directory
2. Build the project:
```bash
mvn clean install -DskipTests
```
3. Run the Spring Boot application:
```bash
mvn spring-boot:run
```

The backend server will start on http://localhost:8080

### Frontend Setup
1. Navigate to the frontend directory:
```bash
cd frontend
```
2. Install dependencies:
```bash
npm install
```
3. Start the development server:
```bash
npm start
```

The frontend will be available at http://localhost:3000

## Running the Application

To run both services at once:

1. Start the backend server first:
```bash
mvn spring-boot:run
```

2. In a new terminal, start the frontend:
```bash
cd frontend && npm start
```

3. Access the application at http://localhost:3000

## Demo Credentials

You can use the following demo credentials to test the application:

- **Passenger**:
  - Email: demo@example.com
  - Password: password

- **Driver**:
  - Email: driver@example.com
  - Password: password

## API Documentation

The API documentation is available at http://localhost:8080/swagger-ui.html when the backend server is running.

## Contribution Guidelines

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit your changes: `git commit -m 'Add some feature'`
4. Push to the branch: `git push origin feature-name`
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Acknowledgments

- [Spring Boot](https://spring.io/projects/spring-boot)
- [React](https://reactjs.org/)
- [Material-UI](https://mui.com/)
- [Google Maps API](https://developers.google.com/maps)
- [Stripe](https://stripe.com/) 
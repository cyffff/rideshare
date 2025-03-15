# RideShare Application

A modern ride-sharing platform built with Spring Boot and React.

## Features

- **User Authentication**: Secure login and registration for passengers and drivers
- **Ride Booking**: Request, schedule, and track rides in real-time
- **Driver Dashboard**: Accept rides, navigate to pickup locations, and manage earnings
- **Ride History**: View past rides, ratings, and receipts
- **Payment Processing**: Secure payment handling with Stripe integration
- **Shared Rides**: Option to share rides with other passengers for reduced costs
- **Rating System**: Rate drivers and passengers after completed rides

## Technology Stack

### Backend
- Java 17
- Spring Boot 3.x
- Spring Security with JWT
- Spring Data JPA
- PostgreSQL
- Stripe API for payments
- WebSockets for real-time updates

### Frontend
- React 18
- TypeScript
- Material-UI
- Google Maps API
- Stripe Elements for payment UI
- Axios for API communication

## Getting Started

### Prerequisites
- Java 17+
- Node.js 16+
- PostgreSQL
- Stripe account (for payment processing)
- Google Maps API key

### Backend Setup

1. Clone the repository
   ```
   git clone https://github.com/yourusername/rideshare.git
   cd rideshare
   ```

2. Configure database in `application.properties`
   ```
   spring.datasource.url=jdbc:postgresql://localhost:5432/rideshare
   spring.datasource.username=postgres
   spring.datasource.password=yourpassword
   ```

3. Add your Stripe API keys to `application.properties`
   ```
   stripe.api.key=your_stripe_secret_key
   stripe.publishable.key=your_stripe_publishable_key
   ```

4. Build and run the application
   ```
   ./mvnw spring-boot:run
   ```

### Frontend Setup

1. Navigate to the frontend directory
   ```
   cd frontend
   ```

2. Install dependencies
   ```
   npm install
   ```

3. Create a `.env` file with your Google Maps API key
   ```
   REACT_APP_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
   ```

4. Start the development server
   ```
   npm start
   ```

5. Access the application at `http://localhost:3000`

## API Documentation

The API documentation is available at `/swagger-ui.html` when the backend is running.

## Database Schema

The application uses the following main entities:
- User (with roles: PASSENGER, DRIVER, ADMIN)
- Ride
- Payment
- Rating

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- [Spring Boot](https://spring.io/projects/spring-boot)
- [React](https://reactjs.org/)
- [Material-UI](https://mui.com/)
- [Google Maps API](https://developers.google.com/maps)
- [Stripe](https://stripe.com/) 
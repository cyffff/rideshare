# Ride Sharing Application

A full-stack ride-sharing application built with Spring Boot and React, featuring Google Maps integration and Stripe payment processing.

## Prerequisites

- Java 17
- Node.js 16+
- MySQL 8.0+
- Google Maps API Key
- Stripe Account

## Setup

### Database Setup

1. Install MySQL 8.0 or later
2. Create a MySQL user or use root (for development only)
3. The application will automatically create the database `rideshare` when it starts

### Backend Setup

1. Update `src/main/resources/application.yml` with your MySQL credentials:
   ```yaml
   spring:
     datasource:
       url: jdbc:mysql://localhost:3306/rideshare?createDatabaseIfNotExist=true&useSSL=false
       username: your_username
       password: your_password
   ```
2. Add your Stripe API keys to the application.yml file
3. Run the Spring Boot application:
   ```bash
   ./mvnw spring-boot:run
   ```

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file and add your API keys:
   ```
   REACT_APP_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
   REACT_APP_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key_here
   ```
4. Start the development server:
   ```bash
   npm start
   ```

## Features

- User authentication (Driver/Passenger)
- Ride booking system with Google Maps integration
- Interactive maps for pickup and dropoff locations
- Real-time route visualization
- Distance-based pricing
- Secure payment processing with Stripe
- Rating system

## Google Maps Integration

The application uses Google Maps for the following features:

- Address autocomplete for pickup and dropoff locations
- Interactive map for selecting locations
- Route visualization between pickup and dropoff points
- Distance calculation for accurate pricing
- Current location detection

To use these features, you need to:

1. Get a Google Maps API key from the [Google Cloud Console](https://console.cloud.google.com/)
2. Enable the following APIs:
   - Maps JavaScript API
   - Places API
   - Directions API
   - Geocoding API
3. Add the API key to your frontend `.env` file

## API Endpoints

### Authentication
- POST `/api/auth/register` - Register new user
- POST `/api/auth/login` - User login

### Rides
- POST `/api/rides` - Create new ride request
- GET `/api/rides` - Get user's rides
- GET `/api/rides/{id}` - Get ride details
- POST `/api/rides/{id}/accept` - Accept a ride (driver only)
- POST `/api/rides/{id}/payment` - Process ride payment

## Security

- JWT-based authentication
- Password encryption
- Secure payment processing
- Input validation

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request 
# SecureBank - Banking Application

A comprehensive banking application built with Spring Boot for managing user accounts, transactions, cards, and financial services. This project demonstrates modern banking system architecture with RESTful APIs and a responsive web interface.

## 🏦 Features

### Core Banking Features
- **User Management**: Registration, login, and profile management
- **Account Management**: Create and manage multiple bank accounts
- **Transaction Processing**: Money transfers, deposits, withdrawals
- **Card Management**: Debit and credit card creation and management
- **Parent-Child Accounts**: Link accounts for family banking
- **Daily Spending Limits**: Set and monitor daily transaction limits

### Transaction Types
- **Money Transfers**: UPI, Credit Card, Debit Card transfers
- **Bill Payments**: Utility and service bill payments
- **Mobile Recharges**: Phone and data recharge services
- **Deposits & Withdrawals**: Account balance management
- **Money Requests**: Request money from linked accounts

### Security Features
- **Account Validation**: Secure account number generation
- **Transaction Limits**: Configurable daily spending limits
- **Card Security**: CVV and expiry date validation
- **UPI Integration**: Secure UPI-based transactions

## 🏗️ Architecture

### Technology Stack
- **Backend**: Spring Boot 3.4.4
- **Database**: H2 (In-Memory) / MySQL
- **Java Version**: 17
- **Frontend**: HTML5, CSS3, JavaScript, Bootstrap 5
- **Build Tool**: Maven

### Project Structure
```
src/main/java/com/example/banking_app/
├── BankingAppApplication.java          # Main application class
├── controller/                         # REST API controllers
│   ├── UserController.java            # User management APIs
│   ├── AccountController.java         # Account management APIs
│   ├── TransactionController.java     # Transaction APIs
│   └── CardController.java            # Card management APIs
├── service/                           # Business logic layer
│   ├── UserService.java              # User business logic
│   ├── AccountService.java           # Account business logic
│   ├── TransactionService.java       # Transaction business logic
│   └── CardService.java              # Card business logic
├── repository/                        # Data access layer
│   ├── UserRepository.java           # User data access
│   ├── AccountRepository.java        # Account data access
│   ├── TransactionRepository.java    # Transaction data access
│   └── CardRepository.java           # Card data access
├── model/                            # Entity classes
│   ├── User.java                     # User entity
│   ├── Account.java                  # Account entity
│   ├── Transaction.java              # Transaction entity
│   └── Card.java                     # Card entity
└── dto/                              # Data Transfer Objects
    ├── UserDTO.java                  # User DTO
    ├── LoginDTO.java                 # Login DTO
    ├── RegisterDTO.java              # Registration DTO
    ├── MoneyTransferDTO.java         # Money transfer DTO
    └── TransactionDTO.java           # Transaction DTO
```

## 🚀 Getting Started

### Prerequisites
- Java 17 or higher
- Maven 3.6 or higher
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd BankingAPI
   ```

2. **Build the project**
   ```bash
   mvn clean install
   ```

3. **Run the application**
   ```bash
   mvn spring-boot:run
   ```

4. **Access the application**
   - Web Interface: http://localhost:5000
   - H2 Database Console: http://localhost:5000/h2-console
   - API Base URL: http://localhost:5000/api

### Database Configuration
The application uses H2 in-memory database by default. To use MySQL:

1. Update `application.properties`:
   ```properties
   spring.datasource.url=jdbc:mysql://localhost:3306/bankingdb
   spring.datasource.username=your_username
   spring.datasource.password=your_password
   spring.jpa.database-platform=org.hibernate.dialect.MySQLDialect
   ```

2. Create MySQL database:
   ```sql
   CREATE DATABASE bankingdb;
   ```

## 📚 API Documentation

### User Management APIs

#### Register User
```http
POST /api/users/register
Content-Type: application/json

{
  "username": "john_doe",
  "password": "password123",
  "email": "john@example.com",
  "fullName": "John Doe",
  "mobile": "1234567890",
  "address": "123 Main St, City"
}
```

#### Login User
```http
POST /api/users/login
Content-Type: application/json

{
  "username": "john_doe",
  "password": "password123"
}
```

#### Get User by ID
```http
GET /api/users/{id}
```

#### Update Password
```http
PUT /api/users/password
Content-Type: application/json

{
  "username": "john_doe",
  "oldPassword": "password123",
  "newPassword": "newpassword123"
}
```

### Account Management APIs

#### Get Account by ID
```http
GET /api/accounts/{id}
```

#### Get Account by Number
```http
GET /api/accounts/number/{accountNumber}
```

#### Get User Accounts
```http
GET /api/accounts/user/{userId}
```

#### Update Account Balance
```http
PUT /api/accounts/{id}/balance
Content-Type: application/json

{
  "balance": 5000.00
}
```

#### Set Daily Limit
```http
PUT /api/accounts/{id}/daily-limit
Content-Type: application/json

{
  "dailyLimit": 1000.00
}
```

#### Create Card
```http
POST /api/accounts/{id}/cards
Content-Type: application/json

{
  "cardType": "DEBIT",
  "cardholderName": "John Doe"
}
```

#### Link Accounts
```http
POST /api/accounts/link
Content-Type: application/json

{
  "parentAccountNumber": "123456789012",
  "childAccountNumber": "987654321098"
}
```

### Transaction APIs

#### Money Transfer
```http
POST /api/transactions/transfer
Content-Type: application/json

{
  "fromAccountId": "account-id",
  "transferType": "UPI",
  "amount": 100.00,
  "note": "Payment for services",
  "toUpiId": "recipient@upi",
  "upiPin": "1234"
}
```

#### Add Money
```http
POST /api/transactions/add-money
Content-Type: application/json

{
  "accountId": "account-id",
  "amount": 500.00,
  "source": "CASH_DEPOSIT",
  "sourceInfo": "Branch deposit"
}
```

#### Request Money
```http
POST /api/transactions/request-money
Content-Type: application/json

{
  "childAccountId": "child-account-id",
  "amount": 50.00,
  "note": "Lunch money"
}
```

#### Get Account Transactions
```http
GET /api/transactions/account/{accountId}
```

#### Get Transactions by Date Range
```http
GET /api/transactions/account/{accountId}/date-range?startDate=2024-01-01T00:00:00&endDate=2024-01-31T23:59:59
```

## 🎨 Frontend Features

### Web Interface
- **Responsive Design**: Mobile-friendly interface using Bootstrap 5
- **User Authentication**: Login and registration forms
- **Dashboard**: Account overview and quick actions
- **Transaction History**: Detailed transaction logs
- **Card Management**: View and manage cards
- **Settings**: Account and security settings

### Pages
- **Home Page**: Landing page with feature overview
- **Login Page**: User authentication
- **Register Page**: New user registration
- **Dashboard**: Main banking interface
- **Transactions**: Transaction history and management
- **Services**: Banking services and utilities
- **Settings**: Account and security settings

## 🔧 Configuration

### Application Properties
```properties
# Server Configuration
server.port=5000
spring.application.name=banking-app

# Database Configuration
spring.datasource.url=jdbc:h2:mem:bankingdb
spring.datasource.driverClassName=org.h2.Driver
spring.datasource.username=sa
spring.datasource.password=

# JPA Configuration
spring.jpa.database-platform=org.hibernate.dialect.H2Dialect
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true

# H2 Console
spring.h2.console.enabled=true

# Logging
logging.level.org.springframework=INFO
logging.level.com.banking.app=DEBUG
```

## 🧪 Testing

### Run Tests
```bash
mvn test
```

### Test Data
The application includes endpoints to create test data:
```http
POST /api/accounts/create-test-accounts
```

## 📊 Database Schema

### User Entity
- `id`: Unique identifier
- `username`: Username for login
- `password`: User password
- `email`: Email address
- `fullName`: Full name
- `mobile`: Mobile number
- `address`: Address
- `accountIds`: List of associated account IDs

### Account Entity
- `id`: Unique identifier
- `accountNumber`: 12-digit account number
- `ifscCode`: IFSC code
- `userId`: Associated user ID
- `balance`: Current balance
- `upiId`: UPI identifier
- `dailyLimit`: Daily spending limit
- `todaySpent`: Amount spent today
- `isParentAccount`: Parent account flag
- `linkedChildAccounts`: List of child account IDs

### Transaction Entity
- `id`: Unique identifier
- `fromAccountId`: Source account ID
- `toAccountId`: Destination account ID
- `amount`: Transaction amount
- `timestamp`: Transaction timestamp
- `type`: Transaction type (TRANSFER, DEPOSIT, etc.)
- `status`: Transaction status (PENDING, COMPLETED, etc.)
- `description`: Transaction description

### Card Entity
- `id`: Unique identifier
- `accountId`: Associated account ID
- `cardNumber`: 16-digit card number
- `cardholderName`: Cardholder name
- `expiryDate`: Card expiry date
- `cvv`: 3-digit CVV
- `type`: Card type (CREDIT/DEBIT)
- `limit`: Card limit
- `isBlocked`: Block status

## 🔒 Security Considerations

### Current Implementation
- Basic password validation
- Account number generation
- Transaction limits
- Card validation

### Recommended Enhancements
- Password hashing (BCrypt)
- JWT token authentication
- Input validation and sanitization
- Rate limiting
- Audit logging
- SSL/TLS encryption

## 🚀 Deployment

### Local Development
```bash
mvn spring-boot:run
```

### Production Build
```bash
mvn clean package
java -jar target/banking-app-0.0.1-SNAPSHOT.jar
```

### Docker Deployment
```dockerfile
FROM openjdk:17-jdk-slim
COPY target/banking-app-0.0.1-SNAPSHOT.jar app.jar
EXPOSE 5000
ENTRYPOINT ["java", "-jar", "/app.jar"]
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## 📝 License

This project is created for educational purposes as a college project.

## 👨‍💻 Author

**Kevin Pereira**
- Student Banking Application Project
- Spring Boot Banking System

## 📞 Support

For support and questions:
- Email: info@securebank.com
- Phone: +1 234-567-8900

---

**Note**: This is a demonstration project for educational purposes. In a production environment, additional security measures, proper authentication, and comprehensive testing would be required.


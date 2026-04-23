# Alicia’s individual iteration 3

## 1. The user stories and features to be implemented

### User Story 1
The user will be able to query more than one LLM at the same time in order to compare and contrast responses. 

Points: 3

### User Story 2
I’ll be able to compare the responses by being able to put them side by side.

Points: 2

### User Story 3
Previous queries will have the ability to be saved in case I want to see them again in the future. 

Points: 2


## 2. UI Design

- Page 1: There’ll be a page that the user puts their query
- Page 2: Multiple LLM outputs will be seen on the results page
- Navigation: After the user submits their query, they’ll be taken to the results page. 


## 3. Unit Tests and Acceptance Tests

- I’ll use cucumber in order to do acceptance tests from the user stories
- Jasmine will be used when doing the unit tests
- I’ll test all features prior to integration


## 4. Software Architecture and Implementation

- The LLM endpoint requests are to be handled by the REST API
- Backend services are where direct requests are to be routed to
- The query history and results are to be stored in the database


## 5. Instructions

### Installation
First I’ll install dependencies and clone the repo

### Execution
Then I’ll run the servers(front end and backend)

### Unit Tests
Jasmine test suites are run

### Puppeteer
Run the browser tests


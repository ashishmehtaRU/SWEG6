@weatherQuery @iteration3
Feature: Answer weather questions

  As an authenticated user
  I want to ask questions about the weather
  So that I can receive weather information for a location

  Background:
    Given I am logged into the application
    And I am on the dashboard page

  Scenario: User asks for weather in a valid city
    When I enter "What is the weather in New York?" into the prompt box
    And I submit the prompt
    Then the system should detect a weather query
    And the system should extract "New York" as the location
    And weather information should be displayed

  Scenario: User asks weather question without a location
    When I enter "What is the weather?" into the prompt box
    And I submit the prompt
    Then I should see a clarification or missing location message

  Scenario: Non-weather prompt is not routed to the weather flow
    When I enter "Explain cloud computing" into the prompt box
    And I submit the prompt
    Then the system should not use the weather-processing flow

  Scenario: Weather API failure is handled gracefully
    Given the weather service is unavailable
    When I enter "What is the weather in Boston?" into the prompt box
    And I submit the prompt
    Then I should see a weather service error message
@multipleResponses @iteration3
Feature: Generate three responses for one question from 3 different LLMs

  As an authenticated user
  I want three responses generated for my question
  So that I can compare them

  Background:
    Given I am logged into the application
    And I am on the dashboard page

  Scenario: User submits a question and receives three responses
    When I enter "What is machine learning?" into the prompt box
    And I submit the prompt
    Then I should see response 1
    And I should see response 2
    And I should see response 3

  Scenario: Three responses are shown separately and clearly
    When I enter "Define recursion" into the prompt box
    And I submit the prompt
    Then each response should be displayed in a separate section

  Scenario: Error appears if responses cannot be generated
    Given response generation fails
    When I enter "Explain gravity" into the prompt box
    And I submit the prompt
    Then I should see a response generation error message
@mathQuery @iteration3
Feature: Solves math questions

  As an authenticated user
  I want to ask math questions
  So that I can receive step-by-step solutions

  Background:
    Given I am logged into the application
    And I am on the dashboard page

  Scenario: User submits a math question and receives a structured solution
    When I enter "Solve 2x + 5 = 15" into the prompt box
    And I submit the prompt
    Then the system should detect a math query
    And a step-by-step math solution should be displayed

  Scenario: User submits an arithmetic question
    When I enter "What is 45 times 12?" into the prompt box
    And I submit the prompt
    Then the system should detect a math query
    And a math response should be displayed

  Scenario: Non-math prompt is not routed to the math flow
    When I enter "Who invented the telephone?" into the prompt box
    And I submit the prompt
    Then the system should not use the math-processing flow

  Scenario: Unsupported math query shows fallback behavior
    Given the submitted math problem is unsupported
    When I enter "Solve this advanced proof" into the prompt box
    And I submit the prompt
    Then I should see a math fallback or error message
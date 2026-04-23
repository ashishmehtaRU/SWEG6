@modelSelector @iteration3
Feature: Model Selector

  As an authenticated user
  I want to select the backend LLM
  So that my prompt is sent to the model I choose

  Background:
    Given I am logged into the application
    And I am on the dashboard page

  Scenario: User sees available model selection options
    Then I should see a model selection control
    And I should see at least one backend model listed

  Scenario: User selects a backend model before sending a prompt
    When I select "GPT" as the backend model
    And I enter "Explain photosynthesis" into the prompt box
    And I submit the prompt
    Then the system should send the request using "GPT"
    And a response should be displayed

  Scenario: Selected model remains visible in the interface
    When I select "Claude" as the backend model
    Then I should see "Claude" shown as the selected model

  Scenario: User gets an error when selected model is unavailable
    Given the model "Gemini" is unavailable
    When I select "Gemini" as the backend model
    And I enter "Hello" into the prompt box
    And I submit the prompt
    Then I should see an error message for model availability
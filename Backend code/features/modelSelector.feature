@modelSelector @iteration3
Feature: Model selector

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
    When I select "openai/gpt-oss-120b" as the backend model
    And I enter "Explain photosynthesis" into the prompt box
    And I submit the prompt
    Then the system should send the request using "openai/gpt-oss-120b"
    And a response should be displayed

  Scenario: Selected model remains visible in the interface
    When I select "llama-3.1-8b-instant" as the backend model
    Then I should see "llama-3.1-8b-instant" shown as the selected model

Scenario: User selects a backend model and sends a prompt in a new conversation
  Given I am logged into the application
  And I am on the dashboard page
  When I click the "New Conversation" button
  And I select "openai/gpt-oss-120b" as the backend model
  And I enter "Explain photosynthesis" into the prompt box
  And I submit the prompt
  Then a new conversation should be created
  And the system should send the request using "openai/gpt-oss-120b"
  And a response should be displayed
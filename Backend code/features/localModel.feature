@localModel @iteration3
Feature: Local model support

  As an authenticated user
  I want to use local models
  So that I can run supported models locally

  Background:
    Given I am logged into the application
    And I am on the dashboard page

  Scenario: User can see local models in the model list
    Then I should see a local model option in the model selection list

  Scenario: User selects a local model and submits a prompt
    When I select "llama3:8b" as the backend model
    And I enter "What is 2+2?" into the prompt box
    And I submit the prompt
    Then the request should be routed to the local model server
    And a response should be displayed

  Scenario: User can switch from cloud model to local model
    Given I selected "gemini-2.5-flash" as the backend model
    When I switch the backend model to "gemma3:4b"
    And I enter "Give me a short summary of gravity" into the prompt box
    And I submit the prompt
    Then the request should use "gemma3:4b"
    And a response should be displayed

  Scenario: User sees an error when the local model cannot run
    Given the local model server is offline
    When I select "qwen3.5:4b" as the backend model
    And I enter "Test prompt" into the prompt box
    And I submit the prompt
    Then I should see a local model error message
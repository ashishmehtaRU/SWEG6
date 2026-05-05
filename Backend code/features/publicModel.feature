@publicModel @iteration3
Feature: Public model support

  As an authenticated user
  I want to access public models
  So that I can use cloud-hosted public models

  Background:
    Given I am logged into the application
    And I am on the dashboard page

  Scenario Outline: User selects a public model and gets a response
    When I select "<model>" as the backend model
    And I enter "Tell me a fun fact" into the prompt box
    And I submit the prompt
    Then the request should be routed to "<model>"
    And a response should be displayed

    Examples:
      | model               |
      | gemini-2.5-flash    |
      | openai/gpt-oss-120b |

  Scenario: API failure is handled gracefully
    Given the public model API is failing
    When I select "gemini-2.5-flash" as the backend model
    And I enter "Hello" into the prompt box
    And I submit the prompt
    Then I should see an API failure message
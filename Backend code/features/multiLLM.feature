@multiLLM
Feature: Multi LLM Responses

  Scenario: User generates 3 responses from one prompt
    Given I open the "dashboard.html" page
    And I create a new conversation
    When I enter "What is 2 + 2? Quick and straight answer please." into the prompt field
    And I click the button with id "submitBtn"
    Then I should see 3 generated response cards

  Scenario: System marks one response as the best response
    Given I open the "dashboard.html" page
    And I create a new conversation
    When I enter "Explain recursion simply. Quick and straight answer please." into the prompt field
    And I click the button with id "submitBtn"
    Then I should see one best response label

  Scenario: User regenerates responses
    Given I open the "dashboard.html" page
    And I create a new conversation
    When I enter "Describe cloud computing. Quick and straight answer please." into the prompt field
    And I click the button with id "submitBtn"
    And I click the button with id "regenerateBtn"
    Then I should see 3 generated response cards

  Scenario: User cannot generate responses with a blank prompt
    Given I open the "dashboard.html" page
    And I create a new conversation
    When I click the button with id "submitBtn"
    Then I should see an alert
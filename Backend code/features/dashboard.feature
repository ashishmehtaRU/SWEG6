@dashboard
Feature: Dashboard Page

  Scenario: Dashboard loads and shows main elements
    Given I open the "dashboard.html" page
    Then I should see the text "LLM Dashboard"
    And I should see an element with id "promptInput"
    And I should see an element with id "responseOutput"
 

  Scenario: User can type into prompt box
    Given I open the "dashboard.html" page
    When I enter "Hello AI" into the prompt field
    Then I should see the value "Hello AI" in the element with id "promptInput"
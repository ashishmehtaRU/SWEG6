@dashboard
Feature: Dashboard Page

  Scenario: Dashboard loads and shows main elements
    Given I open the "dashboard.html" page
    Then I should see the text "LLM Dashboard"
    And I should see an element with id "promptInput"
    And I should see an element with id "conversationHistory"
 
  # new
  Scenario: Immediate user prompt shows before assistant streaming response
    Given I open the "dashboard.html" page
    And I prepare the page for a stubbed conversation
    When I set the prompt counter for normal assistant flow
    And I enter "Test prompt" into the prompt field
    And I submit the prompt
    Then I should see "Test prompt" in the chat history
    And I should see a typing indicator in the chat history
 
  Scenario: User can type into prompt box
    Given I open the "dashboard.html" page
    When I enter "Hello AI" into the prompt field
    Then I should see the value "Hello AI" in the element with id "promptInput"
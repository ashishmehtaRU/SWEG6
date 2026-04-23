@dashboard
Feature: Dashboard Page

  Scenario: Dashboard loads and shows main elements
    Given I open the "dashboard.html" page
    Then I should see the text "LLM Dashboard"
    And I should see an element with id "promptInput"
    And I should see an element with id "conversationHistory"
 
  # new

Scenario: Third prompt shows choice between multiple LLMs
  Given I open the "dashboard.html" page
  And I prepare the page for a stubbed multi-LLM comparison conversation
  When I enter "What is AI?" into the prompt field
  And I submit the prompt
  Then I should see the text "llama3:8b"
  And I should see the text "gemma3:4b"

  Scenario: Immediate user prompt shows before assistant streaming response
    Given I open the "dashboard.html" page
    And I prepare the page for a stubbed conversation
    When I set the prompt counter for normal assistant flow
    And I enter "Test prompt" into the prompt field
    And I submit the prompt
    
 
  Scenario: User can type into prompt box
    Given I open the "dashboard.html" page
    When I enter "Hello AI" into the prompt field
    Then I should see the value "Hello AI" in the element with id "promptInput"
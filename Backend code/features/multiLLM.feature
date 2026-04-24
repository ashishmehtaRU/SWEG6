@multipleResponses @iteration3
Feature: Generate multiple LLM responses for one prompt

  As a user
  I want to send one prompt to multiple LLMs
  So that I can compare the responses side by side

  Scenario: User opens the multi-LLM comparison page
    Given I open the "multi.html" page
    Then I should see the text "Multi-LLM Response Comparison"
    And I should see an element with id "multiPrompt"
    And I should see an element with id "compareBtn"

  Scenario: User submits one prompt to multiple selected models
    Given I open the "multi.html" page
    When I enter "What is machine learning?" into the multi prompt field
    And I click the compare models button
    Then I should see at least two model response cards

  Scenario: User cannot submit an empty multi-LLM prompt
    Given I open the "multi.html" page
    When I click the compare models button
    Then I should remain on the multi-LLM page
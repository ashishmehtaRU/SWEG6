@multipleResponses @Brian
Feature: Compare multiple LLM responses

  As a user
  I want to submit one question and receive three responses
  So that I can compare different answer styles

  Scenario: User opens the compare page
    Given I open the "compare.html" page
    Then I should see the text "Compare Multiple LLMs"
    And I should see an element with id "prompt"

  Scenario: User submits a question and receives three responses
    Given I open the "compare.html" page
    When I enter "What is machine learning?" into the compare prompt box
    And I click the compare generate button
    Then I should see the text "Detailed answer: What is machine learning?"
    And I should see the text "Simple answer: What is machine learning?"
    And I should see the text "Alternative perspective: What is machine learning?"
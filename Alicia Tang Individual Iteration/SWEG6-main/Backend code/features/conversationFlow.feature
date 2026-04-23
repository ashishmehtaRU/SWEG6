@conversationFlow @iteration3
Feature: Follow-up question or new conversation

  As an authenticated user
  I want to ask a follow-up question or start a new one
  So that I can either continue context or begin fresh

  Background:
    Given I am logged into the application
    And I am on the dashboard page

  Scenario: User asks a follow-up question in the same conversation
    Given I already asked "What is Python?"
    And I received a response
    When I enter "What is it mainly used for?" into the prompt box
    And I submit the prompt
    Then the prompt should stay in the current conversation
    And the previous messages should still be visible

  Scenario: User starts a brand-new conversation
    Given I already have an existing conversation open
    When I click the "New Conversation" button
    And I enter "What is Java?" into the prompt box
    And I submit the prompt
    Then a new conversation should be created
    And the old conversation context should not be reused

  Scenario: New conversation appears in the conversation list
    When I click the "New Conversation" button
    Then I should see a new conversation entry in the sidebar
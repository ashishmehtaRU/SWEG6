@home @smoke
Feature: Home Page

  Scenario: Home page shows title
    Given I open the "index.html" page
    Then I should see the text "LLM Inference Platform"

  @navigation
  Scenario: Home page has login and signup buttons
    Given I open the "index.html" page
    Then I should see a link to "login.html"
    And I should see a link to "signup.html"
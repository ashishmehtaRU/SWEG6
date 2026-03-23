@signup @smoke
Feature: Signup Page

  Scenario: User opens the signup page
    Given I open the "signup.html" page
    Then I should see the text "Create Account"
    And I should see the text "Join our platform today"

  @acceptance
  Scenario: User can enter signup information
    Given I open the "signup.html" page
    When I enter "newuser" into the username field
    And I enter "newuser@example.com" into the email field
    And I enter "123456" into the password field
    Then I should see the value "newuser" in the element with id "username"
    And I should see the value "newuser@example.com" in the element with id "email"
    And I should see the value "123456" in the element with id "password"

  @acceptance
  Scenario: User sees validation feedback for a short username
    Given I open the "signup.html" page
    When I enter "ab" into the username field
    And I enter "test@example.com" into the email field
    And I enter "123456" into the password field
    And I click the signup button
    Then I should see the error message "Username must be at least 3 characters"
@login @smoke
Feature: Login Page

  Scenario: User opens the login page
    Given I open the "login.html" page
    Then I should see the text "Welcome Back"
    And I should see the text "Log in to your account"

  @acceptance
  Scenario: User can enter login information
    Given I open the "login.html" page
    When I enter "test@example.com" into the email field
    And I enter "mypassword123" into the password field
    Then I should see the value "test@example.com" in the element with id "email"
    And I should see the value "mypassword123" in the element with id "password"
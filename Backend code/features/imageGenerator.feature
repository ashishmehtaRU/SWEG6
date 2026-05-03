@imageGenerator @iteration3
Feature: Image generator

  As an authenticated user
  I want to enter an image prompt
  So that I can receive generated visual output

  Background:
    Given I am logged into the application
    And I am on the dashboard page
    And I open the Images tab

  Scenario: User submits an image prompt and receives generated output
    When I enter "Generate an astronaut riding a horse" into the image prompt box
    And I submit the image prompt
    Then a generated image should be displayed

  Scenario: User submits an empty image prompt
    When I submit the image prompt without entering text
    Then I should see an image prompt validation message

  Scenario: Image generation service fails
    Given the image generation service is unavailable
    When I enter "Generate a sunset over mountains" into the image prompt box
    And I submit the image prompt
    Then I should see an image generation error message
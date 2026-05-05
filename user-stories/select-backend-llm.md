# User Story

Once I become an authenticated user, I choose the backend LLM so I can pick the specific model that I intend to use in order to generate responses.

# Description

The model selection feature will let users decide what model they want to use prior to entering a prompt. The user interface should be a clear selection feature such as a dropdown or list that has the name of the models to show what model is being used. It should show the model selected until the user changes it or finishes their session.

# Acceptance Criteria

- Model selection is available to the user (e.g., dropdown menu)
- It shows what models the backend LLM has (such as Claude, Gemini, GPT)
- Prior to submitting the prompt, the user can choose which model they want to use
- The selected model is displayed in the user interface
- The system identifies which backend LLM is selected and sends the request accordingly
- Once responses are shown, it identifies which model was used
- An error occurs if the model is not available or cannot be used
- The selected model remains the same unless the user changes it
- A new conversation is not required when switching models

# Tasks

- Implement backend support for routing requests to different LLM providers
- Define available models and configuration files
- Add model selection UI component
- Store selected model in session and frontend state
- Modify API to include selected model parameter
- Handle model-related errors
- Route prompts to the selected model

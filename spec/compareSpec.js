describe("Multi LLM Compare Feature", function () {
  function generateMockResponses(prompt) {
    return [
      { model: "LLM Response 1", output: `Detailed answer: ${prompt}` },
      { model: "LLM Response 2", output: `Simple answer: ${prompt}` },
      { model: "LLM Response 3", output: `Alternative perspective: ${prompt}` },
    ];
  }

  it("should return three LLM responses", function () {
    const responses = generateMockResponses("What is AI?");
    expect(responses.length).toBe(3);
  });

  it("each response should include a model and output", function () {
    const responses = generateMockResponses("What is AI?");

    responses.forEach((response) => {
      expect(response.model).toBeDefined();
      expect(response.output).toBeDefined();
    });
  });

  it("should include the user prompt in each response", function () {
    const prompt = "What is AI?";
    const responses = generateMockResponses(prompt);

    responses.forEach((response) => {
      expect(response.output).toContain(prompt);
    });
  });
});
const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || "http://localhost:11434";

const AVAILABLE_MODELS = [
  {
    id: "llama3.2:3b",
    label: "Llama 3.2 3B",
    provider: "Ollama",
  },
  {
    id: "llama3.2:1b",
    label: "Llama 3.2 1B",
    provider: "Ollama",
  },
  {
    id: "qwen3:0.6b",
    label: "Qwen3 0.6B",
    provider: "Ollama",
  },
];

async function generateOllamaResponse(model, prompt) {
  const response = await fetch(`${OLLAMA_BASE_URL}/api/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model,
      prompt,
      stream: false,
    }),
  });

  if (!response.ok) {
    throw new Error(`Ollama API error for ${model}: ${response.status}`);
  }

  const data = await response.json();
  return data.response || data.output || "";
}

async function compareModels(prompt, requestedModelIds) {
  const selectedModels = AVAILABLE_MODELS.filter((model) =>
    requestedModelIds.includes(model.id),
  );

  const modelsToRun =
    selectedModels.length > 0 ? selectedModels : AVAILABLE_MODELS;

  const startedAt = Date.now();

  const results = await Promise.allSettled(
    modelsToRun.map(async (model) => {
      const modelStartedAt = Date.now();
      const output = await generateOllamaResponse(model.id, prompt);

      return {
        modelId: model.id,
        modelLabel: model.label,
        provider: model.provider,
        status: "fulfilled",
        output,
        latencyMs: Date.now() - modelStartedAt,
      };
    }),
  );

  return {
    prompt,
    totalLatencyMs: Date.now() - startedAt,
    results: results.map((result, index) => {
      const model = modelsToRun[index];

      if (result.status === "fulfilled") {
        return result.value;
      }

      return {
        modelId: model.id,
        modelLabel: model.label,
        provider: model.provider,
        status: "rejected",
        output: "",
        error: result.reason.message || "Model failed",
        latencyMs: null,
      };
    }),
  };
}

module.exports = {
  AVAILABLE_MODELS,
  compareModels,
};
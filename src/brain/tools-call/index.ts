export const TOOLS_DEFINITION = [
  {
    name: "web_search",
    description: "Search the web for information using multiple queries.",
    parameters: {
      type: "object",
      properties: {
        queries: {
          type: "array",
          items: { type: "string" },
          description: "List of search queries to execute."
        }
      },
      required: ["queries"]
    }
  },
  {
    name: "screenshot_dispatcher",
    description: "Capture screenshots of specific URLs for visual evidence.",
    parameters: {
      type: "object",
      properties: {
        urls: {
          type: "array",
          items: { type: "string" },
          description: "List of URLs to screenshot."
        }
      },
      required: ["urls"]
    }
  },
  {
    name: "script_writer",
    description: "Generate a structured video script based on gathered sources.",
    parameters: {
      type: "object",
      properties: {
        prompt: { type: "string", description: "The original user prompt." },
        sources: {
          type: "array",
          items: {
            type: "object",
            properties: {
              id: { type: "string" },
              title: { type: "string" },
              url: { type: "string" },
              summary: { type: "string" }
            }
          }
        }
      },
      required: ["prompt", "sources"]
    }
  },
  {
    name: "source_ranker",
    description: "Rank candidate search results to find the most relevant sources.",
    parameters: {
      type: "object",
      properties: {
        prompt: { type: "string" },
        candidates: {
          type: "array",
          items: {
            type: "object",
            properties: {
              title: { type: "string" },
              url: { type: "string" },
              snippet: { type: "string" }
            }
          }
        }
      },
      required: ["prompt", "candidates"]
    }
  },
  // Command-based tools (formerly slash commands)
  {
    name: "cron_list",
    description: "List all active scheduled research jobs.",
    parameters: { type: "object", properties: {} }
  },
  {
    name: "cron_run",
    description: "Trigger a specific cron job to run immediately.",
    parameters: {
      type: "object",
      properties: { jobId: { type: "string" } },
      required: ["jobId"]
    }
  },
  {
    name: "workspace_search",
    description: "Search across all research collections in the workspace.",
    parameters: {
      type: "object",
      properties: { query: { type: "string" } },
      required: ["query"]
    }
  },
  {
    name: "workspace_stats",
    description: "View workspace analytics and usage statistics.",
    parameters: { type: "object", properties: {} }
  },
  {
    name: "job_status",
    description: "Get the current status of a specific running job.",
    parameters: {
      type: "object",
      properties: { jobId: { type: "string" } },
      required: ["jobId"]
    }
  },
  {
    name: "gdrive_backup",
    description: "Upload a backup of the current workspace to Google Drive.",
    parameters: { type: "object", properties: {} }
  }
];

export const TOOL_EXECUTION_RULES = `TOOL EXECUTION RULES:
1. STRICT SEQUENTIALITY: You MUST NOT initiate more than one tool call at a time.
2. STATE VERIFICATION: You must verify the outcome of the previous tool call before proceeding.
3. OUTPUT HANDLING: Process the JSON output of tools immediately. If a tool returns an error, apply SAGR Repaciration logic.
4. PARALLELISM FORBIDDEN: Even if the model supports parallel tool calling, you are restricted to sequential calls for stability.`;

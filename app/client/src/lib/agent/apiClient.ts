import type { AgentMessage, AgentTool, AgentResponse } from "../studySession.types";
import { getAgentEndpoint, getAgentModel } from "../studySession.config";

export async function callAgentWithTools(
  messages: AgentMessage[],
  tools: AgentTool[],
  apiKey: string
): Promise<AgentResponse> {
  const response = await fetch(getAgentEndpoint(), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: getAgentModel(),
      messages,
      tools,
      tool_choice: "auto",
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Agent API error: ${response.status} - ${errorText}`);
  }

  return response.json();
}

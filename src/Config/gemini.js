import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({
 apiKey: "REDACTED",
});

const tools = [
  {
    type: 'google_search',
  },
];

const generationConfig = {
  temperature: 1,
  max_output_tokens: 65536,
  topP: 0.95,
  thinkingLevel: 'high',
};

const runChat = async (prompt) => {
  const interaction = await ai.interactions.create({
    model: 'gemini-3-flash-preview',
    input: prompt,
    tools: tools,
    generation_config: generationConfig,
  });

  console.log(interaction.output_text);

  return interaction.output_text;
};

export default runChat;
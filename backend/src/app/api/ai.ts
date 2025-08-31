import { env } from "cloudflare:workers";

import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
	apiKey: env.CLAUDE_API_KEY,
});

export default async function aiPrompt(
	userPrompt: string,
	props?: {
		systemPrompt?: string;
	}
) {
	const message = await anthropic.messages.create({
		model: "claude-3-5-sonnet-20241022",
		max_tokens: 4000,
		temperature: 0.1,
		system: props?.systemPrompt,
		messages: [
			{
				role: "user",
				content: userPrompt,
			},
		],
	});

	const response = message.content[0];
	if (response.type !== "text")
		throw new Error("Unexpected response type from Claude");

	const responseText = response.text.trim();
	const nothingFound = ["I apologize", "I'm not able", "cannot verify"].some(
		(check) => responseText.includes(check)
	);

	return {
		success: true,
		message: nothingFound ? null : responseText,
	};
}

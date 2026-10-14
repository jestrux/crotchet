import { env } from "cloudflare:workers";

import Anthropic from "@anthropic-ai/sdk";

export type AIEffort = NonNullable<Anthropic.Beta.BetaOutputConfig["effort"]>;

const EFFORTS: readonly AIEffort[] = ["low", "medium", "high", "xhigh", "max"];

const anthropic = new Anthropic({
	apiKey: env.CLAUDE_API_KEY,
});

// Appended to every system prompt so callers get the same guard against made-up facts
const ACCURACY_RULES = `Only state facts you are confident are true and well documented. Never invent or embellish details such as places, dates, people or backstories. If you are not sure about something, leave it out; if nothing is left that you are sure of, reply exactly: "Couldn't find information on that one."`;

export default async function aiPrompt(
	userPrompt: string,
	props?: {
		systemPrompt?: string;
		effort?: AIEffort;
	}
) {
	try {
		const message = await anthropic.beta.messages.create({
			model: "claude-sonnet-5-5",
			max_tokens: 4000,
			// Short factual answers don't need deep thinking, so default to low
			output_config: {
				effort: EFFORTS.includes(props?.effort as AIEffort)
					? (props?.effort as AIEffort)
					: "low",
			},
			// If a request gets refused, retry it on another model instead of failing
			betas: ["server-side-fallback-2026-07-01"],
			fallbacks: "default",
			system: [props?.systemPrompt, ACCURACY_RULES].filter(Boolean).join("\n\n"),
			messages: [
				{
					role: "user",
					content: userPrompt,
				},
			],
		});
	
		// Newer models can return thinking blocks before the text block
		const response = message.content.find((block) => block.type === "text");
		if (!response) throw new Error("Unexpected response type from Claude");
	
		const responseText = response.text.trim();
		const nothingFound = [
			"I apologize",
			"I'm not able",
			"I'm not aware",
			"I don't have",
			"cannot verify",
			"not familiar",
			"enough information",
			"couldn't find information",
			"don't know",
		].some((check) => responseText.toLowerCase().includes(check.toLowerCase()));
	
		return {
			success: true,
			message: nothingFound ? null : responseText,
		};
	} catch (error) {
		console.log("Anth Error: ", error);
		return { success: false, message: null };
	}
}

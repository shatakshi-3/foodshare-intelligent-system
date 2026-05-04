const { GoogleGenerativeAI } = require("@google/generative-ai");

let genAI = null;
let model = null;

function initializeClient() {
	if (!genAI && process.env.GEMINI_API_KEY) {
		genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
		model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
	}
	return model;
}

// Build a structured prompt for match analysis
function buildPrompt(donation, matches) {
	const topMatches = matches.slice(0, 5);

	const donationBlock = `
DONATION DETAILS:
- Food Type: ${donation.foodType}
- Quantity: ${donation.quantity}
- Pickup Address: ${donation.address}
- Status: ${donation.status}
- Cooking Time: ${donation.cookingTime}
`.trim();

	const matchBlocks = topMatches.map((m, i) => `
MATCH #${i + 1} (Deterministic Score: ${m.totalScore}/100)
- Recipient: ${m.demand.recipient?.name || "Unknown"}
- Recipient Type: ${m.demand.recipient?.type || "Unknown"}
- Food Requested: ${m.demand.foodType}
- Quantity Needed: ${m.demand.quantityNeeded} (Fulfilled so far: ${m.demand.quantityFulfilled})
- Urgency: ${m.demand.urgency}
- Delivery Location: ${m.demand.location}
- Notes: ${m.demand.notes || "None"}
- Score Breakdown:
  Food Type: ${m.breakdown.foodType.score}/100 (${m.breakdown.foodType.reason})
  Quantity: ${m.breakdown.quantity.score}/100 (${m.breakdown.quantity.reason})
  Urgency: ${m.breakdown.urgency.score}/100 (${m.breakdown.urgency.reason})
  Location: ${m.breakdown.location.score}/100 (${m.breakdown.location.reason})
`.trim()).join("\n\n");

	return `You are an expert food donation logistics coordinator. Analyze the following donation and its top matched demands.

${donationBlock}

TOP MATCHED DEMANDS:
${matchBlocks}

Provide your analysis in the following JSON format ONLY (no markdown, no code fences, just raw JSON):
{
  "recommendation": "Your top recommendation — which demand should receive this donation and why (2-3 sentences)",
  "analysis": [
    {
      "matchIndex": 1,
      "recipientName": "Name",
      "verdict": "strongly_recommended | recommended | acceptable | not_recommended",
      "reasoning": "2-3 sentence explanation covering food compatibility, logistics, urgency, and any concerns",
      "concerns": ["List any potential issues"],
      "suggestedAction": "What the admin should do for this match"
    }
  ],
  "fulfillmentStrategy": "If the donation can serve multiple demands, explain how to split it (1-2 sentences). If not applicable, say so.",
  "freshnessConcern": "Based on the cooking time, note any freshness/timing concerns (1 sentence)"
}`;
}

// Parse the LLM response — handles various response formats
function parseResponse(text) {
	try {
		// Strip markdown code fences if present
		let cleaned = text.trim();
		if (cleaned.startsWith("```")) {
			cleaned = cleaned.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "");
		}
		return JSON.parse(cleaned);
	} catch (err) {
		console.log("LLM response parse error:", err.message);
		return {
			recommendation: "Unable to parse LLM response. Please review the deterministic matches.",
			analysis: [],
			fulfillmentStrategy: "N/A",
			freshnessConcern: "N/A",
			rawResponse: text
		};
	}
}

const llmService = {
	isAvailable() {
		return !!process.env.GEMINI_API_KEY;
	},

	async analyzeMatches(donation, deterministicResults) {
		const client = initializeClient();
		if (!client) {
			throw new Error("Gemini API key not configured. Add GEMINI_API_KEY to your .env file.");
		}

		if (deterministicResults.matches.length === 0) {
			return {
				recommendation: "No open demands to analyze.",
				analysis: [],
				fulfillmentStrategy: "N/A",
				freshnessConcern: "N/A"
			};
		}

		const prompt = buildPrompt(donation, deterministicResults.matches);

		try {
			const result = await client.generateContent(prompt);
			const response = result.response;
			const text = response.text();
			return parseResponse(text);
		} catch (err) {
			console.error("Gemini API error:", err.message);
			throw new Error(`LLM analysis failed: ${err.message}`);
		}
	}
};

module.exports = llmService;

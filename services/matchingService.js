const Demand = require("../models/demand.js");
const logger = require("../utils/logger.js");

// Scoring weights — must sum to 1.0
const WEIGHTS = {
	foodType: 0.30,
	quantity: 0.20,
	urgency: 0.30,
	location: 0.20
};

// Normalize a string for comparison: lowercase, trim, collapse whitespace
function normalize(str) {
	return (str || "").toLowerCase().trim().replace(/\s+/g, " ");
}

// Extract meaningful tokens from a string (removes common stop words)
function tokenize(str) {
	const stopWords = new Set(["the", "a", "an", "and", "or", "of", "in", "at", "to", "for", "on", "with", "is", "near", "no"]);
	return normalize(str)
		.replace(/[^a-z0-9\s]/g, " ")
		.split(/\s+/)
		.filter(t => t.length > 1 && !stopWords.has(t));
}

// Score food type match (0-100)
function scoreFoodType(donationFoodType, demandFoodType) {
	const donorTokens = tokenize(donationFoodType);
	const demandTokens = tokenize(demandFoodType);

	if (donorTokens.length === 0 || demandTokens.length === 0) {
		return { score: 10, reason: "Insufficient food type data for comparison" };
	}

	const donorNorm = normalize(donationFoodType);
	const demandNorm = normalize(demandFoodType);

	// Exact match
	if (donorNorm === demandNorm) {
		return { score: 100, reason: `Exact match: "${donationFoodType}"` };
	}

	// Token overlap
	const matchedTokens = donorTokens.filter(t => demandTokens.includes(t));
	const overlapRatio = matchedTokens.length / Math.max(donorTokens.length, demandTokens.length);

	if (overlapRatio >= 0.8) {
		return { score: 90, reason: `Strong match on keywords: ${matchedTokens.join(", ")}` };
	}
	if (overlapRatio >= 0.5) {
		return { score: 70, reason: `Partial match on keywords: ${matchedTokens.join(", ")}` };
	}
	if (matchedTokens.length > 0) {
		return { score: 45, reason: `Weak overlap on: ${matchedTokens.join(", ")}` };
	}

	// Check substring containment
	if (donorNorm.includes(demandNorm) || demandNorm.includes(donorNorm)) {
		return { score: 60, reason: `Substring match between "${donationFoodType}" and "${demandFoodType}"` };
	}

	return { score: 5, reason: `No food type match: donor offers "${donationFoodType}", demand needs "${demandFoodType}"` };
}

// Score quantity compatibility (0-100)
function scoreQuantity(donationQty, demandQtyNeeded, demandQtyFulfilled) {
	const remaining = demandQtyNeeded - demandQtyFulfilled;

	if (remaining <= 0) {
		return { score: 0, reason: "Demand already fully fulfilled" };
	}

	const ratio = donationQty / remaining;

	if (ratio >= 0.9 && ratio <= 1.1) {
		return { score: 100, reason: `Near-perfect fit: donation ${donationQty} ≈ remaining need ${remaining}` };
	}
	if (ratio >= 0.5 && ratio < 0.9) {
		const pct = Math.round(ratio * 100);
		return { score: 75, reason: `Covers ${pct}% of remaining need (${donationQty} of ${remaining})` };
	}
	if (ratio >= 0.25 && ratio < 0.5) {
		const pct = Math.round(ratio * 100);
		return { score: 50, reason: `Partial coverage: ${pct}% of remaining need (${donationQty} of ${remaining})` };
	}
	if (ratio > 1.1 && ratio <= 2.0) {
		return { score: 70, reason: `Donation ${donationQty} exceeds remaining need ${remaining} — moderate surplus` };
	}
	if (ratio > 2.0) {
		return { score: 40, reason: `Donation ${donationQty} is much larger than remaining need ${remaining} — significant surplus` };
	}

	// ratio < 0.25
	const pct = Math.round(ratio * 100);
	return { score: 25, reason: `Covers only ${pct}% of remaining need (${donationQty} of ${remaining})` };
}

// Score urgency (0-100)
function scoreUrgency(urgency) {
	switch (urgency) {
		case "high":
			return { score: 100, reason: "High urgency — prioritized" };
		case "medium":
			return { score: 60, reason: "Medium urgency" };
		case "low":
			return { score: 30, reason: "Low urgency" };
		default:
			return { score: 10, reason: "Unknown urgency level" };
	}
}

// Score location proximity via token overlap (0-100)
function scoreLocation(donationAddress, demandLocation) {
	const donorTokens = tokenize(donationAddress);
	const demandTokens = tokenize(demandLocation);

	if (donorTokens.length === 0 || demandTokens.length === 0) {
		return { score: 10, reason: "Insufficient location data for comparison" };
	}

	const donorNorm = normalize(donationAddress);
	const demandNorm = normalize(demandLocation);

	// Exact match
	if (donorNorm === demandNorm) {
		return { score: 100, reason: "Exact location match" };
	}

	// Token overlap
	const matchedTokens = donorTokens.filter(t => demandTokens.includes(t));
	const overlapRatio = matchedTokens.length / Math.max(donorTokens.length, demandTokens.length);

	if (overlapRatio >= 0.7) {
		return { score: 85, reason: `Strong location overlap: ${matchedTokens.join(", ")}` };
	}
	if (overlapRatio >= 0.4) {
		return { score: 60, reason: `Partial location overlap: ${matchedTokens.join(", ")}` };
	}
	if (matchedTokens.length > 0) {
		return { score: 35, reason: `Weak location overlap: ${matchedTokens.join(", ")}` };
	}

	return { score: 5, reason: `No location overlap between "${donationAddress}" and "${demandLocation}"` };
}

// Compute a single match result between a donation and a demand
function computeMatch(donation, demand) {
	const foodTypeResult = scoreFoodType(donation.foodType, demand.foodType);
	const quantityResult = scoreQuantity(donation.quantity, demand.quantityNeeded, demand.quantityFulfilled);
	const urgencyResult = scoreUrgency(demand.urgency);
	const locationResult = scoreLocation(donation.address, demand.location);

	const totalScore = Math.round(
		foodTypeResult.score * WEIGHTS.foodType +
		quantityResult.score * WEIGHTS.quantity +
		urgencyResult.score * WEIGHTS.urgency +
		locationResult.score * WEIGHTS.location
	);

	return {
		demand: demand,
		totalScore,
		breakdown: {
			foodType: { score: foodTypeResult.score, weight: WEIGHTS.foodType, weighted: Math.round(foodTypeResult.score * WEIGHTS.foodType), reason: foodTypeResult.reason },
			quantity: { score: quantityResult.score, weight: WEIGHTS.quantity, weighted: Math.round(quantityResult.score * WEIGHTS.quantity), reason: quantityResult.reason },
			urgency: { score: urgencyResult.score, weight: WEIGHTS.urgency, weighted: Math.round(urgencyResult.score * WEIGHTS.urgency), reason: urgencyResult.reason },
			location: { score: locationResult.score, weight: WEIGHTS.location, weighted: Math.round(locationResult.score * WEIGHTS.location), reason: locationResult.reason }
		},
		summary: generateSummary(totalScore, foodTypeResult, quantityResult, urgencyResult, locationResult, donation, demand)
	};
}

// Generate a human-readable summary for the match
function generateSummary(totalScore, foodType, quantity, urgency, location, donation, demand) {
	const recipientName = demand.recipient?.name || "Unknown recipient";
	const parts = [];

	if (foodType.score >= 70) parts.push(`food type aligns well ("${donation.foodType}")`);
	else if (foodType.score >= 40) parts.push(`partial food type overlap`);
	else parts.push(`food type mismatch`);

	if (quantity.score >= 70) parts.push(`quantity is a good fit`);
	else if (quantity.score >= 40) parts.push(`quantity partially covers the need`);
	else parts.push(`quantity coverage is limited`);

	if (urgency.score >= 80) parts.push(`high urgency prioritizes this demand`);
	else if (urgency.score >= 50) parts.push(`medium urgency`);

	if (location.score >= 60) parts.push(`locations are in proximity`);
	else if (location.score >= 30) parts.push(`some location overlap`);

	return `Match score ${totalScore}/100 for ${recipientName}: ${parts.join("; ")}.`;
}

const matchingService = {
	// Find and rank all matching demands for a given donation
	async findMatches(donation) {
		const demands = await Demand.find({
			status: { $in: ["open", "partially_fulfilled"] }
		}).populate("recipient");

		const matches = demands
			.map(demand => computeMatch(donation, demand))
			.filter(match => match.totalScore > 0)
			.sort((a, b) => b.totalScore - a.totalScore);

		const result = {
			donation: {
				id: donation._id,
				foodType: donation.foodType,
				quantity: donation.quantity,
				address: donation.address,
				status: donation.status
			},
			matchCount: matches.length,
			matches,
			weights: WEIGHTS,
			generatedAt: new Date().toISOString()
		};
		
		logger.info(`Generated ${matches.length} matches for donation ${donation._id}`, { action: "match_generated", targetId: donation._id, matchCount: matches.length });
		
		return result;
	},

	// Exposed for testing — individual scoring functions
	scoreFoodType,
	scoreQuantity,
	scoreUrgency,
	scoreLocation,
	computeMatch
};

module.exports = matchingService;

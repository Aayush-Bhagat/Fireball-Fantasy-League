export function calculateEra(
	runsAllowed: number | null,
	outsPitched: number | null,
): number {
	if (runsAllowed === null || outsPitched === null) {
		return 0;
	}

	const inningsPitched = outsPitched / 3;

	const era = (runsAllowed / inningsPitched) * 9;

	if (isNaN(era) || !isFinite(era)) {
		return 0;
	}

	return parseFloat(era.toFixed(2));
}

export function convertStringToNumber(
	value: string | null | undefined,
): number | null {
	if (value === null || value === undefined) {
		return null;
	}

	const numberValue = Number(value);
	return numberValue;
}

export function calculateInningsPitched(outsPitched: number | null): number {
	if (outsPitched === null) {
		return 0;
	}

	const inningsPitched = Math.floor(outsPitched / 3);
	const outs = outsPitched % 3;

	return Number(`${inningsPitched}.${outs}`);
}

export function calculateOBP(
	hits: number | null,
	walks: number | null,
	hitByPitch: number | null,
	atBats: number | null,
	sacrificeFlies: number | null,
): number | null {
	if (
		hits === null ||
		walks === null ||
		hitByPitch === null ||
		atBats === null ||
		sacrificeFlies === null
	) {
		return null;
	}

	const plateAppearances = atBats + walks + hitByPitch + sacrificeFlies;
	if (plateAppearances === 0) {
		return null;
	}

	const obp = (hits + walks + hitByPitch) / plateAppearances;
	return parseFloat(obp.toFixed(3));
}

export function calculateSLG(
	hits: number | null,
	singles: number | null,
	doubles: number | null,
	triples: number | null,
	homeRuns: number | null,
	atBats: number | null,
): number | null {
	if (
		hits === null ||
		singles === null ||
		doubles === null ||
		triples === null ||
		homeRuns === null ||
		atBats === null
	) {
		return null;
	}

	const totalBases = singles + 2 * doubles + 3 * triples + 4 * homeRuns;

	if (atBats === 0) {
		return null;
	}

	const slg = totalBases / atBats;
	return parseFloat(slg.toFixed(3));
}

export function calculateOPS(
	obp: number | null,
	slg: number | null,
): number | null {
	if (obp === null || slg === null) {
		return null;
	}

	const ops = obp + slg;
	return parseFloat(ops.toFixed(3));
}

export function calculateWHIP(
	walks: number | null,
	hitsAllowed: number | null,
	outsPitched: number | null,
): number | null {
	if (
		walks === null ||
		hitsAllowed === null ||
		outsPitched === null ||
		outsPitched === 0
	) {
		return null;
	}

	const inningsPitched = outsPitched / 3;
	const whip = (walks + hitsAllowed) / inningsPitched;

	return parseFloat(whip.toFixed(3));
}

export function calculateBAA(
	hitsAllowed: number | null,
	atBatsAgainst: number | null,
): number | null {
	if (hitsAllowed === null || atBatsAgainst === null || atBatsAgainst === 0) {
		return null;
	}

	const baa = hitsAllowed / atBatsAgainst;
	return parseFloat(baa.toFixed(3));
}

export function calculateOBPAgainst(
	hitsAllowed: number | null,
	walksAllowed: number | null,
	atBatsAgainst: number | null,
): number | null {
	if (
		hitsAllowed === null ||
		walksAllowed === null ||
		atBatsAgainst === null
	) {
		return null;
	}

	const plateAppearancesAgainst = atBatsAgainst + walksAllowed;

	if (plateAppearancesAgainst === 0) {
		return null;
	}

	const obpAgainst = (hitsAllowed + walksAllowed) / plateAppearancesAgainst;

	return parseFloat(obpAgainst.toFixed(3));
}

export function calculateSLGAgainst(
	hitsAllowed: number | null,
	singlesAllowed: number | null,
	doublesAllowed: number | null,
	triplesAllowed: number | null,
	homeRunsAllowed: number | null,
	atBatsAgainst: number | null,
): number | null {
	if (
		hitsAllowed === null ||
		singlesAllowed === null ||
		doublesAllowed === null ||
		triplesAllowed === null ||
		homeRunsAllowed === null ||
		atBatsAgainst === null
	) {
		return null;
	}

	const totalBasesAgainst =
		singlesAllowed +
		2 * doublesAllowed +
		3 * triplesAllowed +
		4 * homeRunsAllowed;

	if (atBatsAgainst === 0) {
		return null;
	}

	const slgAgainst = totalBasesAgainst / atBatsAgainst;
	return parseFloat(slgAgainst.toFixed(3));
}

export function calculateOPSAgainst(
	obpAgainst: number | null,
	slgAgainst: number | null,
): number | null {
	if (obpAgainst === null || slgAgainst === null) {
		return null;
	}

	const opsAgainst = obpAgainst + slgAgainst;
	return parseFloat(opsAgainst.toFixed(3));
}

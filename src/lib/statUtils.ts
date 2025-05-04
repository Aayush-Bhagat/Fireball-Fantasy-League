export function calculateEra(runsAllowed: number, outsPitched: number): number {
	const inningsPitched = outsPitched / 3;

	const era = (runsAllowed / inningsPitched) * 9;

	if (isNaN(era) || !isFinite(era)) {
		return 0;
	}

	return parseFloat(era.toFixed(2));
}

export function calculateInningsPitched(outsPitched: number): number {
	const inningsPitched = Math.floor(outsPitched / 3);
	const outs = outsPitched % 3;

	return Number(`${inningsPitched}.${outs}`);
}

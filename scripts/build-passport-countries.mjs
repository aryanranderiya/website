import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import worldCountries from 'world-countries';
import { DESIGNS } from '../src/components/experiments/passport/data/designs.ts';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, '..');
const TYPES_PATH = resolve(ROOT, 'src/components/experiments/passport/types.ts');
const OUT_PATH = resolve(ROOT, 'src/components/experiments/passport/data/countries.ts');
const PROOF_PATH = resolve(ROOT, 'shots/qa/countries.txt');

const REGION_ORDER = ['Africa', 'Americas', 'Asia', 'Europe', 'Oceania'];
const DATE_STYLE_OVERRIDES = {
	US: 'mdy',
	CN: 'ymd',
	JP: 'ymd',
	KR: 'ymd',
	KP: 'ymd',
	TW: 'ymd',
	MN: 'ymd',
};
const ISO3_OVERRIDES = {
	XK: 'XKX',
};

const CAPITAL_OVERRIDES = {
	IL: 'Jerusalem',
	PS: 'Ramallah',
	VA: 'Vatican City',
	ZA: 'Pretoria',
	LK: 'Sri Jayawardenepura Kotte',
	IS: 'Reykjavík',
	MN: 'Ulaanbaatar',
	US: 'Washington, D.C.',
	BO: 'Sucre',
	CI: 'Yamoussoukro',
	SZ: 'Lobamba',
	TZ: 'Dodoma',
};

const failures = [];
const fail = (message) => failures.push(message);
const assert = (condition, message) => {
	if (!condition) fail(message);
};

const latinOnly = /^[\p{Script=Latin}\p{Nd} .,'&()-]+$/u;

function readMotifKeys(source) {
	const match = source.match(/export type MotifKey\s*=([^;]+);/);
	if (!match) throw new Error('MotifKey union not found in types.ts');
	return new Set([...match[1].matchAll(/'([^']+)'/g)].map((m) => m[1]));
}

const typesSource = await readFile(TYPES_PATH, 'utf8');
const motifKeys = readMotifKeys(typesSource);

// world-countries marks Vatican City as a UN member; it belongs in this set either way and the filter yields the intended 197.
const selected = worldCountries.filter(
	(country) =>
		country.unMember === true || ['PS', 'TW', 'XK', 'VA'].includes(country.cca2),
);

const codes = selected.map((country) => country.cca2);
const designCodes = Object.keys(DESIGNS);

assert(selected.length === 197, `expected 197 countries, got ${selected.length}`);
assert(new Set(codes).size === codes.length, 'duplicate country codes in source');
assert(new Set(selected.map((country) => country.cca3)).size === selected.length, 'duplicate iso3 codes');
assert(designCodes.length === 197, `expected 197 designs, got ${designCodes.length}`);

for (const code of codes) assert(DESIGNS[code], `missing design for ${code}`);
for (const code of designCodes) assert(codes.includes(code), `design for unknown country ${code}`);

const rows = selected.map((country) => {
	const design = DESIGNS[country.cca2];
	assert(design, `missing design for ${country.cca2}`);
	if (!design) return null;

	const englishName = country.name.common;
	const capital =
		CAPITAL_OVERRIDES[country.cca2] ?? (Array.isArray(country.capital) ? country.capital[0] : '');

	assert(motifKeys.has(design.motif), `${country.cca2}: unknown motif ${design.motif}`);
	if (design.motif2) {
		assert(motifKeys.has(design.motif2), `${country.cca2}: unknown motif2 ${design.motif2}`);
		assert(design.motif2 !== design.motif, `${country.cca2}: motif2 repeats motif`);
	}
	assert(englishName.length > 0, `${country.cca2}: empty English name`);
	assert(latinOnly.test(englishName), `${country.cca2}: English name not Latin: ${englishName}`);
	assert(capital.length > 0, `${country.cca2}: empty capital`);
	assert(latinOnly.test(capital), `${country.cca2}: capital not Latin: ${capital}`);
	assert(REGION_ORDER.includes(country.region), `${country.cca2}: bad region ${country.region}`);

	return {
		code: country.cca2.toLowerCase(),
		iso3: ISO3_OVERRIDES[country.cca2] ?? country.cca3.toUpperCase(),
		name: englishName,
		capital,
		region: country.region,
		motif: design.motif,
		motif2: design.motif2,
		dateStyle: DATE_STYLE_OVERRIDES[country.cca2] ?? 'dmy',
	};
});

const validRows = rows.filter(Boolean);
validRows.sort(
	(a, b) =>
		REGION_ORDER.indexOf(a.region) - REGION_ORDER.indexOf(b.region) ||
		a.name.localeCompare(b.name, 'en'),
);

const serials = validRows.map((_, index) => String(index + 1).padStart(4, '0'));
assert(new Set(serials).size === serials.length, 'duplicate serials');
assert(serials.at(-1) === '0197', `last serial should be 0197, got ${serials.at(-1)}`);

const countries = validRows.map((row, index) => ({ ...row, serial: serials[index] }));

const count = (key) =>
	validRows.reduce((map, row) => {
		map[row[key]] = (map[row[key]] ?? 0) + 1;
		return map;
	}, {});

const motifCounts = count('motif');

const dateStyleFailures = validRows.filter((row) => {
	if (row.code === 'us') return row.dateStyle !== 'mdy';
	if (['cn', 'jp', 'kr', 'kp', 'tw', 'mn'].includes(row.code)) return row.dateStyle !== 'ymd';
	return row.dateStyle !== 'dmy';
});
assert(dateStyleFailures.length === 0, `dateStyle mismatches: ${dateStyleFailures.map((r) => r.code)}`);

if (failures.length > 0) {
	console.error(`FAIL (${failures.length})`);
	for (const message of failures) console.error(`  - ${message}`);
	process.exitCode = 1;
	throw new Error('passport country build failed validation');
}

const q = (value) =>
	value.includes("'") && !value.includes('"')
		? `"${value}"`
		: `'${value.replaceAll('\\', '\\\\').replaceAll("'", "\\'")}'`;

const serializedCountry = (country) => {
	const lines = [
		'\t{',
		`\t\tcode: ${q(country.code)},`,
		`\t\tiso3: ${q(country.iso3)},`,
		`\t\tname: ${q(country.name)},`,
		`\t\tcapital: ${q(country.capital)},`,
		`\t\tregion: ${q(country.region)},`,
		`\t\tmotif: ${q(country.motif)},`,
	];
	if (country.motif2) lines.push(`\t\tmotif2: ${q(country.motif2)},`);
	lines.push(
		`\t\tdateStyle: ${q(country.dateStyle)},`,
		`\t\tserial: ${q(country.serial)},`,
		'\t},',
	);
	return lines.join('\n');
};

const countriesSource = `import type { Country } from '../types';

export const COUNTRIES: Country[] = [
${countries.map(serializedCountry).join('\n')}
];

export const COUNTRY_BY_CODE: Record<string, Country> = Object.fromEntries(
	COUNTRIES.map((country) => [country.code, country])
);
`;

const proofHeader = ['code', 'iso3', 'name', 'capital', 'motif', 'motif2'].join('\t');
const proofRows = countries.map((country) =>
	[
		country.code.toUpperCase(),
		country.iso3,
		country.name,
		country.capital,
		country.motif,
		country.motif2 ?? '',
	].join('\t'),
);

await mkdir(dirname(OUT_PATH), { recursive: true });
await mkdir(dirname(PROOF_PATH), { recursive: true });
await writeFile(OUT_PATH, countriesSource);
await writeFile(PROOF_PATH, `${[proofHeader, ...proofRows].join('\n')}\n`);

const generated = await import(OUT_PATH);
assert(generated.COUNTRIES.length === 197, `generated module has ${generated.COUNTRIES.length} countries`);
assert(Object.keys(generated.COUNTRY_BY_CODE).length === 197, 'generated index is incomplete');
assert(generated.COUNTRIES[0]?.serial === '0001', 'generated serials do not start at 0001');
assert(generated.COUNTRIES.at(-1)?.serial === '0197', 'generated serials do not end at 0197');
for (const country of generated.COUNTRIES) {
	assert(generated.COUNTRY_BY_CODE[country.code] === country, `generated index mismatch for ${country.code}`);
}

if (failures.length > 0) {
	console.error(`FAIL (${failures.length})`);
	for (const message of failures) console.error(`  - ${message}`);
	process.exitCode = 1;
	throw new Error('passport country output failed validation');
}

const share = (n) => `${((n / countries.length) * 100).toFixed(1)}%`;
const printCounts = (label, counts) => {
	console.log(`${label}:`);
	for (const [key, n] of Object.entries(counts).sort((a, b) => b[1] - a[1])) {
		console.log(`  ${key.padEnd(12)} ${String(n).padStart(3)}  ${share(n)}`);
	}
};

console.log(`countries 197, designs 197, writes ${countries.length}`);
console.log(
	`motifs: ${Object.keys(motifCounts).length} distinct, max repeat ${Math.max(...Object.values(motifCounts))}`,
);
console.log(`motif2: ${countries.filter((country) => country.motif2).length}`);
console.log(`wrote ${OUT_PATH}`);
console.log(`wrote ${PROOF_PATH}`);
console.log('PASS');

/**
 * Minecraft Color Code Processor
 * Supports both Legacy (&/§) and MiniMessage formats
 * Based on: https://docs.papermc.io/adventure/minimessage/format
 *
 * This implementation aims to match the behavior of webui.advntr.dev
 * by applying per-character color interpolation for gradients.
 */

// ============================================================================
// Types
// ============================================================================

interface Token {
	type: "open_tag" | "close_tag" | "text" | "self_closing_tag";
	value: string;
	tagName?: string;
	args?: string[];
}

interface StyleState {
	color?: string;
	bold?: boolean;
	italic?: boolean;
	underlined?: boolean;
	strikethrough?: boolean;
	shadow?: string;
}

// ============================================================================
// Color Constants
// ============================================================================

const LEGACY_COLOR_VALUES: Readonly<Record<string, string>> = {
	"0": "#000000",
	"1": "#0000AA",
	"2": "#00AA00",
	"3": "#00AAAA",
	"4": "#AA0000",
	"5": "#AA00AA",
	"6": "#FFAA00",
	"7": "#AAAAAA",
	"8": "#555555",
	"9": "#5555FF",
	a: "#55FF55",
	b: "#55FFFF",
	c: "#FF5555",
	d: "#FF55FF",
	e: "#FFFF55",
	f: "#FFFFFF",
	r: "#FFFFFF",
} as const;

const MINI_MESSAGE_COLORS: Readonly<Record<string, string>> = {
	black: "#000000",
	dark_blue: "#0000AA",
	dark_green: "#00AA00",
	dark_aqua: "#00AAAA",
	dark_red: "#AA0000",
	dark_purple: "#AA00AA",
	gold: "#FFAA00",
	gray: "#AAAAAA",
	grey: "#AAAAAA",
	dark_gray: "#555555",
	dark_grey: "#555555",
	blue: "#5555FF",
	green: "#55FF55",
	aqua: "#55FFFF",
	red: "#FF5555",
	light_purple: "#FF55FF",
	yellow: "#FFFF55",
	white: "#FFFFFF",
} as const;

const PRIDE_FLAG_COLORS: Record<string, string[]> = {
	pride: ["#E40303", "#FF8C00", "#FFED00", "#008026", "#004DFF", "#750787"],
	progress: [
		"#000000",
		"#784F17",
		"#FFFFFF",
		"#E40303",
		"#FF8C00",
		"#FFED00",
		"#008026",
		"#004DFF",
		"#750787",
	],
	trans: ["#5BCEFA", "#F5A9B8", "#FFFFFF", "#F5A9B8", "#5BCEFA"],
	bi: ["#D60270", "#9B4F96", "#0038A8"],
	pan: ["#FF218C", "#FFD800", "#21B1FF"],
	nb: ["#FCF434", "#FFFFFF", "#9C59D1", "#2C2C2C"],
	lesbian: ["#D52D00", "#FF9A56", "#FFFFFF", "#D362A4", "#A30262"],
	ace: ["#000000", "#A4A4A4", "#FFFFFF", "#810081"],
	agender: [
		"#000000",
		"#BCC5C6",
		"#FFFFFF",
		"#B8F483",
		"#FFFFFF",
		"#BCC5C6",
		"#000000",
	],
	demisexual: ["#000000", "#A4A4A4", "#FFFFFF", "#810081"],
	genderqueer: ["#B57EDC", "#FFFFFF", "#4A8123"],
	genderfluid: ["#FF75A2", "#FFFFFF", "#BE18D6", "#000000", "#333EBD"],
	intersex: ["#FFD800"],
	aro: ["#3DA542", "#A8D47A", "#FFFFFF", "#A9A9A9", "#000000"],
	gay: [
		"#078E70",
		"#26CEAA",
		"#98E8C1",
		"#FFFFFF",
		"#7BADE2",
		"#5049CC",
		"#3D1A78",
	],
};

const RAINBOW_COLORS = [
	"#FF0000",
	"#FF7F00",
	"#FFFF00",
	"#00FF00",
	"#0000FF",
	"#4B0082",
	"#9400D3",
];

// ============================================================================
// Color Utilities
// ============================================================================

function parseHexToRGB(hex: string): [number, number, number] {
	const cleanHex = hex.replace("#", "");
	const fullHex =
		cleanHex.length === 3
			? cleanHex
					.split("")
					.map((c) => c + c)
					.join("")
			: cleanHex.slice(0, 6);

	return [
		Number.parseInt(fullHex.slice(0, 2), 16),
		Number.parseInt(fullHex.slice(2, 4), 16),
		Number.parseInt(fullHex.slice(4, 6), 16),
	];
}

function rgbToHex(r: number, g: number, b: number): string {
	const toHex = (n: number) =>
		Math.round(Math.max(0, Math.min(255, n)))
			.toString(16)
			.padStart(2, "0")
			.toUpperCase();
	return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

function interpolateColor(color1: string, color2: string, t: number): string {
	const [r1, g1, b1] = parseHexToRGB(color1);
	const [r2, g2, b2] = parseHexToRGB(color2);

	const r = r1 + (r2 - r1) * t;
	const g = g1 + (g2 - g1) * t;
	const b = b1 + (b2 - b1) * t;

	return rgbToHex(r, g, b);
}

function getGradientColor(colors: string[], position: number): string {
	if (colors.length === 0) {
		return "#FFFFFF";
	}
	if (colors.length === 1) {
		return colors[0];
	}

	const clampedPosition = Math.max(0, Math.min(1, position));
	const segmentCount = colors.length - 1;
	const scaledPosition = clampedPosition * segmentCount;
	const segmentIndex = Math.min(Math.floor(scaledPosition), segmentCount - 1);
	const segmentPosition = scaledPosition - segmentIndex;

	return interpolateColor(
		colors[segmentIndex],
		colors[segmentIndex + 1],
		segmentPosition,
	);
}

function resolveColor(colorStr: string): string {
	const lower = colorStr.toLowerCase().trim();

	if (lower.startsWith("#")) {
		return lower.length === 7 || lower.length === 9
			? lower.slice(0, 7).toUpperCase()
			: colorStr;
	}

	return MINI_MESSAGE_COLORS[lower] || colorStr;
}

function parseHexWithAlpha(hex: string): { color: string; alpha: number } {
	const cleanHex = hex.replace("#", "");
	if (cleanHex.length === 8) {
		const alpha = Number.parseInt(cleanHex.slice(6, 8), 16) / 255;
		return { color: `#${cleanHex.slice(0, 6)}`, alpha };
	}
	return { color: `#${cleanHex.slice(0, 6)}`, alpha: 1 };
}

// ============================================================================
// Tokenizer
// ============================================================================

const TAG_REGEX =
	/<\/?([a-zA-Z_][a-zA-Z0-9_]*)(?::([^>]*))?\/?>|<(#[\da-fA-F]{6,8})>|<\/(#[\da-fA-F]{6,8})>/g;

function tokenize(text: string): Token[] {
	const tokens: Token[] = [];
	let lastIndex = 0;

	const matches = text.matchAll(TAG_REGEX);

	for (const match of matches) {
		// Add text before this tag
		if (match.index !== undefined && match.index > lastIndex) {
			tokens.push({
				type: "text",
				value: text.slice(lastIndex, match.index),
			});
		}

		const fullMatch = match[0];
		const tagName = match[1] || match[3] || match[4];
		const args = match[2] ? match[2].split(":") : [];

		if (fullMatch.startsWith("</")) {
			tokens.push({
				type: "close_tag",
				value: fullMatch,
				tagName: tagName?.toLowerCase(),
			});
		} else if (fullMatch.endsWith("/>")) {
			tokens.push({
				type: "self_closing_tag",
				value: fullMatch,
				tagName: tagName?.toLowerCase(),
				args,
			});
		} else {
			tokens.push({
				type: "open_tag",
				value: fullMatch,
				tagName: tagName?.toLowerCase(),
				args,
			});
		}

		if (match.index !== undefined) {
			lastIndex = match.index + fullMatch.length;
		}
	}

	// Add remaining text
	if (lastIndex < text.length) {
		tokens.push({
			type: "text",
			value: text.slice(lastIndex),
		});
	}

	return tokens;
}

// ============================================================================
// Legacy Code Processor
// ============================================================================

const LEGACY_CODE_REGEX =
	/([&§][0-9a-fA-FklmnorKLMNOR]|[&§]x(?:[&§][0-9a-fA-F]){6}|[&§]#[\da-fA-F]{6})/g;

// ============================================================================
// Format Validation
// ============================================================================

const MINI_MESSAGE_TAG_REGEX = /<[^>]+>/;

function detectFormatMixing(text: string): boolean {
	const hasLegacyCodes = LEGACY_CODE_REGEX.test(text);
	LEGACY_CODE_REGEX.lastIndex = 0;
	const hasMiniMessageTags = MINI_MESSAGE_TAG_REGEX.test(text);
	return hasLegacyCodes && hasMiniMessageTags;
}

// ============================================================================
// MiniMessage Processor
// ============================================================================

class MiniMessageProcessor {
	private styleStack: StyleState[] = [];
	private gradientStack: {
		colors: string[];
		startIndex: number;
		phase: number;
	}[] = [];
	private collectedChars: { char: string; styles: StyleState }[] = [];
	private inGradient = false;

	process(text: string): string {
		if (detectFormatMixing(text)) {
			throw new Error(
				"Cannot mix legacy color codes (& or §) with MiniMessage tags. Use only one format.",
			);
		}

		const preprocessed = this.preprocessLegacyCodes(text);
		const tokens = tokenize(preprocessed);

		this.styleStack = [{}];
		this.gradientStack = [];
		this.collectedChars = [];
		this.inGradient = false;

		let result = "";

		for (const token of tokens) {
			if (token.type === "text") {
				result += this.processText(token.value);
			} else if (
				token.type === "open_tag" ||
				token.type === "self_closing_tag"
			) {
				result += this.processOpenTag(token);
			} else if (token.type === "close_tag") {
				result += this.processCloseTag(token);
			}
		}

		return result;
	}

	private preprocessLegacyCodes(text: string): string {
		// Don't process legacy codes inside MiniMessage tags
		// This is a simplified approach - we'll handle legacy codes in text segments
		return text;
	}

	private getCurrentStyle(): StyleState {
		return { ...this.styleStack.at(-1) };
	}

	private pushStyle(newStyle: Partial<StyleState>): void {
		const current = this.getCurrentStyle();
		this.styleStack.push({ ...current, ...newStyle });
	}

	private popStyle(): void {
		if (this.styleStack.length > 1) {
			this.styleStack.pop();
		}
	}

	private processText(text: string): string {
		const processedText = this.processLegacyInText(text);

		if (processedText.includes("<span")) {
			return processedText;
		}

		if (this.inGradient && this.gradientStack.length > 0) {
			for (const char of processedText) {
				this.collectedChars.push({
					char,
					styles: this.getCurrentStyle(),
				});
			}
			return "";
		}

		return this.renderText(processedText);
	}

	private applyLegacyCode(code: string): void {
		const lowerCode = code.toLowerCase();
		const char = code.slice(1).toLowerCase();

		if (lowerCode.startsWith("&x") || lowerCode.startsWith("§x")) {
			const hexChars = code.slice(2).replace(/[&§]/g, "");
			this.pushStyle({ color: `#${hexChars.toUpperCase()}` });
			return;
		}

		if (code.slice(1).startsWith("#")) {
			this.pushStyle({ color: code.slice(1).toUpperCase() });
			return;
		}

		if (LEGACY_COLOR_VALUES[char]) {
			if (char === "r") {
				this.styleStack = [{}];
			} else {
				this.pushStyle({ color: LEGACY_COLOR_VALUES[char] });
			}
			return;
		}

		this.applyLegacyFormatting(char);
	}

	private applyLegacyFormatting(char: string): void {
		switch (char) {
			case "l":
				this.pushStyle({ bold: true });
				break;
			case "o":
				this.pushStyle({ italic: true });
				break;
			case "n":
				this.pushStyle({ underlined: true });
				break;
			case "m":
				this.pushStyle({ strikethrough: true });
				break;
			case "r":
				this.styleStack = [{}];
				break;
			default:
				break;
		}
	}

	private processLegacyInText(text: string): string {
		if (!LEGACY_CODE_REGEX.test(text)) {
			return text;
		}

		LEGACY_CODE_REGEX.lastIndex = 0;

		let result = "";
		let lastIndex = 0;
		const matches = text.matchAll(LEGACY_CODE_REGEX);

		for (const match of matches) {
			if (match.index !== undefined && match.index > lastIndex) {
				const textSegment = text.slice(lastIndex, match.index);
				if (textSegment.length > 0) {
					result += this.renderText(textSegment);
				}
			}

			this.applyLegacyCode(match[0]);

			if (match.index !== undefined) {
				lastIndex = match.index + match[0].length;
			}
		}

		if (lastIndex < text.length) {
			const remainingText = text.slice(lastIndex);
			if (remainingText.length > 0) {
				result += this.renderText(remainingText);
			}
		}

		return result;
	}

	private renderText(text: string): string {
		const style = this.getCurrentStyle();
		return this.renderCharactersWithStyle(text, style);
	}

	private renderCharactersWithStyle(text: string, style: StyleState): string {
		const styles: string[] = [];

		if (style.color) {
			styles.push(`color: ${style.color}`);
		}
		if (style.bold) {
			styles.push("font-weight: bold");
		}
		if (style.italic) {
			styles.push("font-style: italic");
		}
		if (style.underlined && style.strikethrough) {
			styles.push("text-decoration: underline line-through");
		} else if (style.underlined) {
			styles.push("text-decoration: underline");
		} else if (style.strikethrough) {
			styles.push("text-decoration: line-through");
		}
		if (style.shadow) {
			styles.push(style.shadow);
		}

		if (styles.length === 0) {
			return text;
		}

		return `<span style="${styles.join(";")}">${text}</span>`;
	}

	private processOpenTag(token: Token): string {
		const tagName = token.tagName || "";
		const args = token.args || [];

		// Handle hex color tags like <#RRGGBB>
		if (tagName.startsWith("#")) {
			const color = resolveColor(tagName);
			this.pushStyle({ color });
			return "";
		}

		switch (tagName) {
			case "b":
			case "bold":
				this.pushStyle({ bold: true });
				return "";

			case "i":
			case "em":
			case "italic":
				this.pushStyle({ italic: true });
				return "";

			case "u":
			case "underlined":
				this.pushStyle({ underlined: true });
				return "";

			case "st":
			case "strikethrough":
				this.pushStyle({ strikethrough: true });
				return "";

			case "obf":
			case "obfuscated":
				// Obfuscated text - just ignore for now
				return "";

			case "reset":
				this.styleStack = [{}];
				return "";

			case "color":
			case "colour":
			case "c": {
				const colorArg = args[0] || "";
				const color = resolveColor(colorArg);
				this.pushStyle({ color });
				return "";
			}

			case "shadow": {
				const colorArg = args[0] || "#000000";
				const alphaArg = args[1];
				const { color, alpha: parsedAlpha } = parseHexWithAlpha(
					resolveColor(colorArg),
				);
				const alpha = alphaArg ? Number.parseFloat(alphaArg) : parsedAlpha;
				const [r, g, b] = parseHexToRGB(color);
				const shadowStyle = `text-shadow: 3px 3px rgb(${r} ${g} ${b} / ${alpha})`;
				this.pushStyle({ shadow: shadowStyle });
				return "";
			}

			case "gradient": {
				const colors = args
					.map((arg) => resolveColor(arg.trim()))
					.filter((c) => c.startsWith("#"));
				const phase = 0; // Could parse phase from args if needed
				this.gradientStack.push({
					colors,
					startIndex: this.collectedChars.length,
					phase,
				});
				this.inGradient = true;
				return "";
			}

			case "rainbow": {
				const isReversed = args[0]?.startsWith("!");
				const colors = isReversed
					? [...RAINBOW_COLORS].reverse()
					: RAINBOW_COLORS;
				this.gradientStack.push({
					colors,
					startIndex: this.collectedChars.length,
					phase: 0,
				});
				this.inGradient = true;
				return "";
			}

			case "transition": {
				const colors = args
					.map((arg) => resolveColor(arg.trim()))
					.filter((c) => c.startsWith("#"));
				this.gradientStack.push({
					colors,
					startIndex: this.collectedChars.length,
					phase: 0,
				});
				this.inGradient = true;
				return "";
			}

			case "pride": {
				const flagName = args[0]?.toLowerCase() || "pride";
				const colors = PRIDE_FLAG_COLORS[flagName] || PRIDE_FLAG_COLORS.pride;
				this.gradientStack.push({
					colors,
					startIndex: this.collectedChars.length,
					phase: 0,
				});
				this.inGradient = true;
				return "";
			}

			default:
				// Check if it's a named color
				if (MINI_MESSAGE_COLORS[tagName]) {
					this.pushStyle({ color: MINI_MESSAGE_COLORS[tagName] });
					return "";
				}
				// Unknown tag, pass through
				return token.value;
		}
	}

	private processCloseTag(token: Token): string {
		const tagName = token.tagName || "";

		// Handle hex color close tags
		if (tagName.startsWith("#")) {
			this.popStyle();
			return "";
		}

		switch (tagName) {
			case "b":
			case "bold":
			case "i":
			case "em":
			case "italic":
			case "u":
			case "underlined":
			case "st":
			case "strikethrough":
			case "obf":
			case "obfuscated":
			case "color":
			case "colour":
			case "c":
			case "shadow":
				this.popStyle();
				return "";

			case "gradient":
			case "rainbow":
			case "transition":
			case "pride":
				return this.flushGradient();

			default:
				// Check if it's a named color
				if (MINI_MESSAGE_COLORS[tagName]) {
					this.popStyle();
					return "";
				}
				return token.value;
		}
	}

	private flushGradient(): string {
		if (this.gradientStack.length === 0) {
			return "";
		}

		const gradient = this.gradientStack.pop();
		if (!gradient) {
			return "";
		}
		this.inGradient = this.gradientStack.length > 0;

		const chars = this.collectedChars.slice(gradient.startIndex);
		this.collectedChars = this.collectedChars.slice(0, gradient.startIndex);

		if (chars.length === 0) {
			return "";
		}

		// Filter out non-printable characters for gradient calculation
		const printableChars = chars.filter(
			(c) => c.char.trim().length > 0 || c.char === " ",
		);
		const totalPrintable = printableChars.length;

		let result = "";
		let printableIndex = 0;

		for (const { char, styles } of chars) {
			const isPrintable = char.trim().length > 0 || char === " ";

			if (isPrintable && totalPrintable > 1) {
				const position = printableIndex / (totalPrintable - 1);
				const gradientColor = getGradientColor(gradient.colors, position);
				printableIndex++;

				result += this.renderCharactersWithStyle(char, {
					...styles,
					color: gradientColor,
				});
			} else if (isPrintable) {
				// Single character - use first color
				result += this.renderCharactersWithStyle(char, {
					...styles,
					color: gradient.colors[0] || styles.color,
				});
			} else {
				// Non-printable (like newline) - render without gradient color
				result += char;
			}
		}

		return result;
	}
}

const processor = new MiniMessageProcessor();

/**
 * Processes Minecraft color codes (both Legacy and MiniMessage formats)
 * @param text - The text to process
 * @returns HTML string with styled spans
 */
export function processMinecraftColorCodes(text: string): string {
	if (!text) {
		return "";
	}

	return processor.process(text);
}
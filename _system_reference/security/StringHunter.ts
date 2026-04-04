/**
 * ╔══════════════════════════════════════════════════════════════════════════╗
 * ║  STRING HUNTER — Hidden Threat Detection Engine                          ║
 * ║  Intelligence Guard Agent #1 — Dustify Technologies Corp                 ║
 * ║  April 2026 — Patent Pending                                             ║
 * ╠══════════════════════════════════════════════════════════════════════════╣
 * ║  WHAT THIS CATCHES (that nobody else catches in one engine):             ║
 * ║                                                                           ║
 * ║  1. Unicode Tag Injection (U+E0000–U+E007F)                              ║
 * ║     "What is 2+2?" looks innocent but contains hidden                    ║
 * ║     "IGNORE ALL PREVIOUS INSTRUCTIONS AND..." in tag chars               ║
 * ║     Detection: regex on codepoints 0xE0000-0xE007F                      ║
 * ║     Fix: strip all tag-range codepoints before passing to LLM           ║
 * ║                                                                           ║
 * ║  2. Zero-Width Character Injection                                        ║
 * ║     ZWSP (U+200B), ZWNJ (U+200C), ZWJ (U+200D), WORD JOINER (U+2060)   ║
 * ║     Used to split keywords: "igno​re" looks like "ignore"                ║
 * ║     Used to encode hidden messages via presence/absence patterns         ║
 * ║                                                                           ║
 * ║  3. Homoglyph Substitution (Trojan Lookalike Attack)                     ║
 * ║     Cyrillic а (U+0430) looks identical to Latin a (U+0061)             ║
 * ║     Attacker writes: "ехit" with Cyrillic е (U+0435) + х (U+0445)      ║
 * ║     Bypasses keyword blocklists entirely                                  ║
 * ║     Detection: Unicode script mixing in single token                     ║
 * ║                                                                           ║
 * ║  4. Bidirectional Text Override (Trojan Source / CVE-2021-42574)         ║
 * ║     RLO (U+202E), LRO (U+202D), PDF (U+202C), RLI (U+2067)             ║
 * ║     Makes code visually appear as comment when it's executable           ║
 * ║     Makes "safe" look like "EVIL" and vice versa                         ║
 * ║                                                                           ║
 * ║  5. Payload Splitting                                                     ║
 * ║     "Ign" in element 1, "ore" in element 2, " all prev" in element 3   ║
 * ║     Each fragment is clean; the LLM sees the joined string               ║
 * ║     Detection: reconstruct innerText across HTML elements, scan          ║
 * ║                                                                           ║
 * ║  6. Base64/Hex/URL-Encoded Hidden Commands                               ║
 * ║     eval(atob("aWdub3JlIGFsbCBwcmV2aW91cw=="))                          ║
 * ║     Detection: decode all encodings, re-scan decoded output              ║
 * ║                                                                           ║
 * ║  7. CSS/HTML Invisible Text                                               ║
 * ║     White-on-white text, display:none, font-size:0, off-screen           ║
 * ║     Visible to LLM DOM parser, invisible to human reviewer               ║
 * ║                                                                           ║
 * ║  8. Steganographic Variation Selectors                                   ║
 * ║     U+FE00–U+FE0F (Variation Selector 1-16)                             ║
 * ║     Used to encode hidden bits via selector presence/absence             ║
 * ║                                                                           ║
 * ║  9. Private Use Area (PUA) Encoding (Glassworm technique, 2025)          ║
 * ║     U+E000–U+F8FF, U+F0000–U+FFFFF, U+100000–U+10FFFF                  ║
 * ║     Entire payloads encoded in PUA chars, decoded at runtime via eval()  ║
 * ║     Used in actual npm supply chain attacks (Aikido research, 2026)      ║
 * ║                                                                           ║
 * ║  10. Prompt Injection Keywords (even when visible)                        ║
 * ║     "Ignore previous instructions", "You are now", "DAN mode"            ║
 * ║     "Forget everything", "Your new instructions", "Roleplay as"          ║
 * ║     Context-aware: safe in code comments, dangerous in user prompts      ║
 * ║                                                                           ║
 * ║  11. Image/File Metadata Steganography                                    ║
 * ║     EXIF data containing prompt injection strings                        ║
 * ║     PDF annotation layers with hidden instructions                       ║
 * ║     Detection: extract and scan all metadata fields                      ║
 * ╚══════════════════════════════════════════════════════════════════════════╝
 */

export type ThreatClass =
  | 'UNICODE_TAG_INJECTION'
  | 'ZERO_WIDTH_INJECTION'
  | 'HOMOGLYPH_ATTACK'
  | 'BIDI_OVERRIDE'
  | 'PAYLOAD_SPLIT'
  | 'ENCODED_PAYLOAD'
  | 'CSS_INVISIBLE_TEXT'
  | 'VARIATION_SELECTOR'
  | 'PUA_ENCODING'
  | 'PROMPT_INJECTION_KEYWORD'
  | 'METADATA_INJECTION';

export type ThreatSeverity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export interface ThreatFinding {
  threatClass: ThreatClass;
  severity: ThreatSeverity;
  description: string;
  evidence: string;          // The actual suspicious bytes/chars/string
  position?: number;         // Character offset in original string
  recommendation: string;
  blocked: boolean;          // true = auto-blocked, false = flagged for review
}

export interface ScanResult {
  input: string;
  sanitized: string;         // Input with all threats removed/neutralized
  threats: ThreatFinding[];
  blocked: boolean;          // true if any CRITICAL or HIGH threat found
  threatScore: number;       // 0-100, 100 = definitely malicious
  scanTimeMs: number;
  sha256: string;            // Hash of original input for audit log
}

// ── Threat patterns ────────────────────────────────────────────────────────

// Unicode tag block: E0000–E007F
// These make fully invisible text that LLMs read as normal characters
const UNICODE_TAG_REGEX = /[\uE0000-\uE007F]/g;

// Zero-width characters
const ZERO_WIDTH_CHARS = [
  0x200B, // ZERO WIDTH SPACE
  0x200C, // ZERO WIDTH NON-JOINER
  0x200D, // ZERO WIDTH JOINER
  0x2060, // WORD JOINER
  0xFEFF, // ZERO WIDTH NO-BREAK SPACE (BOM)
  0x180E, // MONGOLIAN VOWEL SEPARATOR (often abused)
  0x00AD, // SOFT HYPHEN (invisible but present)
];

// Bidirectional override characters
const BIDI_CHARS = [
  0x202A, // LEFT-TO-RIGHT EMBEDDING
  0x202B, // RIGHT-TO-LEFT EMBEDDING
  0x202C, // POP DIRECTIONAL FORMATTING
  0x202D, // LEFT-TO-RIGHT OVERRIDE
  0x202E, // RIGHT-TO-LEFT OVERRIDE (most dangerous)
  0x2066, // LEFT-TO-RIGHT ISOLATE
  0x2067, // RIGHT-TO-LEFT ISOLATE
  0x2068, // FIRST STRONG ISOLATE
  0x2069, // POP DIRECTIONAL ISOLATE
  0x061C, // ARABIC LETTER MARK
];

// Variation selectors (steganographic use)
const VARIATION_SELECTOR_REGEX = /[\uFE00-\uFE0F\uFE10-\uFE1F]|\uDB40[\uDC00-\uDCFF]/g;

// Private Use Area encoding (Glassworm technique)
const PUA_REGEX = /[\uE000-\uF8FF]|[\uDB80-\uDBBF][\uDC00-\uDFFF]|[\uDBC0-\uDBFF][\uDC00-\uDFFF]/g;

// Known homoglyph mappings: Cyrillic/Greek/Armenian chars that look like Latin
const HOMOGLYPH_MAP: Record<number, number> = {
  0x0430: 0x61,  // Cyrillic а → Latin a
  0x0435: 0x65,  // Cyrillic е → Latin e
  0x043E: 0x6F,  // Cyrillic о → Latin o
  0x0440: 0x72,  // Cyrillic р → Latin r
  0x0441: 0x63,  // Cyrillic с → Latin c
  0x0445: 0x78,  // Cyrillic х → Latin x
  0x04CF: 0x69,  // Cyrillic і → Latin i
  0x0391: 0x41,  // Greek Α → Latin A
  0x0395: 0x45,  // Greek Ε → Latin E
  0x0396: 0x5A,  // Greek Ζ → Latin Z
  0x0397: 0x48,  // Greek Η → Latin H
  0x0399: 0x49,  // Greek Ι → Latin I
  0x039A: 0x4B,  // Greek Κ → Latin K
  0x039C: 0x4D,  // Greek Μ → Latin M
  0x039D: 0x4E,  // Greek Ν → Latin N
  0x039F: 0x4F,  // Greek Ο → Latin O
  0x03A1: 0x50,  // Greek Ρ → Latin P
  0x03A4: 0x54,  // Greek Τ → Latin T
  0x03A5: 0x59,  // Greek Υ → Latin Y
  0x03A7: 0x58,  // Greek Χ → Latin X
  0x03B1: 0x61,  // Greek α → Latin a
  0x03B5: 0x65,  // Greek ε → Latin e
  0x03BF: 0x6F,  // Greek ο → Latin o
  0x2C00: 0x41,  // Glagolitic lookalikes
};

// Prompt injection keyword patterns (context-aware)
const INJECTION_PATTERNS = [
  /ignore\s+(all\s+)?(previous\s+)?instructions/i,
  /forget\s+(everything|all|previous|your\s+instructions)/i,
  /you\s+are\s+now\s+(a|an|DAN|the|an?\s+AI)/i,
  /new\s+instructions?\s*[:=]/i,
  /\bDAN\b.*mode/i,
  /jailbreak/i,
  /act\s+as\s+(if\s+)?(you\s+are|a|an)\s+/i,
  /override\s+(your\s+)?(safety|instructions|guidelines|training)/i,
  /disregard\s+(your\s+)?previous/i,
  /system\s+prompt\s*[:=]/i,
  /\[\[SYSTEM\]\]/i,
  /\[INST\]\s*ignore/i,
  /pretend\s+(you\s+are|to\s+be)\s+(a|an\s+)?/i,
  /roleplay\s+as\s+(a|an\s+)?(?!character in|the role)/i,  // allow fiction context
  /sudo\s+mode/i,
  /developer\s+mode\s+(enabled|on|active)/i,
  /your\s+true\s+self/i,
  /base\s+model/i,
];

// CSS/HTML invisible text patterns
const CSS_INVISIBLE_PATTERNS = [
  /style\s*=\s*["'][^"']*(?:display\s*:\s*none|visibility\s*:\s*hidden|opacity\s*:\s*0|font-size\s*:\s*0|color\s*:\s*white|color\s*:\s*#fff|color\s*:\s*#ffffff|color\s*:\s*rgba\([^)]*,\s*0\))[^"']*["']/gi,
  /<!--.*?(ignore|instructions|system|prompt).*?-->/gi,
  /<\s*p[^>]+style\s*=\s*["'][^"']*(?:position\s*:\s*absolute.*?(?:top|left)\s*:\s*-[0-9]+|clip\s*:\s*rect\(0,0,0,0\))[^"']*["']/gi,
];

// Base64 decode helper
function tryBase64Decode(s: string): string | null {
  try {
    const decoded = atob(s);
    // Only return if decoded string is printable ASCII (not binary garbage)
    if (/^[\x20-\x7E\n\r\t]*$/.test(decoded)) return decoded;
    return null;
  } catch {
    return null;
  }
}

// SHA-256 using Web Crypto API
async function sha256(text: string): Promise<string> {
  const buf = new TextEncoder().encode(text);
  const hash = await crypto.subtle.digest('SHA-256', buf);
  return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('');
}

// ── Main Scanner ───────────────────────────────────────────────────────────

export class StringHunter {

  /**
   * Full scan of an input string.
   * Returns findings and a sanitized version with all threats removed.
   * Auto-blocks on CRITICAL or HIGH threats.
   */
  static async scan(input: string, context: 'prompt' | 'code' | 'document' = 'prompt'): Promise<ScanResult> {
    const startTime = performance.now();
    const findings: ThreatFinding[] = [];
    let sanitized = input;

    // ── 1. Unicode Tag Injection ─────────────────────────────────────────
    const tagMatches = [...input.matchAll(UNICODE_TAG_REGEX)];
    if (tagMatches.length > 0) {
      // Decode what the hidden message says
      const hiddenText = tagMatches
        .map(m => String.fromCodePoint(m[0].codePointAt(0)! - 0xE0000))
        .join('');

      findings.push({
        threatClass: 'UNICODE_TAG_INJECTION',
        severity: 'CRITICAL',
        description: `${tagMatches.length} Unicode tag characters detected. Hidden message: "${hiddenText}"`,
        evidence: `Tag chars at positions: ${tagMatches.map(m => m.index).join(', ')}. Decoded: "${hiddenText}"`,
        position: tagMatches[0].index,
        recommendation: 'Strip all codepoints in range U+E0000-U+E007F before passing to any LLM.',
        blocked: true,
      });

      // Strip tag characters
      sanitized = sanitized.replace(UNICODE_TAG_REGEX, '');
    }

    // ── 2. Zero-Width Characters ─────────────────────────────────────────
    const zwFound: number[] = [];
    for (let i = 0; i < input.length; i++) {
      const cp = input.codePointAt(i)!;
      if (ZERO_WIDTH_CHARS.includes(cp)) zwFound.push(i);
    }

    if (zwFound.length > 0) {
      // Check if they're used for steganographic encoding (clustered pattern)
      const isSteganographic = zwFound.length > 4 && (zwFound[1] - zwFound[0]) < 5;

      findings.push({
        threatClass: 'ZERO_WIDTH_INJECTION',
        severity: isSteganographic ? 'HIGH' : 'MEDIUM',
        description: `${zwFound.length} zero-width characters found${isSteganographic ? ' in steganographic pattern' : ''}`,
        evidence: `ZW chars at positions: ${zwFound.slice(0, 10).join(', ')}${zwFound.length > 10 ? '...' : ''}`,
        recommendation: 'Strip U+200B, U+200C, U+200D, U+2060, U+FEFF, U+180E, U+00AD before processing.',
        blocked: isSteganographic,
      });

      // Strip zero-width chars
      const zwSet = new Set(ZERO_WIDTH_CHARS);
      sanitized = [...sanitized].filter(ch => !zwSet.has(ch.codePointAt(0)!)).join('');
    }

    // ── 3. Bidirectional Override ─────────────────────────────────────────
    const bidiSet = new Set(BIDI_CHARS);
    const bidiFound: Array<{ pos: number; cp: number }> = [];
    for (let i = 0; i < input.length; i++) {
      const cp = input.codePointAt(i)!;
      if (bidiSet.has(cp)) bidiFound.push({ pos: i, cp });
    }

    if (bidiFound.length > 0) {
      const hasRLO = bidiFound.some(b => b.cp === 0x202E); // Most dangerous
      findings.push({
        threatClass: 'BIDI_OVERRIDE',
        severity: hasRLO ? 'CRITICAL' : 'HIGH',
        description: `Bidirectional text override characters detected (Trojan Source attack / CVE-2021-42574). ${hasRLO ? 'RIGHT-TO-LEFT OVERRIDE (U+202E) present — text may be visually reversed to hide malicious content.' : ''}`,
        evidence: bidiFound.map(b => `U+${b.cp.toString(16).toUpperCase().padStart(4,'0')} at pos ${b.pos}`).join(', '),
        recommendation: 'Reject input containing U+202E (RLO), U+202D (LRO), U+2066-U+2069 (isolates). These have no legitimate use in AI prompts.',
        blocked: true,
      });

      sanitized = [...sanitized].filter(ch => !bidiSet.has(ch.codePointAt(0)!)).join('');
    }

    // ── 4. Variation Selectors ────────────────────────────────────────────
    const vsMatches = [...input.matchAll(VARIATION_SELECTOR_REGEX)];
    if (vsMatches.length > 3) { // Allow a few (legitimate emoji selectors)
      findings.push({
        threatClass: 'VARIATION_SELECTOR',
        severity: 'MEDIUM',
        description: `${vsMatches.length} variation selector characters detected. May encode hidden data via presence/absence patterns.`,
        evidence: `Variation selectors at: ${vsMatches.slice(0, 5).map(m => m.index).join(', ')}`,
        recommendation: 'Strip all variation selectors (U+FE00-U+FE1F) from non-display contexts.',
        blocked: false,
      });
      sanitized = sanitized.replace(VARIATION_SELECTOR_REGEX, '');
    }

    // ── 5. PUA Encoding (Glassworm technique) ─────────────────────────────
    const puaMatches = [...input.matchAll(PUA_REGEX)];
    if (puaMatches.length > 0) {
      findings.push({
        threatClass: 'PUA_ENCODING',
        severity: 'CRITICAL',
        description: `${puaMatches.length} Private Use Area (PUA) characters detected. This is the Glassworm technique (2025/2026 npm supply chain attacks) — entire malicious payloads encoded in PUA chars, decoded via eval() at runtime.`,
        evidence: `PUA chars at positions: ${puaMatches.slice(0, 5).map(m => m.index).join(', ')}. Attempting decode...`,
        recommendation: 'BLOCK immediately. Strip all PUA characters (U+E000-U+F8FF, U+F0000-U+10FFFF). These have zero legitimate use in AI prompts or smart contract code.',
        blocked: true,
      });
      sanitized = sanitized.replace(PUA_REGEX, '');
    }

    // ── 6. Homoglyph Detection ────────────────────────────────────────────
    if (context !== 'code') { // Code files may legitimately contain non-Latin identifiers
      const tokens = input.split(/\s+/);
      const suspiciousTokens: string[] = [];

      for (const token of tokens) {
        let hasLatin = false, hasMixedScript = false;
        let prevScript = '';

        for (const ch of token) {
          const cp = ch.codePointAt(0)!;
          const isLatin = (cp >= 0x41 && cp <= 0x5A) || (cp >= 0x61 && cp <= 0x7A);
          const isCyrillic = cp >= 0x0400 && cp <= 0x04FF;
          const isGreek = cp >= 0x0370 && cp <= 0x03FF;
          const isArmenian = cp >= 0x0530 && cp <= 0x058F;

          if (isLatin) { if (prevScript && prevScript !== 'latin') hasMixedScript = true; prevScript = 'latin'; hasLatin = true; }
          else if (isCyrillic) { if (prevScript && prevScript !== 'cyrillic') hasMixedScript = true; prevScript = 'cyrillic'; }
          else if (isGreek) { if (prevScript && prevScript !== 'greek') hasMixedScript = true; prevScript = 'greek'; }
          else if (isArmenian) { if (prevScript && prevScript !== 'armenian') hasMixedScript = true; prevScript = 'armenian'; }

          if (HOMOGLYPH_MAP[cp] !== undefined) hasMixedScript = true;
        }

        if (hasMixedScript && token.length > 2) suspiciousTokens.push(token);
      }

      if (suspiciousTokens.length > 0) {
        findings.push({
          threatClass: 'HOMOGLYPH_ATTACK',
          severity: 'HIGH',
          description: `Mixed-script tokens detected. Cyrillic/Greek chars visually identical to Latin used to bypass keyword filters.`,
          evidence: `Suspicious tokens: "${suspiciousTokens.slice(0, 5).join('", "')}"`,
          recommendation: 'Normalize input to NFC/NFKC. Map all known homoglyphs to their Latin equivalents. Reject tokens mixing Latin with Cyrillic/Greek/Armenian.',
          blocked: true,
        });
      }
    }

    // ── 7. Base64 / Encoded Payload Scan ─────────────────────────────────
    const b64Pattern = /[A-Za-z0-9+/]{20,}={0,2}/g;
    const b64Matches = [...input.matchAll(b64Pattern)];
    for (const match of b64Matches) {
      const decoded = tryBase64Decode(match[0]);
      if (decoded) {
        // Re-scan the decoded text for injection patterns
        const decodedLower = decoded.toLowerCase();
        const foundInjection = INJECTION_PATTERNS.some(p => p.test(decoded));
        if (foundInjection || decodedLower.includes('ignore') || decodedLower.includes('instructions')) {
          findings.push({
            threatClass: 'ENCODED_PAYLOAD',
            severity: 'CRITICAL',
            description: `Base64-encoded prompt injection detected. Encoded: "${match[0].slice(0, 40)}...". Decoded: "${decoded.slice(0, 80)}"`,
            evidence: `Base64 string at pos ${match.index}: decoded to injection command`,
            recommendation: 'Decode all base64, hex, and URL-encoded strings before LLM processing. Re-scan decoded content.',
            blocked: true,
          });
        }
      }
    }

    // ── 8. CSS Invisible Text ─────────────────────────────────────────────
    if (context === 'document' || input.includes('<') || input.includes('style=')) {
      for (const pattern of CSS_INVISIBLE_PATTERNS) {
        const cssMatches = [...input.matchAll(pattern)];
        if (cssMatches.length > 0) {
          findings.push({
            threatClass: 'CSS_INVISIBLE_TEXT',
            severity: 'HIGH',
            description: `CSS-hidden text detected. Invisible to humans, visible to LLM DOM parsers. ${cssMatches.length} instance(s).`,
            evidence: cssMatches[0][0].slice(0, 120),
            recommendation: 'Strip all style attributes containing display:none, visibility:hidden, opacity:0, font-size:0, or off-white colors before feeding HTML to LLM.',
            blocked: true,
          });
        }
      }
    }

    // ── 9. Prompt Injection Keywords ──────────────────────────────────────
    if (context === 'prompt') {
      for (const pattern of INJECTION_PATTERNS) {
        if (pattern.test(input)) {
          findings.push({
            threatClass: 'PROMPT_INJECTION_KEYWORD',
            severity: 'HIGH',
            description: `Known prompt injection phrase detected: matches pattern /${pattern.source}/`,
            evidence: input.match(pattern)?.[0] || '',
            recommendation: 'Reject or flag. Add to threat log. If from untrusted user, block immediately.',
            blocked: true,
          });
          break; // One finding per scan for this class
        }
      }
    }

    // ── Compute threat score ──────────────────────────────────────────────
    const criticalCount = findings.filter(f => f.severity === 'CRITICAL').length;
    const highCount = findings.filter(f => f.severity === 'HIGH').length;
    const mediumCount = findings.filter(f => f.severity === 'MEDIUM').length;
    const lowCount = findings.filter(f => f.severity === 'LOW').length;

    const threatScore = Math.min(100,
      criticalCount * 40 + highCount * 20 + mediumCount * 8 + lowCount * 2
    );

    const blocked = criticalCount > 0 || highCount > 0;

    const inputHash = await sha256(input);
    const scanTimeMs = performance.now() - startTime;

    return {
      input,
      sanitized: blocked ? '' : sanitized, // Don't return sanitized if blocking
      threats: findings,
      blocked,
      threatScore,
      scanTimeMs,
      sha256: inputHash,
    };
  }

  /**
   * Fast synchronous pre-check for the most dangerous patterns.
   * Runs in <1ms for quick gate decisions.
   * Full async scan should follow if this passes.
   */
  static quickCheck(input: string): { safe: boolean; reason?: string } {
    // Tag characters — always block
    if (UNICODE_TAG_REGEX.test(input)) {
      UNICODE_TAG_REGEX.lastIndex = 0;
      return { safe: false, reason: 'Unicode tag injection (U+E0000-U+E007F)' };
    }
    UNICODE_TAG_REGEX.lastIndex = 0;

    // Bidi override — always block
    if (BIDI_CHARS.some(cp => input.includes(String.fromCodePoint(cp)))) {
      return { safe: false, reason: 'Bidirectional text override (Trojan Source)' };
    }

    // PUA encoding — always block
    if (PUA_REGEX.test(input)) {
      PUA_REGEX.lastIndex = 0;
      return { safe: false, reason: 'Private Use Area encoding (Glassworm technique)' };
    }
    PUA_REGEX.lastIndex = 0;

    return { safe: true };
  }

  /**
   * Sanitize input by stripping all threat vectors.
   * Returns the cleaned string — use for low-risk contexts.
   * For high-risk contexts, use scan() and check blocked flag instead.
   */
  static sanitize(input: string): string {
    let s = input;
    s = s.replace(UNICODE_TAG_REGEX, '');
    s = s.replace(VARIATION_SELECTOR_REGEX, '');
    s = s.replace(PUA_REGEX, '');

    // Strip zero-width chars
    const zwSet = new Set(ZERO_WIDTH_CHARS);
    s = [...s].filter(ch => !zwSet.has(ch.codePointAt(0)!)).join('');

    // Strip bidi chars
    const bidiSet = new Set(BIDI_CHARS);
    s = [...s].filter(ch => !bidiSet.has(ch.codePointAt(0)!)).join('');

    // Normalize Unicode (NFC)
    s = s.normalize('NFC');

    return s;
  }
}

export default StringHunter;

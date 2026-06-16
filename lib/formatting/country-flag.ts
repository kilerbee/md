function codeToFlagEmoji(code: string): string | null {
  const upper = code.toUpperCase().trim();
  // Must be exactly 2 ASCII letters
  if (!/^[A-Z]{2}$/.test(upper)) return null;

  // Convert letters to regional indicator symbols
  const regionalIndicators = [...upper].map(
    (char) => String.fromCodePoint(0x1f1e6 + char.charCodeAt(0) - 65)
  );
  return regionalIndicators.join("");
}

export function formatArtistWithFlag(artist: { name: string; country: string; genre: string }): string {
  const flag = codeToFlagEmoji(artist.country);
  const flagPart = flag ? `${flag} ` : "";
  const genrePart = artist.genre ? ` (${artist.genre})` : "";
  return `${flagPart}${artist.name}${genrePart}`;
}

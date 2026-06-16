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

export function getArtistFlag(artist: { name: string; country: string }): string | null {
  return codeToFlagEmoji(artist.country);
}
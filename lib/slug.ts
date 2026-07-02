const cyrillicToLatin: Record<string, string> = {
  "а": "a",
  "б": "b",
  "в": "v",
  "г": "g",
  "д": "d",
  "ђ": "dj",
  "е": "e",
  "ё": "yo",
  "ж": "zh",
  "з": "z",
  "и": "i",
  "й": "y",
  "ј": "j",
  "к": "k",
  "л": "l",
  "љ": "lj",
  "м": "m",
  "н": "n",
  "њ": "nj",
  "о": "o",
  "п": "p",
  "р": "r",
  "с": "s",
  "т": "t",
  "ћ": "c",
  "у": "u",
  "ф": "f",
  "х": "h",
  "ц": "ts",
  "ч": "ch",
  "џ": "dz",
  "ш": "sh",
  "щ": "shch",
  "ъ": "",
  "ы": "y",
  "ь": "",
  "э": "e",
  "ю": "yu",
  "я": "ya",
  "А": "A",
  "Б": "B",
  "В": "V",
  "Г": "G",
  "Д": "D",
  "Ђ": "Dj",
  "Е": "E",
  "Ё": "Yo",
  "Ж": "Zh",
  "З": "Z",
  "И": "I",
  "Й": "Y",
  "Ј": "J",
  "К": "K",
  "Л": "L",
  "Љ": "Lj",
  "М": "M",
  "Н": "N",
  "Њ": "Nj",
  "О": "O",
  "П": "P",
  "Р": "R",
  "С": "S",
  "Т": "T",
  "Ћ": "C",
  "У": "U",
  "Ф": "F",
  "Х": "H",
  "Ц": "Ts",
  "Ч": "Ch",
  "Џ": "Dz",
  "Ш": "Sh",
  "Щ": "Shch",
  "Ъ": "",
  "Ы": "Y",
  "Ь": "",
  "Э": "E",
  "Ю": "Yu",
  "Я": "Ya"
};

export function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/đ/g, "dj")
    .replace(/Đ/g, "dj")
    .replace(/[а-яА-ЯЂЉЊЋЏђљњћџ]/g, (char) => cyrillicToLatin[char] ?? char)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function fallbackSlug(value: string, fallback: string) {
  return slugify(value) || fallback;
}
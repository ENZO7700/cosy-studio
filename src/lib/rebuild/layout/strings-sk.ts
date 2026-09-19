/** SK UI copy — no jargon (except debug tooltip „Blueprint“ elsewhere). */
export const SK = {
  shellOnly:
    "Videli sme len obal stránky. Obsah sa načítava neskôr.",
  rescanWait:
    "Skenovať znova, počkať na obsah",
  completeOk: "Rozloženie stránky vyzerá kompletné.",
  missingParts: (parts: string) =>
    `Chýbajú dôležité časti stránky: ${parts}.`,
  screenshotSaved: "Náhľad stránky je uložený offline.",
  screenshotFailed: "Náhľad sa nepodarilo uložiť. Skúste skenovať znova.",
} as const;

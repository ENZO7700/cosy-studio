export const PLANS = [
  {
    id: "free",
    label: "Zadarmo",
    blurb: "Jeden sken a prehľad.",
    price: "0 €",
  },
  {
    id: "studio",
    label: "Štúdio",
    blurb: "Prestavba, náhľad a sťahovanie pre jeden tím.",
    price: "49 € / mes.",
  },
  {
    id: "agency",
    label: "Agentúra",
    blurb: "Viac prestavieb a plánov pre tím.",
    price: "149 € / mes.",
  },
] as const;


export type PlanId = (typeof PLANS)[number]["id"];

export const ROLES = ["owner", "operator", "reviewer"] as const;
export type OrgRole = (typeof ROLES)[number];

export function isPlanId(value: string): value is PlanId {
  return PLANS.some((plan) => plan.id === value);
}

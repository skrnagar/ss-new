/** Labels for ESG scaffold metrics (extend as needed). */
export const ESG_METRIC_OPTIONS = [
  { value: "scope1_tco2e", label: "Scope 1 emissions (tCO₂e)", defaultUnit: "tCO₂e" },
  { value: "scope2_tco2e", label: "Scope 2 emissions (tCO₂e)", defaultUnit: "tCO₂e" },
  { value: "energy_mwh", label: "Energy use", defaultUnit: "MWh" },
  { value: "water_m3", label: "Water withdrawal", defaultUnit: "m³" },
  { value: "waste_diverted_pct", label: "Waste diverted (%)", defaultUnit: "%" },
  { value: "trifr", label: "TRIFR (rolling)", defaultUnit: "per Mhrs " },
  { value: "training_hours", label: "Training hours (org)", defaultUnit: "h" },
] as const;

export function labelForEsgMetric(key: string): string {
  return ESG_METRIC_OPTIONS.find((m) => m.value === key)?.label ?? key;
}

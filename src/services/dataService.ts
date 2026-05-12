import Papa from "papaparse";
import { LanguageData, LeaderboardData, InventoryData, TestData, ClassLogData } from "../types";

export async function fetchCSV<T>(url: string): Promise<T[]> {
  try {
    const response = await fetch(url);
    if (!response.ok) return [];
    const csvString = await response.text();
    return new Promise((resolve) => {
      Papa.parse(csvString, {
        header: true,
        dynamicTyping: true,
        skipEmptyLines: true,
        complete: (results) => {
          resolve(results.data as T[]);
        },
      });
    });
  } catch (e) {
    console.error(`Error loading ${url}:`, e);
    return [];
  }
}

export const TIERS = [
  "Bronze", "Prata", "Ouro", "Safira", "Rubi", 
  "Esmeralda", "Ametista", "Pérola", "Obsidiana", "Diamante"
];

export function getTierName(tierIndex: number): string {
  return TIERS[tierIndex] || `Tier ${tierIndex}`;
}

export const TIER_COLORS: Record<string, string> = {
  "Bronze": "#cd7f32",
  "Prata": "#c0c0c0",
  "Ouro": "#ffd700",
  "Safira": "#0f52ba",
  "Rubi": "#e0115f",
  "Esmeralda": "#50c878",
  "Ametista": "#9966cc",
  "Pérola": "#eae0c8",
  "Obsidiana": "#3f3f3f",
  "Diamante": "#58cc02"
};

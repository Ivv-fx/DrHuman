import { atom } from "jotai";

export type ScreenState = "loading" | "error" | "out" | "selection" | "chat";

export const screenAtom = atom<ScreenState>("loading");
export const sessionIDAtom = atom<string | null>(null);
export const organizationIDAtom = atom<string | null>(null);

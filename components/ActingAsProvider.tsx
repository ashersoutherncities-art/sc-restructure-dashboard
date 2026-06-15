"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import type { Person } from "@/lib/types";

type Ctx = {
  people: Person[];
  actingAs: Person | null;
  setActingAs: (p: Person | null) => void;
  refreshPeople: () => Promise<void>;
};

const ActingAsCtx = createContext<Ctx | null>(null);

export function ActingAsProvider({ children }: { children: React.ReactNode }) {
  const [people, setPeople] = useState<Person[]>([]);
  const [actingAs, setActingAsState] = useState<Person | null>(null);

  const refreshPeople = useCallback(async () => {
    const res = await fetch("/api/people");
    if (!res.ok) return;
    const data: Person[] = await res.json();
    setPeople(data);
    const storedId =
      typeof window !== "undefined" ? localStorage.getItem("sc_acting_as") : null;
    const found = data.find((p) => p.id === storedId) ?? data[0] ?? null;
    setActingAsState(found);
  }, []);

  useEffect(() => {
    refreshPeople();
  }, [refreshPeople]);

  function setActingAs(p: Person | null) {
    setActingAsState(p);
    if (typeof window !== "undefined") {
      if (p) localStorage.setItem("sc_acting_as", p.id);
      else localStorage.removeItem("sc_acting_as");
    }
  }

  return (
    <ActingAsCtx.Provider value={{ people, actingAs, setActingAs, refreshPeople }}>
      {children}
    </ActingAsCtx.Provider>
  );
}

export function useActingAs() {
  const ctx = useContext(ActingAsCtx);
  if (!ctx) throw new Error("useActingAs must be used inside ActingAsProvider");
  return ctx;
}

import { useState } from "react";

// Index-based wizard navigation over a filtered `steps` array
// (each step: { key, label, ... }). Keeps navigation logic in one place —
// no hardcoded step numbers in the page.
export const useWizard = (steps) => {
  const [stepIndex, setStepIndex] = useState(0);
  const current = steps[stepIndex] ?? steps[0];
  const isStep = (key) => current?.key === key;
  const goNext = () => setStepIndex((i) => Math.min(i + 1, steps.length - 1));
  const goBack = () => setStepIndex((i) => Math.max(i - 1, 0));
  const goTo = (index) => setStepIndex(index);
  return { stepIndex, current, isStep, goNext, goBack, goTo };
};

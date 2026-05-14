export const luxEaseOut = [0.22, 1, 0.36, 1] as const;
export const luxEaseInOut = [0.65, 0, 0.35, 1] as const;

export const luxTransitionFast = { duration: 0.22, ease: luxEaseOut } as const;
export const luxTransition = { duration: 0.32, ease: luxEaseOut } as const;
export const luxTransitionSlow = { duration: 0.4, ease: luxEaseOut } as const;

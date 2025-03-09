import { memo, useEffect, useRef, useState } from "react";

// Generic type for props
type AnyProps = Record<string, any>;

/**
 * Custom hook to memoize components with deep comparison
 * @param Component The component to memoize
 * @param propsAreEqual Optional custom comparison function
 * @returns Memoized component
 */
export function useMemoComponent<P extends AnyProps>(
  Component: React.ComponentType<P>,
  propsAreEqual?: (prevProps: Readonly<P>, nextProps: Readonly<P>) => boolean
) {
  // Use React.memo with custom comparison if provided
  const MemoizedComponent = useRef(memo(Component, propsAreEqual || arePropsEqual)).current;

  return MemoizedComponent;
}

// Default deep comparison function
function arePropsEqual(prevProps: AnyProps, nextProps: AnyProps): boolean {
  const prevKeys = Object.keys(prevProps);
  const nextKeys = Object.keys(nextProps);

  // Quick check for different number of keys
  if (prevKeys.length !== nextKeys.length) return false;

  // Compare each prop value
  return prevKeys.every((key) => {
    const prevValue = prevProps[key];
    const nextValue = nextProps[key];

    // Handle functions - compare by reference
    if (typeof prevValue === "function" && typeof nextValue === "function") {
      return prevValue === nextValue;
    }

    // Handle event handlers specially - typically named onSomething
    if (key.startsWith("on") && typeof prevValue === "function") {
      return true; // Assume event handlers don't affect rendering
    }

    // For objects, do a shallow equality check to avoid deep recursion
    if (
      typeof prevValue === "object" &&
      prevValue !== null &&
      typeof nextValue === "object" &&
      nextValue !== null
    ) {
      return JSON.stringify(prevValue) === JSON.stringify(nextValue);
    }

    // For primitive values, do a simple equality check
    return prevValue === nextValue;
  });
}

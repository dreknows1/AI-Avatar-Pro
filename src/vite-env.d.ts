// Fix: Removed the reference to "vite/client" to resolve the "Cannot find type definition file" error.
// The application code doesn't use Vite-specific client-side types, so this reference is not needed.

declare global {
  // Global declarations can go here
}

// Fix: Added an empty export to convert this file into a module.
// This resolves the error "Augmentations for the global scope can only be directly nested in external modules...".
export {};
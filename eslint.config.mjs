import js from "@eslint/js";
import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import tseslint from "typescript-eslint";

/**
 * Physical-direction Tailwind utilities are a build error, not a review note.
 * The Persian (RTL) build is the default one, so anything written with `ml-`
 * or `text-left` silently breaks the English (LTR) build later. Forcing the
 * logical equivalents (`ms-`, `text-start`, `border-s`) at lint time means the
 * LTR version needs no rewriting.
 */
const DIRECTIONAL =
  "/(?:^|\\\\s)(?:m[lr]|p[lr]|border-[lr]|rounded-[lr]|scroll-m[lr]|scroll-p[lr]|left|right|inset-[lr])-" +
  "|(?:^|\\\\s)(?:text-(?:left|right)|float-(?:left|right)|clear-(?:left|right))(?:\\\\s|$)/";

const DIRECTIONAL_MESSAGE =
  "Use CSS logical properties instead of physical ones: ms-/me-, ps-/pe-, " +
  "border-s/border-e, rounded-s/rounded-e, start-/end-, text-start/text-end. " +
  "The RTL build is the default; physical directions break the LTR build.";

export default tseslint.config(
  { ignores: [".next/**", "node_modules/**", "public/**", "next-env.d.ts"] },

  js.configs.recommended,
  // next/core-web-vitals already registers the @typescript-eslint plugin and
  // its recommended rules; adding tseslint.configs.recommended on top of it
  // redefines the plugin and ESLint refuses to merge the two.
  ...nextCoreWebVitals,

  {
    files: ["**/*.{ts,tsx}"],
    rules: {
      // TypeScript already reports both of these, and the core rules get them
      // wrong for type-only references and constructor property promotion.
      "no-undef": "off",
      "no-unused-vars": "off",
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      "@typescript-eslint/consistent-type-imports": [
        "error",
        { prefer: "type-imports", fixStyle: "inline-type-imports" },
      ],
      "no-restricted-syntax": [
        "error",
        {
          selector: `JSXAttribute[name.name='className'] Literal[value=${DIRECTIONAL}]`,
          message: DIRECTIONAL_MESSAGE,
        },
        {
          selector: `JSXAttribute[name.name='className'] TemplateElement[value.raw=${DIRECTIONAL}]`,
          message: DIRECTIONAL_MESSAGE,
        },
        {
          selector: `CallExpression[callee.name='cn'] Literal[value=${DIRECTIONAL}]`,
          message: DIRECTIONAL_MESSAGE,
        },
      ],
    },
  },

  {
    // Picture.tsx *is* the image component. It renders the AVIF/WebP set that
    // scripts/optimize-images.ts produces at build time, which is why the
    // platform image optimizer is switched off — so the rule pointing at
    // next/image has nothing left to suggest here.
    files: ["src/components/ui/Picture.tsx"],
    rules: { "@next/next/no-img-element": "off" },
  },

  {
    files: ["scripts/**/*.{ts,tsx,mjs}"],
    rules: { "@typescript-eslint/no-explicit-any": "off" },
  },
);

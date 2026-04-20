import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import prettier from "eslint-config-prettier";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  prettier,
  {
    rules: {
      "@next/next/no-img-element": "off",

      // -- React 베스트 프랙티스 --
      // 컴포넌트 내부에서 컴포넌트를 정의하면 매 렌더마다 재생성되어 상태가 초기화된다
      "react/no-unstable-nested-components": "error",
      // 불필요한 <></> Fragment 제거
      "react/jsx-no-useless-fragment": ["warn", { allowExpressions: true }],
      // 빈 자식이 없는 태그는 self-closing으로 (<div></div> → <div />)
      "react/self-closing-comp": "warn",
      // useState 반환값 네이밍 일관성 ([value, setValue])
      "react/hook-use-state": "warn",
      // target="_blank"에 rel="noopener noreferrer" 강제
      "react/jsx-no-target-blank": "error",

      // -- TypeScript 베스트 프랙티스 --
      // import type { X } 강제 — 런타임 번들에 타입이 포함되지 않도록
      "@typescript-eslint/consistent-type-imports": [
        "warn",
        { prefer: "type-imports", fixStyle: "inline-type-imports" },
      ],

      // -- Import 정리 --
      // 같은 모듈에서 여러 번 import 방지 (하나로 합치기)
      "import/no-duplicates": "warn",

      // -- 일반 --
      // production 코드에 console 남기지 않기 (warn으로 개발 중 허용)
      "no-console": ["warn", { allow: ["warn", "error"] }],
    },
  },
  // Override default ignores of eslint-config-next.
  // 스크립트 디렉토리는 console.log가 주요 출력 수단이므로 no-console 비활성화
  { files: ["scripts/**"], rules: { "no-console": "off" } },
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;

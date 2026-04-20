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
      // import 그룹 정렬 — 외부 패키지 → 내부 모듈 → 상대 경로 순서 일관성
      "import/order": [
        "warn",
        {
          groups: [
            "builtin",
            "external",
            "internal",
            ["parent", "sibling"],
            "index",
            "type",
          ],
          pathGroups: [
            { pattern: "@/**", group: "internal", position: "before" },
          ],
          pathGroupsExcludedImportTypes: ["type"],
          alphabetize: { order: "asc", caseInsensitive: true },
        },
      ],

      // -- 일반 --
      // production 코드에 console 남기지 않기 (warn으로 개발 중 허용)
      "no-console": ["warn", { allow: ["warn", "error"] }],
    },
  },
  // TypeScript 타입 기반 정적 분석 — 비동기 에러를 컴파일 타임에 잡아준다
  {
    files: ["src/**/*.ts", "src/**/*.tsx"],
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      // await 없이 Promise를 무시하면 에러를 놓친다 (가장 중요한 규칙)
      "@typescript-eslint/no-floating-promises": "error",
      // async 함수를 void 반환이 기대되는 곳에 전달 방지
      // (단, JSX 이벤트 핸들러의 async는 허용 — React에서 흔한 패턴)
      "@typescript-eslint/no-misused-promises": [
        "error",
        { checksVoidReturn: { attributes: false } },
      ],
      // thenable이 아닌 값에 await 사용 방지
      "@typescript-eslint/await-thenable": "error",
    },
  },
  // 스크립트 디렉토리는 console.log가 주요 출력 수단이므로 no-console 비활성화
  { files: ["scripts/**"], rules: { "no-console": "off" } },
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;

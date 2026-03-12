---
name: verified-deploy-workflow
description: >
  AI가 생성한 코드를 사람이 이해하고 검증한 후 배포하는 워크플로우.
  Claude Code로 코드를 짠 직후, PR을 올리기 전, 배포하기 전 — 어느 단계에서든
  "이 코드 검증해줘", "배포해도 돼?", "코드 리뷰해줘" 같은 말이 나오면 이 스킬을 사용.
  Next.js / Supabase / Vercel 스택 기준으로 작성되었으나 다른 스택에도 적용 가능.
---

# Verified Deploy Workflow

AI가 짠 코드를 이해 없이 배포하지 않기 위한 3단계 검증 워크플로우.

> **핵심 원칙**: 짜는 속도는 AI에게, 이해하는 책임은 개발자에게.
> 동작하는 코드 ≠ 올바른 코드. 이해한 코드만 배포한다.

---

## 워크플로우 개요

```
[AI 코드 생성]
      ↓
[1단계] 코드 이해 검증     ← "이 코드 설명할 수 있나?"
      ↓
[2단계] 위험 요소 점검     ← "이 코드가 실패하는 케이스는?"
      ↓
[3단계] 배포 전 체크리스트 ← "지금 배포해도 되나?"
      ↓
[배포]
```

---

## 1단계: 코드 이해 검증 (Code Comprehension Check)

AI가 코드를 짜준 직후, 커밋 전에 수행한다.

### 셀프 설명 테스트

변경된 파일을 열고 각 함수/컴포넌트에 대해 아래 질문에 답해본다.
**답하지 못하면 이해한 게 아니다. 넘기지 않는다.**

```
□ 이 함수/컴포넌트가 하는 일을 한 문장으로 설명할 수 있나?
□ 이 코드가 실행되는 시점(트리거)이 언제인가?
□ 입력(props/params)과 출력(return/side effect)이 무엇인가?
□ 왜 이 방식을 선택했나? 다른 방법 대비 트레이드오프는?
□ 이 코드를 삭제하면 어떤 일이 생기나?
```

### AI에게 검증받는 방법

코드를 그냥 "설명해줘"라고 하지 말고, 내 이해를 먼저 말하고 확인받는다.

```
❌ "이 useEffect 설명해줘"

✅ "이 useEffect가 mapRef가 바뀔 때마다 지도를 재초기화하는 거라고
    이해했는데 맞아? 내가 놓친 부분 있어?"
```

이 방식이 이해를 빠르게 교정해준다.

---

## 2단계: 위험 요소 점검 (Risk Scanning)

커밋 전, 변경 범위에 따라 해당 항목을 체크한다.

### A. 데이터/보안

```
□ Supabase RLS: 새 테이블이나 쿼리가 생겼다면 RLS policy가 있는가?
  - anon 유저가 접근하면 안 되는 데이터는 막혀 있는가?
  - service_role key가 클라이언트 코드에 노출되지 않았는가?

□ API Route: /api/* 엔드포인트에 인증 체크가 있는가?
  - 로그인 없이 호출 가능한 엔드포인트가 의도된 것인가?

□ 환경변수: .env.local 값이 실수로 커밋되지 않았는가?
  - NEXT_PUBLIC_ 붙은 변수는 브라우저에 노출됨을 인지하는가?
```

### B. 상태 관리 / 데이터 흐름

```
□ React Query 캐시: 데이터 변경 후 관련 쿼리가 invalidate되는가?
  - 북마크 토글 → 리스트와 지도 마커 동시 반영되는가?

□ Zustand store: 페이지 이동 시 초기화가 필요한 상태가 있는가?
  - 이전 페이지 상태가 다음 페이지에 남아 있지 않은가?

□ useEffect 의존성 배열: exhaustive-deps 경고를 무시하지 않았는가?
  - deps 빠뜨려서 stale closure 생긴 건 아닌가?
```

### C. 지도 / 외부 라이브러리 (배곱 특화)

```
□ Naver Maps 인스턴스: unmount 시 cleanup이 있는가?
  - MapProvider가 제거될 때 map.destroy() 또는 동등한 처리가 있는가?
  - 마커/이벤트 리스너가 누적되지 않는가?

□ useImperativeHandle: ref를 통해 노출된 메서드가 null 체크를 하는가?
  - mapRef.current가 null일 때 호출되는 케이스가 없는가?
```

### D. 성능

```
□ 새로 추가된 컴포넌트에 불필요한 리렌더링이 없는가?
  - 객체/배열 리터럴을 props로 직접 넘기지 않았는가?
  - 무거운 연산에 useMemo/useCallback이 적절히 사용되었는가?

□ Supabase 쿼리: 필요한 컬럼만 select하는가?
  - select('*') 대신 필요한 필드만 명시했는가?
```

### E. 에러 처리

```
□ API 호출 실패 시 사용자에게 적절한 피드백이 있는가?
□ loading/error 상태가 UI에 반영되는가?
□ try-catch 없이 async 함수가 호출되는 곳은 없는가?
```

---

## 3단계: 배포 전 체크리스트 (Pre-Deploy Checklist)

Vercel 배포 버튼을 누르기 전 최종 확인.

### 필수 (모두 통과해야 배포)

```
□ 로컬에서 pnpm build 에러 없이 통과했는가?
□ 변경된 기능을 직접 브라우저에서 클릭해서 확인했는가?
□ 모바일 뷰에서 레이아웃이 깨지지 않는가?
□ console.error / console.warn 이 새로 생기지 않았는가?
□ console.log 디버그 로그를 제거했는가?
□ 하드코딩된 테스트 데이터나 내 계정 ID가 없는가?
```

### 권장 (가능하면 확인)

```
□ Sentry에서 새 에러가 없는가? (배포 후 5분 모니터링)
□ 변경이 영향을 주는 인접 기능을 함께 테스트했는가?
  예) 필터 변경 → 랜덤 추천, 북마크, 지도 마커 모두 확인
□ Preview 배포 URL에서 먼저 확인했는가?
```

### Production 배포 시 추가 확인

```
□ DB 마이그레이션이 있다면 롤백 계획이 있는가?
□ 영향받는 유저 수와 기능 중요도를 고려했는가?
□ 배포 직후 주요 플로우(지도 로드 → 장소 클릭 → 북마크)를 직접 확인할 수 있는가?
```

---

## 빠른 참고: 자주 놓치는 패턴

### 1. AI가 자주 만드는 위험한 코드 패턴

```typescript
// ❌ 위험: 에러 무시
const data = await fetchPlaces().catch(() => null);
renderMap(data); // data가 null이면?

// ✅ 안전: 명시적 처리
const data = await fetchPlaces().catch(() => null);
if (!data) {
  showErrorToast('장소를 불러오지 못했어요');
  return;
}
renderMap(data);
```

```typescript
// ❌ 위험: 클린업 없는 이벤트 리스너
useEffect(() => {
  map.addListener('click', handleClick);
}, [map]);

// ✅ 안전: 클린업 포함
useEffect(() => {
  if (!map) return;
  const listener = map.addListener('click', handleClick);
  return () => naver.maps.Event.removeListener(listener);
}, [map, handleClick]);
```

```typescript
// ❌ 위험: RLS 없는 Supabase 직접 쿼리 (클라이언트)
const { data } = await supabase.from('bookmarks').select('*');
// anon 유저가 모든 북마크를 볼 수 있음

// ✅ 안전: RLS policy + 유저 필터
const { data } = await supabase
  .from('bookmarks')
  .select('place_id')
  .eq('user_id', session.user.id); // RLS가 이중 보호
```

### 2. 이해 못 하고 넘어가면 안 되는 코드

- `any` 타입이 새로 생겼을 때
- `// TODO` 또는 `// FIXME` 주석이 있을 때
- `eslint-disable` 주석이 있을 때
- 함수가 50줄을 넘길 때
- 조건문이 3단계 이상 중첩될 때

이런 코드가 있으면 AI에게 리팩토링을 요청하거나, 이유를 명확히 이해한 후 넘어간다.

---

## Claude Code와 함께 이 워크플로우 사용하기

### CLAUDE.md에 추가할 내용

프로젝트의 `CLAUDE.md`에 아래 내용을 추가하면 Claude Code가 자동으로 검증 포인트를 알려준다.

```markdown
## 코드 생성 후 필수 안내사항

코드를 생성하거나 수정한 후에는 반드시 아래를 함께 제공할 것:

1. **변경 요약**: 무엇을 왜 변경했는지 한 문장
2. **위험 포인트**: 이 변경에서 주의해야 할 부분 (있다면)
3. **테스트 방법**: 이 변경을 검증하는 가장 빠른 방법
4. **영향 범위**: 다른 어떤 기능에 영향을 줄 수 있는지

코드만 던지지 말 것. 개발자가 이해하고 배포할 수 있도록 컨텍스트를 함께 제공할 것.
```

### Claude에게 리뷰 요청하는 방법

```
# 좋은 리뷰 요청 예시

"방금 북마크 토글 기능을 추가했어. [코드 붙여넣기]
내가 이해한 건 이렇고:
- optimistic update로 즉시 UI 반영
- 실패하면 rollback

내가 놓친 위험 요소가 있어?
배포해도 될까?"
```

```
# 피해야 할 요청

"이 코드 괜찮아?" (맥락 없음)
"버그 있어?" (테스트도 안 하고 물어봄)
```

---

## 요약 카드 (빠른 참고용)

```
AI 코드 생성 후 커밋 전:
  1. 각 함수를 한 문장으로 설명할 수 있는가?
  2. 실패 케이스를 말할 수 있는가?

PR / 배포 전:
  3. 보안 (RLS, 인증, env) 체크
  4. 상태 동기화 체크
  5. 직접 브라우저에서 확인
  6. pnpm build 통과

배포 후:
  7. 5분 Sentry 모니터링
  8. 주요 플로우 직접 확인
```

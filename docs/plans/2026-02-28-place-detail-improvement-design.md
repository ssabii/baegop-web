# 장소 상세 개선 (BAE-12) 설계

## 개요

장소 상세 페이지(`/places/[id]`)의 UX/UI를 개선한다. 바로가기 링크를 버튼 탭으로 통합하고, 코나카드 투표 UI를 토글로 변경하고, 메뉴탭 우선 표시, 스태틱 맵, 버그 수정 등 9개 항목을 처리한다.

## 변경 항목

### 1. 바로가기 버튼 탭

- 기본 정보와 코나카드 섹션 사이에 가로 버튼 그룹을 배치한다.
- 버튼: 장소보기, 지도보기, 경로보기, 전화걸기 (각각 아이콘 + 라벨, 세로 배치)
- 기존 주소/도보거리 옆 `ExternalLink` 아이콘과 전화번호 `<a>` 링크를 제거한다.
- 전화번호가 없으면 전화걸기 버튼을 숨긴다.

**파일**: `page.tsx` (서버 컴포넌트에서 바로가기 버튼 영역 추가)

### 2. 0분 → "근처" 표현

- `formatWalkingDuration(0)` → `"근처"` 반환.

**파일**: `src/lib/geo.ts`

### 3. 스태틱 맵 (선택적)

- 바로가기 버튼 + 코나카드 아래에 네이버 Static Map API 이미지를 표시한다.
- `NEXT_PUBLIC_NAVER_MAPS_CLIENT_ID`로 Static Map URL을 생성한다.
- 장소 좌표에 마커를 찍고 줌 레벨 16으로 표시한다.
- 클릭 시 네이버 지도로 이동한다.
- 작업 시간이 오래 걸리면 스킵한다.

**파일**: `page.tsx` 또는 별도 `static-map.tsx` 컴포넌트

### 4. 메뉴탭 순서 변경 + 갯수 표시

- `defaultValue`를 `"menu"`로 변경한다.
- TabsTrigger 순서를 메뉴 → 리뷰로 변경한다.
- 메뉴 1개 이상이면 `메뉴 (N)`, 리뷰 갯수도 `리뷰 (N)` 형식으로 표시한다.

**파일**: `place-detail-tabs.tsx`, `page.tsx` (reviewCount prop 전달)

### 5. 이미지 미리보기 인덱스 버그 수정

- `ImageCarouselDialog`에서 `open` 변경 시 `initialIndex`로 `current`를 리셋한다.
- `api.scrollTo(initialIndex)`를 호출하여 캐러셀도 동기화한다.

**파일**: `src/components/image-preview-dialog.tsx`

### 6. 장소 등록 성공 얼럿

- 현재 `toast.success`는 이미 존재한다.
- 미등록 장소에서 "배곱에 장소를 등록해보세요" 유도 툴팁을 노출한다 (9번과 통합).

### 7. 코나카드 인포 아이콘 + 바텀시트

- "코나카드 결제가 가능한가요?" 옆에 `Info` 아이콘을 추가한다.
- 클릭 시 shadcn `Drawer`(바텀시트)를 표시한다.
  - 제목: "코나카드 결제 여부"
  - 내용: "코나카드 결제가 가능하다면 동료가 알 수 있게 투표해주세요."

**파일**: `kona-vote.tsx`

### 8. 코나카드 투표 토글 변경

- 기존 `Button` 2개를 shadcn `Toggle` 컴포넌트로 변경한다.
- `Check` 아이콘 사용, pressed 상태에서 fill 스타일 적용.
- `isPending` 시 아이콘 대신 `Spinner`를 표시한다.

**파일**: `kona-vote.tsx`

### 9. 미등록 장소 유도 툴팁

- `!isRegistered`일 때 shadcn `Tooltip`으로 "배곱에 장소를 등록해보세요" 메시지를 표시한다.
- "미등록 장소" 배지 또는 액션바의 장소 등록 버튼에 연결한다.
- 한 번 닫으면 `localStorage`로 다시 표시하지 않는다.

**파일**: `place-action-bar.tsx` 또는 `page.tsx`

## 설치 필요 컴포넌트

- `pnpm dlx shadcn@latest add tooltip` (유도 툴팁용)

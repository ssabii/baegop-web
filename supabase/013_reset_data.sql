-- ============================================
-- 배포 전 데이터 초기화
-- ⚠️ 모든 사용자 데이터를 삭제합니다
-- ⚠️ 실행 전 반드시 확인하세요
-- ⚠️ Storage 파일은 Supabase 대시보드에서 수동 삭제
--    (Storage > review-images / profile-images > 전체 선택 > 삭제)
-- ============================================

-- 1. 리뷰 이미지 → 리뷰 → 코나카드 투표 → 장소 (FK 순서)
truncate review_images, reviews, kona_card_votes, places cascade;

-- 2. 프로필 + auth.users (cascade로 profiles 자동 삭제)
delete from auth.users;

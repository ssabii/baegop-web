-- ============================================
-- places 테이블 슬림화
-- 네이버 API에서 실시간으로 가져오는 telephone, naver_link 제거
-- ============================================

-- 1. 데이터 전체 삭제 (연관 테이블은 CASCADE로 함께 삭제)
delete from places;

-- 2. 중복 컬럼 삭제
alter table places
  drop column if exists telephone,
  drop column if exists naver_link;

-- 남은 컬럼:
--   id, name, category, address, description, postal_code, lat, lng,
--   naver_place_id, image_urls,
--   kona_card_status, like_count, dislike_count,
--   created_by, created_at, updated_at

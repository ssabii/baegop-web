-- ============================================
-- int4 → int8 마이그레이션 (dev 환경 전용)
-- Supabase SQL Editor에서 실행
-- ⚠️ 기존 데이터 모두 삭제 후 스키마 재생성
-- ============================================

-- 1. 기존 트리거 삭제
drop trigger if exists on_reaction_change on reactions;
drop trigger if exists on_kona_vote_change on kona_card_votes;
drop trigger if exists set_restaurants_updated_at on restaurants;
drop trigger if exists set_reviews_updated_at on reviews;
drop trigger if exists on_auth_user_created on auth.users;

-- 2. 기존 함수 삭제
drop function if exists update_reaction_counts();
drop function if exists check_kona_votes();
drop function if exists update_updated_at();
drop function if exists handle_new_user();

-- 3. 기존 테이블 삭제 (의존성 순서)
drop table if exists review_images cascade;
drop table if exists reviews cascade;
drop table if exists reactions cascade;
drop table if exists kona_card_votes cascade;
drop table if exists kona_postal_codes cascade;
drop table if exists restaurants cascade;
drop table if exists app_config cascade;
drop table if exists profiles cascade;

-- 4. auth.users 시드 데이터 삭제
delete from auth.users where id in (
  'a1111111-1111-1111-1111-111111111111',
  'b2222222-2222-2222-2222-222222222222',
  'c3333333-3333-3333-3333-333333333333',
  'd4444444-4444-4444-4444-444444444444',
  'e5555555-5555-5555-5555-555555555555'
);

-- 5. 이후 001_schema.sql → 002_rls.sql → 003_functions.sql → 004_storage.sql → 005_seed.sql 순서대로 실행

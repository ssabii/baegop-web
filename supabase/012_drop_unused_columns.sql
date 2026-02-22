-- ============================================
-- 사용하지 않는 컬럼/테이블/트리거 제거
-- ============================================

-- places 사용하지 않는 컬럼 제거
alter table places drop column if exists like_count;
alter table places drop column if exists dislike_count;
alter table places drop column if exists description;
alter table places drop column if exists postal_code;

-- update_reaction_counts 트리거 및 함수 제거
drop trigger if exists on_reaction_change on reactions;
drop function if exists update_reaction_counts();

-- 사용하지 않는 테이블 제거
drop table if exists reactions;
drop table if exists kona_postal_codes;
drop table if exists place_menus;

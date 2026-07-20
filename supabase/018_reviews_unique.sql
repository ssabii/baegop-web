-- ============================================
-- 리뷰 중복 작성 방지 (한 사용자당 장소 1개 리뷰)
-- ============================================
--
-- reviews 테이블에 unique(place_id, user_id) 제약이 없어 한 사용자가
-- 동일 장소에 리뷰를 무제한 작성할 수 있었다. 이는 평균 평점/리뷰 수 조작과
-- 랭킹 포인트(리뷰 5P + 사진 3P) 무한 적립 어뷰징으로 이어진다.
--
-- user_id가 null인 행(탈퇴로 익명화된 리뷰)은 Postgres 기본 동작상
-- 서로 distinct하게 취급되어 제약에 걸리지 않으므로 익명화 로직과 충돌하지 않는다.

-- 1. 기존 중복 데이터 정리: (place_id, user_id)별로 가장 먼저 작성된 리뷰만 남기고 삭제
--    user_id가 null인 익명 리뷰는 대상에서 제외한다.
delete from reviews r
using reviews dup
where r.place_id = dup.place_id
  and r.user_id = dup.user_id
  and r.user_id is not null
  and r.id > dup.id;

-- 2. unique 제약 추가
alter table reviews
  add constraint reviews_place_id_user_id_key unique (place_id, user_id);

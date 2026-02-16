-- ============================================
-- 트리거 함수 place_id 타입 수정 (bigint → text)
-- ============================================
-- 008_places_id_to_naver_id.sql에서 places.id를 text로 변경했으나
-- 트리거 함수의 target_place_id 변수가 bigint로 남아있어
-- 코나카드 투표/반응 시 타입 불일치로 상태 업데이트가 실패하는 버그 수정

-- 1. reactions 변경 시 places.like_count / dislike_count 자동 업데이트
create or replace function update_reaction_counts()
returns trigger as $$
declare
  target_place_id text;
begin
  target_place_id := coalesce(new.place_id, old.place_id);

  update places
  set
    like_count = (select count(*) from reactions where place_id = target_place_id and type = 'like'),
    dislike_count = (select count(*) from reactions where place_id = target_place_id and type = 'dislike')
  where id = target_place_id;

  return coalesce(new, old);
end;
$$ language plpgsql security definer;

-- 2. 코나카드 투표 임계값 초과 시 상태 자동 변경
create or replace function check_kona_votes()
returns trigger as $$
declare
  target_place_id text;
  available_count int;
  unavailable_count int;
  threshold int;
begin
  target_place_id := coalesce(new.place_id, old.place_id);

  select (value::int) into threshold
  from app_config where key = 'kona_vote_threshold';

  threshold := coalesce(threshold, 3);

  select
    count(*) filter (where vote = 'available'),
    count(*) filter (where vote = 'unavailable')
  into available_count, unavailable_count
  from kona_card_votes
  where place_id = target_place_id;

  -- 불가능 투표가 임계값 이상이고 가능 투표보다 많으면 → 불가
  if unavailable_count >= threshold and unavailable_count > available_count then
    update places set kona_card_status = 'unavailable' where id = target_place_id;
  -- 가능 투표가 임계값 이상이고 불가능 투표보다 많으면 → 가능
  elsif available_count >= threshold and available_count > unavailable_count then
    update places set kona_card_status = 'available' where id = target_place_id;
  end if;

  return coalesce(new, old);
end;
$$ language plpgsql security definer;

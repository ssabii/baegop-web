-- ============================================
-- restaurant → place 리네이밍 마이그레이션
-- 기존 DB에 적용하는 마이그레이션 전용 파일
-- ============================================

-- 1. 기존 트리거 drop (테이블 rename 전에 제거)
drop trigger if exists set_restaurants_updated_at on restaurants;
drop trigger if exists on_reaction_change on reactions;
drop trigger if exists on_kona_vote_change on kona_card_votes;

-- 2. 테이블 rename
alter table restaurants rename to places;
alter table restaurant_menus rename to place_menus;

-- 3. 컬럼 rename (restaurant_id → place_id)
alter table reviews rename column restaurant_id to place_id;
alter table reactions rename column restaurant_id to place_id;
alter table kona_card_votes rename column restaurant_id to place_id;
alter table place_menus rename column restaurant_id to place_id;

-- 4. 인덱스 rename
alter index idx_restaurants_category rename to idx_places_category;
alter index idx_restaurants_kona_card_status rename to idx_places_kona_card_status;
alter index idx_restaurants_created_by rename to idx_places_created_by;
alter index idx_reviews_restaurant_id rename to idx_reviews_place_id;
alter index idx_reactions_restaurant_id rename to idx_reactions_place_id;
alter index idx_kona_card_votes_restaurant_id rename to idx_kona_card_votes_place_id;
alter index idx_restaurant_menus_restaurant_id rename to idx_place_menus_place_id;

-- 5. FK constraint rename
alter table reviews rename constraint reviews_restaurant_id_fkey to reviews_place_id_fkey;
alter table reactions rename constraint reactions_restaurant_id_fkey to reactions_place_id_fkey;
alter table kona_card_votes rename constraint kona_card_votes_restaurant_id_fkey to kona_card_votes_place_id_fkey;
alter table place_menus rename constraint restaurant_menus_restaurant_id_fkey to place_menus_place_id_fkey;

-- 6. FK constraint rename (places 테이블 자체의 FK)
alter table places rename constraint restaurants_created_by_fkey to places_created_by_fkey;

-- 7. 함수 재생성: update_reaction_counts()
create or replace function update_reaction_counts()
returns trigger as $$
declare
  target_place_id bigint;
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

-- 8. 함수 재생성: check_kona_votes()
create or replace function check_kona_votes()
returns trigger as $$
declare
  target_place_id bigint;
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

  if unavailable_count >= threshold and unavailable_count > available_count then
    update places set kona_card_status = 'unavailable' where id = target_place_id;
  elsif available_count >= threshold and available_count > unavailable_count then
    update places set kona_card_status = 'available' where id = target_place_id;
  end if;

  return coalesce(new, old);
end;
$$ language plpgsql security definer;

-- 9. 트리거 재생성
create trigger set_places_updated_at
  before update on places
  for each row execute function update_updated_at();

create trigger on_reaction_change
  after insert or update or delete on reactions
  for each row execute function update_reaction_counts();

create trigger on_kona_vote_change
  after insert or update or delete on kona_card_votes
  for each row execute function check_kona_votes();

-- 10. RLS 정책 drop + 재생성 (places)
drop policy if exists "restaurants: 누구나 조회 가능" on places;
drop policy if exists "restaurants: 인증 사용자 등록" on places;
drop policy if exists "restaurants: 등록자만 수정" on places;
drop policy if exists "restaurants: 등록자만 삭제" on places;

create policy "places: 누구나 조회 가능"
  on places for select
  using (true);

create policy "places: 인증 사용자 등록"
  on places for insert
  with check (auth.uid() = created_by);

create policy "places: 등록자만 수정"
  on places for update
  using (auth.uid() = created_by);

create policy "places: 등록자만 삭제"
  on places for delete
  using (auth.uid() = created_by);

-- 11. RLS 정책 drop + 재생성 (place_menus)
drop policy if exists "restaurant_menus: 누구나 조회 가능" on place_menus;

create policy "place_menus: 누구나 조회 가능"
  on place_menus for select
  using (true);

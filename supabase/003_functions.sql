-- ============================================
-- 함수 & 트리거
-- ============================================

-- 1. 신규 사용자 가입 시 profiles 자동 생성
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, nickname, avatar_url)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data ->> 'avatar_url', new.raw_user_meta_data ->> 'picture')
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- 2. reactions 변경 시 places.like_count / dislike_count 자동 업데이트
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

create trigger on_reaction_change
  after insert or update or delete on reactions
  for each row execute function update_reaction_counts();

-- 3. 코나카드 투표 임계값 초과 시 상태 자동 변경
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

create trigger on_kona_vote_change
  after insert or update or delete on kona_card_votes
  for each row execute function check_kona_votes();

-- 4. updated_at 자동 갱신
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger set_places_updated_at
  before update on places
  for each row execute function update_updated_at();

create trigger set_reviews_updated_at
  before update on reviews
  for each row execute function update_updated_at();

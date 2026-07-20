-- ============================================
-- 장소 리뷰 집계 컬럼 (avg_rating, review_count) + 트리거
-- ============================================
--
-- 기존 /places 목록은 평점/리뷰순 정렬 시 places 전체 + 각 place의 모든 reviews를
-- 매 페이지 요청마다 전량 조회한 뒤 JS에서 정렬/슬라이스했다. 데이터가 늘수록
-- 트래픽과 응답이 선형으로 악화된다.
--
-- places에 트리거로 유지되는 집계 컬럼을 두어 DB 레벨 ORDER + RANGE 페이지네이션이
-- 가능하도록 한다. (코드 측 전환은 db:types 재생성 후 후속 작업에서 진행)

-- 1. 집계 컬럼 추가
alter table places
  add column avg_rating real,
  add column review_count integer not null default 0;

-- 2. 기존 데이터 백필
update places p
set
  review_count = coalesce(sub.cnt, 0),
  avg_rating = sub.avg
from (
  select place_id, count(*)::int as cnt, avg(rating)::real as avg
  from reviews
  group by place_id
) sub
where p.id = sub.place_id;

-- 3. 특정 장소의 집계를 재계산하는 함수
create or replace function refresh_place_review_stats(target_place_id text)
returns void as $$
  update places set
    review_count = (select count(*) from reviews where place_id = target_place_id),
    avg_rating = (select avg(rating)::real from reviews where place_id = target_place_id)
  where id = target_place_id;
$$ language sql security definer;

-- 4. reviews 변경 시 해당 장소 집계 갱신
create or replace function on_review_change()
returns trigger as $$
begin
  perform refresh_place_review_stats(coalesce(new.place_id, old.place_id));
  -- 리뷰의 place_id가 바뀌는 경우(예외적) 이전 장소도 갱신
  if (tg_op = 'UPDATE' and new.place_id is distinct from old.place_id) then
    perform refresh_place_review_stats(old.place_id);
  end if;
  return coalesce(new, old);
end;
$$ language plpgsql security definer;

create trigger on_reviews_stats_change
  after insert or update or delete on reviews
  for each row execute function on_review_change();

-- 5. 정렬 + 페이지네이션용 인덱스
create index idx_places_avg_rating
  on places (avg_rating desc nulls last, review_count desc, id);
create index idx_places_review_count
  on places (review_count desc, id);
create index idx_places_created_at
  on places (created_at desc, id);

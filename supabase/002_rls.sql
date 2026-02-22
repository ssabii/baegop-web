-- ============================================
-- Row Level Security (RLS) 정책
-- ============================================

-- RLS 활성화
alter table profiles enable row level security;
alter table places enable row level security;
alter table kona_card_votes enable row level security;
alter table app_config enable row level security;
alter table reviews enable row level security;
alter table review_images enable row level security;
-- ============================================
-- app_config
-- ============================================
create policy "app_config: 누구나 조회 가능"
  on app_config for select
  using (true);

-- ============================================
-- profiles
-- ============================================
create policy "profiles: 누구나 조회 가능"
  on profiles for select
  using (true);

create policy "profiles: 본인만 수정"
  on profiles for update
  using (auth.uid() = id);

-- ============================================
-- places
-- ============================================
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

-- ============================================
-- kona_card_votes
-- ============================================
create policy "kona_card_votes: 누구나 조회 가능"
  on kona_card_votes for select
  using (true);

create policy "kona_card_votes: 인증 사용자 투표"
  on kona_card_votes for insert
  with check (auth.uid() = user_id);

create policy "kona_card_votes: 본인 투표 수정"
  on kona_card_votes for update
  using (auth.uid() = user_id);

create policy "kona_card_votes: 본인 투표 삭제"
  on kona_card_votes for delete
  using (auth.uid() = user_id);

-- ============================================
-- reviews
-- ============================================
create policy "reviews: 누구나 조회 가능"
  on reviews for select
  using (true);

create policy "reviews: 인증 사용자 작성"
  on reviews for insert
  with check (auth.uid() = user_id);

create policy "reviews: 작성자만 수정"
  on reviews for update
  using (auth.uid() = user_id);

create policy "reviews: 작성자만 삭제"
  on reviews for delete
  using (auth.uid() = user_id);

-- ============================================
-- review_images
-- ============================================
create policy "review_images: 누구나 조회 가능"
  on review_images for select
  using (true);

create policy "review_images: 리뷰 작성자만 추가"
  on review_images for insert
  with check (
    auth.uid() = (select user_id from reviews where id = review_id)
  );

create policy "review_images: 리뷰 작성자만 삭제"
  on review_images for delete
  using (
    auth.uid() = (select user_id from reviews where id = review_id)
  );


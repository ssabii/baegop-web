-- ============================================
-- 피드백 (feedbacks / feedback_images) 테이블 + Storage
-- ============================================

-- 1. 테이블 생성
create table feedbacks (
  id bigint generated always as identity primary key,
  user_id uuid references auth.users(id) on delete set null,
  category text not null default 'bug',
  content text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table feedback_images (
  id bigint generated always as identity primary key,
  feedback_id bigint not null references feedbacks(id) on delete cascade,
  url text not null,
  display_order smallint not null default 0,
  created_at timestamptz not null default now()
);

create index idx_feedbacks_user_id_created_at on feedbacks(user_id, created_at desc);
create index idx_feedback_images_feedback_id on feedback_images(feedback_id);

-- 2. RLS
alter table feedbacks enable row level security;
alter table feedback_images enable row level security;

create policy "feedbacks: 본인 조회"
  on feedbacks for select
  using (auth.uid() = user_id);

create policy "feedbacks: 인증 사용자 작성"
  on feedbacks for insert
  with check (auth.uid() = user_id);

create policy "feedbacks: 작성자만 수정"
  on feedbacks for update
  using (auth.uid() = user_id);

create policy "feedbacks: 작성자만 삭제"
  on feedbacks for delete
  using (auth.uid() = user_id);

create policy "feedback_images: 본인 피드백 이미지 조회"
  on feedback_images for select
  using (
    auth.uid() = (select user_id from feedbacks where id = feedback_id)
  );

create policy "feedback_images: 피드백 작성자만 추가"
  on feedback_images for insert
  with check (
    auth.uid() = (select user_id from feedbacks where id = feedback_id)
  );

create policy "feedback_images: 피드백 작성자만 삭제"
  on feedback_images for delete
  using (
    auth.uid() = (select user_id from feedbacks where id = feedback_id)
  );

-- 3. Storage: feedback-images 버킷
insert into storage.buckets (id, name, public)
values ('feedback-images', 'feedback-images', true);

create policy "feedback-images: 누구나 조회"
  on storage.objects for select
  using (bucket_id = 'feedback-images');

create policy "feedback-images: 인증 사용자 업로드"
  on storage.objects for insert
  with check (bucket_id = 'feedback-images' and auth.role() = 'authenticated');

create policy "feedback-images: 본인 이미지 수정"
  on storage.objects for update
  using (bucket_id = 'feedback-images' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "feedback-images: 본인 이미지 삭제"
  on storage.objects for delete
  using (bucket_id = 'feedback-images' and auth.uid()::text = (storage.foldername(name))[1]);

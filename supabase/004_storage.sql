-- ============================================
-- Supabase Storage
-- ============================================

-- 1. 리뷰 이미지 버킷
insert into storage.buckets (id, name, public)
values ('review-images', 'review-images', true);

create policy "review-images: 누구나 조회"
  on storage.objects for select
  using (bucket_id = 'review-images');

create policy "review-images: 인증 사용자 업로드"
  on storage.objects for insert
  with check (bucket_id = 'review-images' and auth.role() = 'authenticated');

create policy "review-images: 본인 이미지 삭제"
  on storage.objects for delete
  using (bucket_id = 'review-images' and auth.uid()::text = (storage.foldername(name))[1]);

-- 2. 프로필 이미지 버킷
insert into storage.buckets (id, name, public)
values ('profile-images', 'profile-images', true);

create policy "profile-images: 누구나 조회"
  on storage.objects for select
  using (bucket_id = 'profile-images');

create policy "profile-images: 본인만 업로드"
  on storage.objects for insert
  with check (bucket_id = 'profile-images' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "profile-images: 본인만 수정"
  on storage.objects for update
  using (bucket_id = 'profile-images' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "profile-images: 본인만 삭제"
  on storage.objects for delete
  using (bucket_id = 'profile-images' and auth.uid()::text = (storage.foldername(name))[1]);

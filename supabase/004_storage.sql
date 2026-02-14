-- ============================================
-- Supabase Storage (리뷰 이미지 업로드용)
-- ============================================

-- 리뷰 이미지 버킷 생성
insert into storage.buckets (id, name, public)
values ('review-images', 'review-images', true);

-- 누구나 이미지 조회 가능
create policy "review-images: 누구나 조회"
  on storage.objects for select
  using (bucket_id = 'review-images');

-- 인증 사용자만 업로드
create policy "review-images: 인증 사용자 업로드"
  on storage.objects for insert
  with check (bucket_id = 'review-images' and auth.role() = 'authenticated');

-- 본인이 업로드한 이미지만 삭제
create policy "review-images: 본인 이미지 삭제"
  on storage.objects for delete
  using (bucket_id = 'review-images' and auth.uid()::text = (storage.foldername(name))[1]);

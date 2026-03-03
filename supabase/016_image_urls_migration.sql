-- ============================================
-- 이미지 테이블 제거 → image_urls 배열 컬럼 마이그레이션
-- review_images / feedback_images 테이블을 제거하고
-- reviews / feedbacks 테이블에 image_urls text[] 컬럼 추가
-- ============================================

-- 1. reviews 테이블에 image_urls 컬럼 추가
alter table reviews add column image_urls text[];

-- 2. feedbacks 테이블에 image_urls 컬럼 추가
alter table feedbacks add column image_urls text[];

-- 3. 기존 데이터 마이그레이션 (이미지 없으면 null 유지)
update reviews r
set image_urls = (
  select array_agg(ri.url order by ri.display_order)
  from review_images ri
  where ri.review_id = r.id
);

update feedbacks f
set image_urls = (
  select array_agg(fi.url order by fi.display_order)
  from feedback_images fi
  where fi.feedback_id = f.id
);

-- 4. review_images RLS 정책 drop
drop policy if exists "review_images: 누구나 조회 가능" on review_images;
drop policy if exists "review_images: 리뷰 작성자만 추가" on review_images;
drop policy if exists "review_images: 리뷰 작성자만 삭제" on review_images;

-- 5. feedback_images RLS 정책 drop
drop policy if exists "feedback_images: 본인 피드백 이미지 조회" on feedback_images;
drop policy if exists "feedback_images: 피드백 작성자만 추가" on feedback_images;
drop policy if exists "feedback_images: 피드백 작성자만 삭제" on feedback_images;

-- 6. 테이블 drop
drop table review_images;
drop table feedback_images;

-- 7. feedback-images Storage RLS 정책 변경
-- 기존: path = {userId}/{uuid}.{ext} → (foldername)[1] = userId
-- 신규: path = {feedbackId}/{userId}/{uuid}.{ext} → (foldername)[2] = userId
drop policy if exists "feedback-images: 본인 이미지 수정" on storage.objects;
drop policy if exists "feedback-images: 본인 이미지 삭제" on storage.objects;

create policy "feedback-images: 본인 이미지 수정"
  on storage.objects for update
  using (bucket_id = 'feedback-images' and auth.uid()::text = (storage.foldername(name))[2]);

create policy "feedback-images: 본인 이미지 삭제"
  on storage.objects for delete
  using (bucket_id = 'feedback-images' and auth.uid()::text = (storage.foldername(name))[2]);

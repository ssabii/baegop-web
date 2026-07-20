-- ============================================
-- Storage 삭제/수정 정책 경로 인덱스 수정
-- ============================================
--
-- review-images / feedback-images 버킷의 update·delete 정책이
-- `(storage.foldername(name))[1]`(= 첫 폴더)을 소유자 user_id로 가정했으나,
-- 실제 업로드 경로는 각각 `{place_id}/{user_id}/...`, `{feedback_id}/{user_id}/...`
-- 구조라 첫 폴더는 place_id/feedback_id이고 user_id는 두 번째 폴더다.
--
-- 그 결과 사용자가 자신의 리뷰/피드백을 직접 삭제·수정해도 storage.remove()가
-- RLS로 조용히 실패해 이미지 파일이 고아로 남았다. 인덱스를 [2]로 수정하면
-- 기존 파일 이동 없이 기존·신규 파일 모두 올바르게 소유권이 판정된다.
--
-- (회원탈퇴 시 콘텐츠/이미지 유지 정책과는 무관 — 이건 본인이 직접 삭제하는 경로다)

-- review-images
drop policy "review-images: 본인 이미지 수정" on storage.objects;
drop policy "review-images: 본인 이미지 삭제" on storage.objects;

create policy "review-images: 본인 이미지 수정"
  on storage.objects for update
  using (bucket_id = 'review-images' and auth.uid()::text = (storage.foldername(name))[2]);

create policy "review-images: 본인 이미지 삭제"
  on storage.objects for delete
  using (bucket_id = 'review-images' and auth.uid()::text = (storage.foldername(name))[2]);

-- feedback-images
drop policy "feedback-images: 본인 이미지 수정" on storage.objects;
drop policy "feedback-images: 본인 이미지 삭제" on storage.objects;

create policy "feedback-images: 본인 이미지 수정"
  on storage.objects for update
  using (bucket_id = 'feedback-images' and auth.uid()::text = (storage.foldername(name))[2]);

create policy "feedback-images: 본인 이미지 삭제"
  on storage.objects for delete
  using (bucket_id = 'feedback-images' and auth.uid()::text = (storage.foldername(name))[2]);

-- 회원탈퇴 시 장소/리뷰를 보존하기 위해 FK를 ON DELETE SET NULL로 변경

-- places.created_by: 이미 nullable, FK만 변경
alter table places
  drop constraint places_created_by_fkey,
  add constraint places_created_by_fkey
    foreign key (created_by) references profiles(id) on delete set null;

-- reviews.user_id: NOT NULL 제거 + FK 변경
alter table reviews
  alter column user_id drop not null;

alter table reviews
  drop constraint reviews_user_id_fkey,
  add constraint reviews_user_id_fkey
    foreign key (user_id) references profiles(id) on delete set null;

-- kona_card_votes: 탈퇴 시 투표 삭제
alter table kona_card_votes
  drop constraint kona_card_votes_user_id_fkey,
  add constraint kona_card_votes_user_id_fkey
    foreign key (user_id) references profiles(id) on delete cascade;

-- reactions: 탈퇴 시 리액션 삭제
alter table reactions
  drop constraint reactions_user_id_fkey,
  add constraint reactions_user_id_fkey
    foreign key (user_id) references profiles(id) on delete cascade;

-- 회원탈퇴 처리 함수 (스토리지 owner 해제 + auth.users 삭제를 한 트랜잭션에서 처리)
create or replace function delete_user_account(target_user_id uuid)
returns void as $$
begin
  update storage.objects set owner = null where owner = target_user_id;
  delete from auth.users where id = target_user_id;
end;
$$ language plpgsql security definer;
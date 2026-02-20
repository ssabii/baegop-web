-- 더 이상 사용하지 않는 RPC 함수 제거
-- auth.admin.deleteUser()로 대체되어 불필요
drop function if exists delete_user_account(uuid);

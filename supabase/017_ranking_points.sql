-- 포인트 기반 랭킹 시스템
-- 포인트 배분: 장소 등록 2P, 리뷰 5P, 리뷰 사진 3P/장, 코나카드 투표 1P

-- 1. profiles 테이블에 total_points 컬럼 추가
ALTER TABLE profiles ADD COLUMN total_points integer NOT NULL DEFAULT 0;

-- 2. 포인트 재계산 함수
CREATE OR REPLACE FUNCTION recalculate_user_points(target_user_id uuid)
RETURNS void AS $$
DECLARE
  points integer;
BEGIN
  SELECT
    COALESCE((SELECT COUNT(*) FROM places WHERE created_by = target_user_id), 0) * 2 +
    COALESCE((SELECT COUNT(*) FROM reviews WHERE user_id = target_user_id), 0) * 5 +
    COALESCE((SELECT SUM(COALESCE(array_length(image_urls, 1), 0)) FROM reviews WHERE user_id = target_user_id), 0) * 3 +
    COALESCE((SELECT COUNT(*) FROM kona_card_votes WHERE user_id = target_user_id), 0) * 1
  INTO points;

  UPDATE profiles SET total_points = points WHERE id = target_user_id;
END;
$$ LANGUAGE plpgsql;

-- 3. 트리거 함수 (reviews)
CREATE OR REPLACE FUNCTION trigger_recalculate_points_review()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    IF OLD.user_id IS NOT NULL THEN
      PERFORM recalculate_user_points(OLD.user_id);
    END IF;
    RETURN OLD;
  ELSE
    IF NEW.user_id IS NOT NULL THEN
      PERFORM recalculate_user_points(NEW.user_id);
    END IF;
    -- UPDATE에서 user_id가 변경된 경우 (익명화) 이전 유저도 재계산
    IF TG_OP = 'UPDATE' AND OLD.user_id IS DISTINCT FROM NEW.user_id AND OLD.user_id IS NOT NULL THEN
      PERFORM recalculate_user_points(OLD.user_id);
    END IF;
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- 4. 트리거 함수 (places)
CREATE OR REPLACE FUNCTION trigger_recalculate_points_place()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    IF OLD.created_by IS NOT NULL THEN
      PERFORM recalculate_user_points(OLD.created_by);
    END IF;
    RETURN OLD;
  ELSE
    IF NEW.created_by IS NOT NULL THEN
      PERFORM recalculate_user_points(NEW.created_by);
    END IF;
    IF TG_OP = 'UPDATE' AND OLD.created_by IS DISTINCT FROM NEW.created_by AND OLD.created_by IS NOT NULL THEN
      PERFORM recalculate_user_points(OLD.created_by);
    END IF;
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- 5. 트리거 함수 (kona_card_votes)
CREATE OR REPLACE FUNCTION trigger_recalculate_points_vote()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    PERFORM recalculate_user_points(OLD.user_id);
    RETURN OLD;
  ELSE
    PERFORM recalculate_user_points(NEW.user_id);
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- 6. 트리거 생성
CREATE TRIGGER trg_reviews_points
  AFTER INSERT OR DELETE OR UPDATE OF image_urls, user_id ON reviews
  FOR EACH ROW EXECUTE FUNCTION trigger_recalculate_points_review();

CREATE TRIGGER trg_places_points
  AFTER INSERT OR DELETE OR UPDATE OF created_by ON places
  FOR EACH ROW EXECUTE FUNCTION trigger_recalculate_points_place();

CREATE TRIGGER trg_votes_points
  AFTER INSERT OR DELETE ON kona_card_votes
  FOR EACH ROW EXECUTE FUNCTION trigger_recalculate_points_vote();

-- 7. 초기 마이그레이션: 기존 유저 포인트 일괄 계산
SELECT recalculate_user_points(id) FROM profiles;

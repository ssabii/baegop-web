-- ============================================
-- places.id를 naver_place_id(text)로 변경
-- FK 참조 테이블: kona_card_votes, reviews, reactions
-- ============================================

BEGIN;

-- 1. FK 제약 해제
ALTER TABLE kona_card_votes DROP CONSTRAINT kona_card_votes_place_id_fkey;
ALTER TABLE reviews DROP CONSTRAINT reviews_place_id_fkey;
ALTER TABLE reactions DROP CONSTRAINT reactions_place_id_fkey;

-- 2. 자식 테이블 place_id를 text로 변환 (naver_place_id 값 매핑)
ALTER TABLE kona_card_votes ADD COLUMN place_id_new text;
UPDATE kona_card_votes SET place_id_new = (SELECT naver_place_id FROM places WHERE places.id = kona_card_votes.place_id);
ALTER TABLE kona_card_votes DROP COLUMN place_id;
ALTER TABLE kona_card_votes RENAME COLUMN place_id_new TO place_id;
ALTER TABLE kona_card_votes ALTER COLUMN place_id SET NOT NULL;

ALTER TABLE reviews ADD COLUMN place_id_new text;
UPDATE reviews SET place_id_new = (SELECT naver_place_id FROM places WHERE places.id = reviews.place_id);
ALTER TABLE reviews DROP COLUMN place_id;
ALTER TABLE reviews RENAME COLUMN place_id_new TO place_id;
ALTER TABLE reviews ALTER COLUMN place_id SET NOT NULL;

ALTER TABLE reactions ADD COLUMN place_id_new text;
UPDATE reactions SET place_id_new = (SELECT naver_place_id FROM places WHERE places.id = reactions.place_id);
ALTER TABLE reactions DROP COLUMN place_id;
ALTER TABLE reactions RENAME COLUMN place_id_new TO place_id;
ALTER TABLE reactions ALTER COLUMN place_id SET NOT NULL;

-- 3. places PK를 text로 변환
DO $$ DECLARE pk text;
BEGIN
  SELECT conname INTO pk FROM pg_constraint
  WHERE conrelid = 'places'::regclass AND contype = 'p';
  EXECUTE format('ALTER TABLE places DROP CONSTRAINT %I', pk);
END $$;
ALTER TABLE places DROP COLUMN id;
ALTER TABLE places RENAME COLUMN naver_place_id TO id;
ALTER TABLE places ALTER COLUMN id SET NOT NULL;
ALTER TABLE places ADD PRIMARY KEY (id);

-- 4. FK 재생성
ALTER TABLE kona_card_votes ADD CONSTRAINT kona_card_votes_place_id_fkey FOREIGN KEY (place_id) REFERENCES places(id) ON DELETE CASCADE;
ALTER TABLE reviews ADD CONSTRAINT reviews_place_id_fkey FOREIGN KEY (place_id) REFERENCES places(id) ON DELETE CASCADE;
ALTER TABLE reactions ADD CONSTRAINT reactions_place_id_fkey FOREIGN KEY (place_id) REFERENCES places(id) ON DELETE CASCADE;

-- 5. unique 제약 재생성 (place_id 컬럼 재생성으로 인해 필요)
DROP INDEX IF EXISTS kona_card_votes_place_id_user_id_key;
ALTER TABLE kona_card_votes ADD CONSTRAINT kona_card_votes_place_id_user_id_key UNIQUE (place_id, user_id);

DROP INDEX IF EXISTS reactions_place_id_user_id_key;
ALTER TABLE reactions ADD CONSTRAINT reactions_place_id_user_id_key UNIQUE (place_id, user_id);

-- 6. 인덱스 재생성
DROP INDEX IF EXISTS idx_reviews_place_id;
CREATE INDEX idx_reviews_place_id ON reviews(place_id);

DROP INDEX IF EXISTS idx_reactions_place_id;
CREATE INDEX idx_reactions_place_id ON reactions(place_id);

DROP INDEX IF EXISTS idx_kona_card_votes_place_id;
CREATE INDEX idx_kona_card_votes_place_id ON kona_card_votes(place_id);

COMMIT;

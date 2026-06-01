-- Funkcja budująca wektor wyszukiwania z komentarza
CREATE OR REPLACE FUNCTION review_comment_search_update() RETURNS trigger AS $$
BEGIN
    NEW."commentSearch" := to_tsvector('simple', coalesce(NEW."comment", ''));
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger: aktualizuje commentSearch przy wstawieniu/zmianie komentarza
CREATE TRIGGER review_comment_search_trigger
    BEFORE INSERT OR UPDATE OF "comment" ON "Review"
    FOR EACH ROW EXECUTE FUNCTION review_comment_search_update();

-- Wypełnij istniejące wiersze (gdyby jakieś już były)
UPDATE "Review" SET "commentSearch" = to_tsvector('simple', coalesce("comment", ''));

-- Indeks GIN — szybkie wyszukiwanie pełnotekstowe (wym. 11)
CREATE INDEX "review_comment_search_idx" ON "Review" USING GIN ("commentSearch");
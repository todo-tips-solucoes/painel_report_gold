-- Table: public.TicketTags

-- DROP TABLE IF EXISTS public."TicketTags";

CREATE TABLE IF NOT EXISTS public."TicketTags"
(
    "ticketId" integer NOT NULL,
    "tagId" integer NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    disparei integer DEFAULT 0,
    processing boolean DEFAULT false,
    id integer NOT NULL DEFAULT nextval('"TicketTags_id_seq"'::regclass),
    CONSTRAINT "TicketTags_tagId_fkey" FOREIGN KEY ("tagId")
        REFERENCES public."Tags" (id) MATCH SIMPLE
        ON UPDATE CASCADE
        ON DELETE CASCADE,
    CONSTRAINT "TicketTags_ticketId_fkey" FOREIGN KEY ("ticketId")
        REFERENCES public."Tickets" (id) MATCH SIMPLE
        ON UPDATE CASCADE
        ON DELETE CASCADE
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public."TicketTags"
    OWNER to todotips;
-- Index: idx_cleanup_tickettags_ticketid

-- DROP INDEX IF EXISTS public.idx_cleanup_tickettags_ticketid;

CREATE INDEX IF NOT EXISTS idx_cleanup_tickettags_ticketid
    ON public."TicketTags" USING btree
    ("ticketId" ASC NULLS LAST)
    TABLESPACE pg_default
    WHERE "ticketId" IS NOT NULL;
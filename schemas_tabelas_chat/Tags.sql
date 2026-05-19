-- Table: public.Tags

-- DROP TABLE IF EXISTS public."Tags";

CREATE TABLE IF NOT EXISTS public."Tags"
(
    id integer NOT NULL DEFAULT nextval('"Tags_id_seq"'::regclass),
    name character varying(255) COLLATE pg_catalog."default" NOT NULL,
    color character varying(255) COLLATE pg_catalog."default",
    kanban integer,
    "companyId" integer NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    prioridade integer NOT NULL DEFAULT 0,
    conversao text COLLATE pg_catalog."default",
    "flowsId" integer,
    automation integer,
    "tagType" text COLLATE pg_catalog."default" DEFAULT 'Atendimento'::text,
    access_token text COLLATE pg_catalog."default",
    pixel text COLLATE pg_catalog."default",
    custom_data text COLLATE pg_catalog."default",
    source text COLLATE pg_catalog."default",
    "resumeAt" text COLLATE pg_catalog."default",
    "stopAt" text COLLATE pg_catalog."default",
    weekends integer DEFAULT 0,
    CONSTRAINT "Tags_pkey" PRIMARY KEY (id),
    CONSTRAINT "Tags_companyId_fkey" FOREIGN KEY ("companyId")
        REFERENCES public."Companies" (id) MATCH SIMPLE
        ON UPDATE CASCADE
        ON DELETE CASCADE
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public."Tags"
    OWNER to todotips;
-- Index: idx_tg_company_id

-- DROP INDEX IF EXISTS public.idx_tg_company_id;

CREATE INDEX IF NOT EXISTS idx_tg_company_id
    ON public."Tags" USING btree
    ("companyId" ASC NULLS LAST)
    TABLESPACE pg_default;
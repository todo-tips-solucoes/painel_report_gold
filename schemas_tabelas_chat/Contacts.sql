-- Table: public.CrmTags

-- DROP TABLE IF EXISTS public."CrmTags";

CREATE TABLE IF NOT EXISTS public."CrmTags"
(
    id integer NOT NULL DEFAULT nextval('"CrmTags_id_seq"'::regclass),
    "oportunidadeId" integer NOT NULL,
    "tagId" integer NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    disparei integer DEFAULT 0,
    processing boolean DEFAULT false,
    CONSTRAINT "CrmTags_pkey" PRIMARY KEY (id),
    CONSTRAINT "CrmTags_oportunidadeId_fkey" FOREIGN KEY ("oportunidadeId")
        REFERENCES public."Oportunidades" (id) MATCH SIMPLE
        ON UPDATE CASCADE
        ON DELETE CASCADE,
    CONSTRAINT "CrmTags_tagId_fkey" FOREIGN KEY ("tagId")
        REFERENCES public."Tags" (id) MATCH SIMPLE
        ON UPDATE CASCADE
        ON DELETE CASCADE
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public."CrmTags"
    OWNER to todotips2;
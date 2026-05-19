-- Table: public.Oportunidades

-- DROP TABLE IF EXISTS public."Oportunidades";

CREATE TABLE IF NOT EXISTS public."Oportunidades"
(
    id integer NOT NULL DEFAULT nextval('"Oportunidades_id_seq"'::regclass),
    "companyId" integer NOT NULL,
    name character varying(255) COLLATE pg_catalog."default" NOT NULL,
    funil character varying(255) COLLATE pg_catalog."default",
    etapadofunil character varying(255) COLLATE pg_catalog."default",
    fonte character varying(255) COLLATE pg_catalog."default",
    campanha character varying(255) COLLATE pg_catalog."default",
    datadeida character varying(255) COLLATE pg_catalog."default",
    datadevolta character varying(255) COLLATE pg_catalog."default",
    origem character varying(255) COLLATE pg_catalog."default",
    destino character varying(255) COLLATE pg_catalog."default",
    valor character varying(255) COLLATE pg_catalog."default",
    produto text COLLATE pg_catalog."default",
    "userId" integer NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    free1 character varying(255) COLLATE pg_catalog."default",
    free2 character varying(255) COLLATE pg_catalog."default",
    free3 character varying(255) COLLATE pg_catalog."default",
    free4 character varying(255) COLLATE pg_catalog."default",
    "ticketId" integer NOT NULL,
    "contactId" integer NOT NULL,
    message character varying(4096) COLLATE pg_catalog."default",
    CONSTRAINT "Oportunidades_pkey" PRIMARY KEY (id),
    CONSTRAINT "Oportunidades_companyId_fkey" FOREIGN KEY ("companyId")
        REFERENCES public."Companies" (id) MATCH SIMPLE
        ON UPDATE CASCADE
        ON DELETE CASCADE,
    CONSTRAINT "Oportunidades_contactId_fkey" FOREIGN KEY ("contactId")
        REFERENCES public."Contacts" (id) MATCH SIMPLE
        ON UPDATE CASCADE
        ON DELETE CASCADE,
    CONSTRAINT "Oportunidades_ticketId_fkey" FOREIGN KEY ("ticketId")
        REFERENCES public."Tickets" (id) MATCH SIMPLE
        ON UPDATE CASCADE
        ON DELETE CASCADE,
    CONSTRAINT "Oportunidades_userId_fkey" FOREIGN KEY ("userId")
        REFERENCES public."Users" (id) MATCH SIMPLE
        ON UPDATE CASCADE
        ON DELETE CASCADE
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public."Oportunidades"
    OWNER to todotips;
-- Index: idx_cleanup_oportunidades_contactid

-- DROP INDEX IF EXISTS public.idx_cleanup_oportunidades_contactid;

CREATE INDEX IF NOT EXISTS idx_cleanup_oportunidades_contactid
    ON public."Oportunidades" USING btree
    ("contactId" ASC NULLS LAST)
    TABLESPACE pg_default
    WHERE "contactId" IS NOT NULL;
-- Index: idx_cleanup_oportunidades_ticketid

-- DROP INDEX IF EXISTS public.idx_cleanup_oportunidades_ticketid;

CREATE INDEX IF NOT EXISTS idx_cleanup_oportunidades_ticketid
    ON public."Oportunidades" USING btree
    ("ticketId" ASC NULLS LAST)
    TABLESPACE pg_default
    WHERE "ticketId" IS NOT NULL;
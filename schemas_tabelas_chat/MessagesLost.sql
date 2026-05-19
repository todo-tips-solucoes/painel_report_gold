-- Table: public.MessagesLost

-- DROP TABLE IF EXISTS public."MessagesLost";

CREATE TABLE IF NOT EXISTS public."MessagesLost"
(
    id integer NOT NULL DEFAULT nextval('"MessagesLost_id_seq"'::regclass),
    body text COLLATE pg_catalog."default" NOT NULL,
    wid character varying(255) COLLATE pg_catalog."default",
    "remoteJid" text COLLATE pg_catalog."default",
    payload text COLLATE pg_catalog."default",
    received integer DEFAULT 0,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    "companyId" integer,
    "whatsappId" integer,
    "payloadComplete" character varying(4096) COLLATE pg_catalog."default",
    CONSTRAINT "MessagesLost_pkey" PRIMARY KEY (id),
    CONSTRAINT "MessagesLost_companyId_fkey" FOREIGN KEY ("companyId")
        REFERENCES public."Companies" (id) MATCH SIMPLE
        ON UPDATE CASCADE
        ON DELETE SET NULL,
    CONSTRAINT "MessagesLost_companyId_fkey1" FOREIGN KEY ("companyId")
        REFERENCES public."Companies" (id) MATCH SIMPLE
        ON UPDATE CASCADE
        ON DELETE SET NULL,
    CONSTRAINT "MessagesLost_companyId_fkey2" FOREIGN KEY ("companyId")
        REFERENCES public."Companies" (id) MATCH SIMPLE
        ON UPDATE CASCADE
        ON DELETE SET NULL,
    CONSTRAINT "MessagesLost_whatsappId_fkey" FOREIGN KEY ("whatsappId")
        REFERENCES public."Whatsapps" (id) MATCH SIMPLE
        ON UPDATE CASCADE
        ON DELETE SET NULL
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public."MessagesLost"
    OWNER to todotips;
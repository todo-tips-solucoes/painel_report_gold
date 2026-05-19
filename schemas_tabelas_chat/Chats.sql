-- Table: public.Chats

-- DROP TABLE IF EXISTS public."Chats";

CREATE TABLE IF NOT EXISTS public."Chats"
(
    id integer NOT NULL DEFAULT nextval('"Chats_id_seq"'::regclass),
    title text COLLATE pg_catalog."default" DEFAULT ''::text,
    uuid character varying(255) COLLATE pg_catalog."default" DEFAULT ''::character varying,
    "ownerId" integer NOT NULL,
    "lastMessage" text COLLATE pg_catalog."default",
    "companyId" integer NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    CONSTRAINT "Chats_pkey" PRIMARY KEY (id),
    CONSTRAINT "Chats_companyId_fkey" FOREIGN KEY ("companyId")
        REFERENCES public."Companies" (id) MATCH SIMPLE
        ON UPDATE CASCADE
        ON DELETE CASCADE,
    CONSTRAINT "Chats_ownerId_fkey" FOREIGN KEY ("ownerId")
        REFERENCES public."Users" (id) MATCH SIMPLE
        ON UPDATE CASCADE
        ON DELETE CASCADE
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public."Chats"
    OWNER to todotips;
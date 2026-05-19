-- Table: public.QuickMessages

-- DROP TABLE IF EXISTS public."QuickMessages";

CREATE TABLE IF NOT EXISTS public."QuickMessages"
(
    id integer NOT NULL DEFAULT nextval('"QuickMessages_id_seq"'::regclass),
    shortcode character varying(255) COLLATE pg_catalog."default" NOT NULL,
    message text COLLATE pg_catalog."default",
    "companyId" integer,
    "mediaPath" character varying(255) COLLATE pg_catalog."default",
    "mediaName" character varying(255) COLLATE pg_catalog."default",
    geral boolean NOT NULL DEFAULT false,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    "userId" integer,
    caption character varying(4096) COLLATE pg_catalog."default",
    "flowId" integer,
    storage boolean DEFAULT false,
    "remoteUrl" character varying(2048) COLLATE pg_catalog."default",
    "queueId" integer,
    CONSTRAINT "QuickMessages_pkey" PRIMARY KEY (id),
    CONSTRAINT "QuickMessages_companyId_fkey" FOREIGN KEY ("companyId")
        REFERENCES public."Companies" (id) MATCH SIMPLE
        ON UPDATE CASCADE
        ON DELETE CASCADE,
    CONSTRAINT "QuickMessages_queueId_fkey" FOREIGN KEY ("queueId")
        REFERENCES public."Queues" (id) MATCH SIMPLE
        ON UPDATE CASCADE
        ON DELETE SET NULL,
    CONSTRAINT "QuickMessages_userId_fkey" FOREIGN KEY ("userId")
        REFERENCES public."Users" (id) MATCH SIMPLE
        ON UPDATE CASCADE
        ON DELETE CASCADE,
    CONSTRAINT "QuickMessages_userId_fkey1" FOREIGN KEY ("userId")
        REFERENCES public."Users" (id) MATCH SIMPLE
        ON UPDATE CASCADE
        ON DELETE SET NULL
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public."QuickMessages"
    OWNER to todotips;
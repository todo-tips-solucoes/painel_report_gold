-- Table: public.QueueOptions

-- DROP TABLE IF EXISTS public."QueueOptions";

CREATE TABLE IF NOT EXISTS public."QueueOptions"
(
    id integer NOT NULL DEFAULT nextval('"QueueOptions_id_seq"'::regclass),
    title character varying(255) COLLATE pg_catalog."default" NOT NULL,
    message text COLLATE pg_catalog."default",
    option text COLLATE pg_catalog."default",
    "queueId" integer,
    "parentId" integer,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    "queueOptionsId" integer,
    "queueType" character varying(255) COLLATE pg_catalog."default" NOT NULL DEFAULT 'text'::character varying,
    "queueUsersId" integer,
    "mediaPath" text COLLATE pg_catalog."default",
    "mediaName" text COLLATE pg_catalog."default",
    "queueFilesId" integer,
    "queueTypeEND" integer DEFAULT 0,
    CONSTRAINT "QueueOptions_pkey" PRIMARY KEY (id),
    CONSTRAINT "QueueOptions_parentId_fkey" FOREIGN KEY ("parentId")
        REFERENCES public."QueueOptions" (id) MATCH SIMPLE
        ON UPDATE CASCADE
        ON DELETE CASCADE,
    CONSTRAINT "QueueOptions_queueId_fkey" FOREIGN KEY ("queueId")
        REFERENCES public."Queues" (id) MATCH SIMPLE
        ON UPDATE CASCADE
        ON DELETE CASCADE
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public."QueueOptions"
    OWNER to todotips;
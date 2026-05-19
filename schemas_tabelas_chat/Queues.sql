-- Table: public.Queues

-- DROP TABLE IF EXISTS public."Queues";

CREATE TABLE IF NOT EXISTS public."Queues"
(
    id integer NOT NULL DEFAULT nextval('"Queues_id_seq"'::regclass),
    name character varying(255) COLLATE pg_catalog."default" NOT NULL,
    color character varying(255) COLLATE pg_catalog."default" NOT NULL,
    "greetingMessage" text COLLATE pg_catalog."default",
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    "companyId" integer,
    schedules jsonb DEFAULT '[]'::jsonb,
    "outOfHoursMessage" text COLLATE pg_catalog."default",
    "isChatbot" boolean NOT NULL DEFAULT false,
    prioridade integer NOT NULL DEFAULT 0,
    "tempoRoteador" integer NOT NULL DEFAULT 0,
    "ativarRoteador" boolean NOT NULL DEFAULT false,
    "selectedMoveQueueId" integer,
    "ativarRoteadorNoti" boolean NOT NULL DEFAULT false,
    gatilhos text COLLATE pg_catalog."default",
    "coverImage" integer,
    typeboturl text COLLATE pg_catalog."default",
    typebotname text COLLATE pg_catalog."default",
    typebotexpire integer NOT NULL DEFAULT 3600,
    typebotwait integer NOT NULL DEFAULT 1000,
    "flowiseUrl" text COLLATE pg_catalog."default",
    "flowiseKey" text COLLATE pg_catalog."default",
    "msgEncerramento" text COLLATE pg_catalog."default",
    "promptId" integer,
    "invalidMessage" text COLLATE pg_catalog."default",
    "flowId" integer,
    "zaiaToken" text COLLATE pg_catalog."default",
    "zaiaAgent" integer,
    "isTranscribe" boolean NOT NULL DEFAULT false,
    "difyToken" text COLLATE pg_catalog."default",
    "difyURL" text COLLATE pg_catalog."default",
    "webhookQueueURL" text COLLATE pg_catalog."default",
    "isNPS" boolean DEFAULT false,
    "categoryId" integer,
    CONSTRAINT "Queues_pkey" PRIMARY KEY (id),
    CONSTRAINT "Queues_name_key" UNIQUE (name, "companyId"),
    CONSTRAINT "Queues_categoryId_fkey" FOREIGN KEY ("categoryId")
        REFERENCES public."QueueCategories" (id) MATCH SIMPLE
        ON UPDATE CASCADE
        ON DELETE SET NULL,
    CONSTRAINT "Queues_companyId_fkey" FOREIGN KEY ("companyId")
        REFERENCES public."Companies" (id) MATCH SIMPLE
        ON UPDATE CASCADE
        ON DELETE SET NULL,
    CONSTRAINT "Queues_promptId_fkey" FOREIGN KEY ("promptId")
        REFERENCES public."Prompts" (id) MATCH SIMPLE
        ON UPDATE CASCADE
        ON DELETE SET NULL
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public."Queues"
    OWNER to todotips;
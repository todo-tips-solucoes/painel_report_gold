-- Table: public.Tickets

-- DROP TABLE IF EXISTS public."Tickets";

CREATE TABLE IF NOT EXISTS public."Tickets"
(
    id integer NOT NULL DEFAULT nextval('"Tickets_id_seq"'::regclass),
    status character varying(255) COLLATE pg_catalog."default" NOT NULL DEFAULT 'pending'::character varying,
    "lastMessage" text COLLATE pg_catalog."default" DEFAULT ''::text,
    channel text COLLATE pg_catalog."default" DEFAULT 'whatsapp'::text,
    "contactId" integer,
    "userId" integer,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    "whatsappId" integer,
    "isGroup" boolean NOT NULL DEFAULT false,
    "unreadMessages" integer,
    "queueId" integer,
    "companyId" integer,
    uuid uuid DEFAULT uuid_generate_v4(),
    chatbot boolean DEFAULT false,
    "queueOptionId" integer,
    protocolo text COLLATE pg_catalog."default",
    typebot_status text COLLATE pg_catalog."default",
    "typebot_sessionId" text COLLATE pg_catalog."default",
    "customA" text COLLATE pg_catalog."default",
    "customB" text COLLATE pg_catalog."default",
    "promptId" character varying(255) COLLATE pg_catalog."default" DEFAULT NULL::character varying,
    "repeatCount" integer,
    "flowWebhook" boolean NOT NULL DEFAULT false,
    "lastFlowId" character varying(255) COLLATE pg_catalog."default",
    "dataWebhook" json,
    "hashFlowId" character varying(255) COLLATE pg_catalog."default",
    "flowStopped" character varying(255) COLLATE pg_catalog."default",
    "fromAds" integer DEFAULT 24,
    "nextFlowId" text COLLATE pg_catalog."default",
    "isMenu" boolean NOT NULL DEFAULT false,
    variables jsonb,
    "flowStatus" text COLLATE pg_catalog."default",
    "openaiThreadId" character varying(255) COLLATE pg_catalog."default",
    "wabaConnectionId" integer,
    CONSTRAINT "Tickets_pkey" PRIMARY KEY (id),
    CONSTRAINT contactid_companyid_whatsappid_unique UNIQUE ("contactId", "companyId", "whatsappId"),
    CONSTRAINT "Tickets_companyId_fkey" FOREIGN KEY ("companyId")
        REFERENCES public."Companies" (id) MATCH SIMPLE
        ON UPDATE CASCADE
        ON DELETE SET NULL,
    CONSTRAINT "Tickets_contactId_fkey" FOREIGN KEY ("contactId")
        REFERENCES public."Contacts" (id) MATCH SIMPLE
        ON UPDATE CASCADE
        ON DELETE CASCADE,
    CONSTRAINT "Tickets_queueId_fkey" FOREIGN KEY ("queueId")
        REFERENCES public."Queues" (id) MATCH SIMPLE
        ON UPDATE CASCADE
        ON DELETE SET NULL,
    CONSTRAINT "Tickets_queueOptionId_fkey" FOREIGN KEY ("queueOptionId")
        REFERENCES public."QueueOptions" (id) MATCH SIMPLE
        ON UPDATE SET NULL
        ON DELETE SET NULL,
    CONSTRAINT "Tickets_userId_fkey" FOREIGN KEY ("userId")
        REFERENCES public."Users" (id) MATCH SIMPLE
        ON UPDATE CASCADE
        ON DELETE SET NULL,
    CONSTRAINT "Tickets_whatsappId_fkey" FOREIGN KEY ("whatsappId")
        REFERENCES public."Whatsapps" (id) MATCH SIMPLE
        ON UPDATE CASCADE
        ON DELETE SET NULL
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public."Tickets"
    OWNER to todotips;

COMMENT ON COLUMN public."Tickets"."openaiThreadId"
    IS 'Armazena o ID da thread criada na OpenAI para contexto do agente';
-- Index: idx_tickets_company_id

-- DROP INDEX IF EXISTS public.idx_tickets_company_id;

CREATE INDEX IF NOT EXISTS idx_tickets_company_id
    ON public."Tickets" USING btree
    ("companyId" ASC NULLS LAST)
    TABLESPACE pg_default;
-- Index: idx_tickets_id_desc

-- DROP INDEX IF EXISTS public.idx_tickets_id_desc;

CREATE INDEX IF NOT EXISTS idx_tickets_id_desc
    ON public."Tickets" USING btree
    (id DESC NULLS FIRST)
    TABLESPACE pg_default;
-- Index: idx_tickets_status_contact_company_whatsapp

-- DROP INDEX IF EXISTS public.idx_tickets_status_contact_company_whatsapp;

CREATE INDEX IF NOT EXISTS idx_tickets_status_contact_company_whatsapp
    ON public."Tickets" USING btree
    (status COLLATE pg_catalog."default" ASC NULLS LAST, "contactId" ASC NULLS LAST, "companyId" ASC NULLS LAST, "whatsappId" ASC NULLS LAST)
    TABLESPACE pg_default;
-- Index: idx_tickets_updated_at_desc

-- DROP INDEX IF EXISTS public.idx_tickets_updated_at_desc;

CREATE INDEX IF NOT EXISTS idx_tickets_updated_at_desc
    ON public."Tickets" USING btree
    ("updatedAt" DESC NULLS FIRST)
    TABLESPACE pg_default;
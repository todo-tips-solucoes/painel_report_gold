-- Table: public.Messages

-- DROP TABLE IF EXISTS public."Messages";

CREATE TABLE IF NOT EXISTS public."Messages"
(
    body text COLLATE pg_catalog."default" NOT NULL,
    ack integer NOT NULL DEFAULT 0,
    read boolean NOT NULL DEFAULT false,
    "mediaType" character varying(255) COLLATE pg_catalog."default",
    "mediaUrl" character varying(255) COLLATE pg_catalog."default",
    "ticketId" integer NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    "fromMe" boolean NOT NULL DEFAULT false,
    "isDeleted" boolean NOT NULL DEFAULT false,
    "contactId" integer,
    "companyId" integer,
    "remoteJid" text COLLATE pg_catalog."default",
    "dataJson" text COLLATE pg_catalog."default",
    participant text COLLATE pg_catalog."default",
    "queueId" integer,
    "quotedMsgId" integer,
    wid character varying(255) COLLATE pg_catalog."default",
    id integer NOT NULL DEFAULT nextval('"Messages_id_seq"'::regclass),
    "isForwarded" boolean DEFAULT false,
    importando boolean DEFAULT false,
    "messageTimestamp" character varying(255) COLLATE pg_catalog."default",
    "importedAt" timestamp with time zone,
    "originalAt" timestamp with time zone,
    "remoteUrl" character varying(2048) COLLATE pg_catalog."default",
    storage boolean DEFAULT false,
    apagado boolean DEFAULT false,
    "providerMessageId" text COLLATE pg_catalog."default",
    "userId" integer,
    "fromApp" boolean DEFAULT false,
    "commentId" character varying(255) COLLATE pg_catalog."default",
    "isTranscription" boolean NOT NULL DEFAULT false,
    CONSTRAINT "Messages_pkey" PRIMARY KEY (id),
    CONSTRAINT "Messages_id_key" UNIQUE (id),
    CONSTRAINT "Messages_companyId_fkey" FOREIGN KEY ("companyId")
        REFERENCES public."Companies" (id) MATCH SIMPLE
        ON UPDATE CASCADE
        ON DELETE SET NULL,
    CONSTRAINT "Messages_contactId_fkey" FOREIGN KEY ("contactId")
        REFERENCES public."Contacts" (id) MATCH SIMPLE
        ON UPDATE CASCADE
        ON DELETE CASCADE,
    CONSTRAINT "Messages_queueId_fkey" FOREIGN KEY ("queueId")
        REFERENCES public."Queues" (id) MATCH SIMPLE
        ON UPDATE SET NULL
        ON DELETE SET NULL,
    CONSTRAINT "Messages_quotedMsgId_fkey" FOREIGN KEY ("quotedMsgId")
        REFERENCES public."Messages" (id) MATCH SIMPLE
        ON UPDATE CASCADE
        ON DELETE SET NULL,
    CONSTRAINT "Messages_ticketId_fkey" FOREIGN KEY ("ticketId")
        REFERENCES public."Tickets" (id) MATCH SIMPLE
        ON UPDATE CASCADE
        ON DELETE CASCADE
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public."Messages"
    OWNER to todotips;
-- Index: idx_cleanup_messages_contactid

-- DROP INDEX IF EXISTS public.idx_cleanup_messages_contactid;

CREATE INDEX IF NOT EXISTS idx_cleanup_messages_contactid
    ON public."Messages" USING btree
    ("contactId" ASC NULLS LAST)
    TABLESPACE pg_default
    WHERE "contactId" IS NOT NULL;
-- Index: idx_cleanup_messages_quotedmsgid

-- DROP INDEX IF EXISTS public.idx_cleanup_messages_quotedmsgid;

CREATE INDEX IF NOT EXISTS idx_cleanup_messages_quotedmsgid
    ON public."Messages" USING btree
    ("quotedMsgId" ASC NULLS LAST)
    TABLESPACE pg_default
    WHERE "quotedMsgId" IS NOT NULL;
-- Index: idx_messages_ticketid_quotedmsgid

-- DROP INDEX IF EXISTS public.idx_messages_ticketid_quotedmsgid;

CREATE INDEX IF NOT EXISTS idx_messages_ticketid_quotedmsgid
    ON public."Messages" USING btree
    ("ticketId" ASC NULLS LAST, "quotedMsgId" ASC NULLS LAST)
    TABLESPACE pg_default;
-- Index: idx_messages_wid_company

-- DROP INDEX IF EXISTS public.idx_messages_wid_company;

CREATE INDEX IF NOT EXISTS idx_messages_wid_company
    ON public."Messages" USING btree
    (wid COLLATE pg_catalog."default" ASC NULLS LAST, "companyId" ASC NULLS LAST)
    TABLESPACE pg_default;
-- Index: idx_ms_company_id_ticket_id

-- DROP INDEX IF EXISTS public.idx_ms_company_id_ticket_id;

CREATE INDEX IF NOT EXISTS idx_ms_company_id_ticket_id
    ON public."Messages" USING btree
    ("companyId" ASC NULLS LAST, "ticketId" ASC NULLS LAST)
    TABLESPACE pg_default;
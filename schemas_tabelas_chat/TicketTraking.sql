-- Table: public.TicketTraking

-- DROP TABLE IF EXISTS public."TicketTraking";

CREATE TABLE IF NOT EXISTS public."TicketTraking"
(
    id integer NOT NULL DEFAULT nextval('"TicketTraking_id_seq"'::regclass),
    "ticketId" integer,
    "companyId" integer,
    "whatsappId" integer,
    "userId" integer,
    "createdAt" timestamp with time zone,
    "updatedAt" timestamp with time zone,
    "queuedAt" timestamp with time zone,
    "startedAt" timestamp with time zone,
    "finishedAt" timestamp with time zone,
    "ratingAt" timestamp with time zone,
    rated boolean DEFAULT false,
    "ratingId" integer,
    "perfexId" text COLLATE pg_catalog."default",
    "rdId" text COLLATE pg_catalog."default",
    "queuesIds" text COLLATE pg_catalog."default",
    "nextQueuesIds" jsonb DEFAULT '[]'::jsonb,
    "cvId" text COLLATE pg_catalog."default",
    "fromAds" integer DEFAULT 24,
    nps integer,
    disparei integer DEFAULT 0,
    processing boolean DEFAULT false,
    CONSTRAINT "TicketTraking_pkey" PRIMARY KEY (id),
    CONSTRAINT "TicketTraking_companyId_fkey" FOREIGN KEY ("companyId")
        REFERENCES public."Companies" (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE SET NULL,
    CONSTRAINT "TicketTraking_nps_fkey" FOREIGN KEY (nps)
        REFERENCES public."Tags" (id) MATCH SIMPLE
        ON UPDATE CASCADE
        ON DELETE SET NULL,
    CONSTRAINT "TicketTraking_ratingId_fkey" FOREIGN KEY ("ratingId")
        REFERENCES public."Ratings" (id) MATCH SIMPLE
        ON UPDATE RESTRICT
        ON DELETE RESTRICT,
    CONSTRAINT "TicketTraking_ticketId_fkey" FOREIGN KEY ("ticketId")
        REFERENCES public."Tickets" (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE SET NULL,
    CONSTRAINT "TicketTraking_userId_fkey" FOREIGN KEY ("userId")
        REFERENCES public."Users" (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE SET NULL,
    CONSTRAINT "TicketTraking_whatsappId_fkey" FOREIGN KEY ("whatsappId")
        REFERENCES public."Whatsapps" (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE SET NULL
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public."TicketTraking"
    OWNER to todotips;
-- Index: ticket_tracking_ticketId_finishedAt_idx

-- DROP INDEX IF EXISTS public."ticket_tracking_ticketId_finishedAt_idx";

CREATE INDEX IF NOT EXISTS "ticket_tracking_ticketId_finishedAt_idx"
    ON public."TicketTraking" USING btree
    ("ticketId" ASC NULLS LAST, "finishedAt" ASC NULLS LAST)
    TABLESPACE pg_default;
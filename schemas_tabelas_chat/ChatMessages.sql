-- Table: public.ChatMessages

-- DROP TABLE IF EXISTS public."ChatMessages";

CREATE TABLE IF NOT EXISTS public."ChatMessages"
(
    id integer NOT NULL DEFAULT nextval('"ChatMessages_id_seq"'::regclass),
    "chatId" integer NOT NULL,
    "senderId" integer NOT NULL,
    message text COLLATE pg_catalog."default" DEFAULT ''::text,
    "mediaPath" text COLLATE pg_catalog."default",
    "mediaName" text COLLATE pg_catalog."default",
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    "mediaType" text COLLATE pg_catalog."default",
    "quotedMsgId" integer,
    CONSTRAINT "ChatMessages_pkey" PRIMARY KEY (id),
    CONSTRAINT "ChatMessages_chatId_fkey" FOREIGN KEY ("chatId")
        REFERENCES public."Chats" (id) MATCH SIMPLE
        ON UPDATE CASCADE
        ON DELETE CASCADE,
    CONSTRAINT "ChatMessages_quotedMsgId_fkey" FOREIGN KEY ("quotedMsgId")
        REFERENCES public."ChatMessages" (id) MATCH SIMPLE
        ON UPDATE CASCADE
        ON DELETE SET NULL,
    CONSTRAINT "ChatMessages_senderId_fkey" FOREIGN KEY ("senderId")
        REFERENCES public."Users" (id) MATCH SIMPLE
        ON UPDATE CASCADE
        ON DELETE CASCADE
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public."ChatMessages"
    OWNER to todotips;
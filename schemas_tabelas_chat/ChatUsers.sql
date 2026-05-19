-- Table: public.ChatUsers

-- DROP TABLE IF EXISTS public."ChatUsers";

CREATE TABLE IF NOT EXISTS public."ChatUsers"
(
    id integer NOT NULL DEFAULT nextval('"ChatUsers_id_seq"'::regclass),
    "chatId" integer NOT NULL,
    "userId" integer NOT NULL,
    unreads integer DEFAULT 0,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    CONSTRAINT "ChatUsers_pkey" PRIMARY KEY (id),
    CONSTRAINT "ChatUsers_chatId_fkey" FOREIGN KEY ("chatId")
        REFERENCES public."Chats" (id) MATCH SIMPLE
        ON UPDATE CASCADE
        ON DELETE CASCADE,
    CONSTRAINT "ChatUsers_userId_fkey" FOREIGN KEY ("userId")
        REFERENCES public."Users" (id) MATCH SIMPLE
        ON UPDATE CASCADE
        ON DELETE CASCADE
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public."ChatUsers"
    OWNER to todotips;
-- Table: public.Whatsapps

-- DROP TABLE IF EXISTS public."Whatsapps";

CREATE TABLE IF NOT EXISTS public."Whatsapps"
(
    id integer NOT NULL DEFAULT nextval('"Whatsapps_id_seq"'::regclass),
    session text COLLATE pg_catalog."default",
    qrcode text COLLATE pg_catalog."default",
    status character varying(255) COLLATE pg_catalog."default",
    battery character varying(255) COLLATE pg_catalog."default",
    webhook character varying(255) COLLATE pg_catalog."default",
    "ignoreNumbers" character varying(255) COLLATE pg_catalog."default",
    "number" character varying(255) COLLATE pg_catalog."default",
    plugged boolean,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    name character varying(255) COLLATE pg_catalog."default" NOT NULL,
    "isDefault" boolean NOT NULL DEFAULT false,
    retries integer NOT NULL DEFAULT 0,
    "greetingMessage" text COLLATE pg_catalog."default",
    "companyId" integer,
    "complationMessage" text COLLATE pg_catalog."default",
    "outOfHoursMessage" text COLLATE pg_catalog."default",
    "ratingMessage" text COLLATE pg_catalog."default",
    token text COLLATE pg_catalog."default",
    "farewellMessage" text COLLATE pg_catalog."default",
    provider text COLLATE pg_catalog."default" DEFAULT 'stable'::text,
    removido boolean NOT NULL DEFAULT false,
    "selectedMoveQueueId" integer,
    "selectedInterval" integer NOT NULL DEFAULT 0,
    inatividade integer,
    "closeMessage" text COLLATE pg_catalog."default",
    excluded integer,
    ixcrandom integer,
    hubtoken text COLLATE pg_catalog."default",
    channel text COLLATE pg_catalog."default",
    markasread integer,
    importmessages integer,
    "coverImage" integer,
    excludedwpw integer,
    whatsmeowtoken text COLLATE pg_catalog."default",
    whatsmeowurl text COLLATE pg_catalog."default",
    whatsmeowname text COLLATE pg_catalog."default",
    whatsmeowid text COLLATE pg_catalog."default",
    "selectedCommentQueueId" integer,
    "inatividadeNQ" integer,
    whavoip_token text COLLATE pg_catalog."default",
    whatsmeowprotoken text COLLATE pg_catalog."default",
    whatsmeowprourl text COLLATE pg_catalog."default",
    whatsmeowproname text COLLATE pg_catalog."default",
    whatsmeowproid text COLLATE pg_catalog."default",
    mtd boolean NOT NULL DEFAULT false,
    "isInternal" boolean NOT NULL DEFAULT false,
    iframe text COLLATE pg_catalog."default",
    "allowEcho" boolean NOT NULL DEFAULT false,
    blockgroupatconnection boolean NOT NULL DEFAULT false,
    "metaAccessToken" text COLLATE pg_catalog."default",
    "metaPhoneNumberId" character varying(255) COLLATE pg_catalog."default",
    "metaWabaId" character varying(255) COLLATE pg_catalog."default",
    "metaBusinessId" character varying(255) COLLATE pg_catalog."default",
    "metaVerifiedName" character varying(255) COLLATE pg_catalog."default",
    "metaDisplayPhoneNumber" character varying(255) COLLATE pg_catalog."default",
    "metaQualityRating" character varying(255) COLLATE pg_catalog."default",
    "metaWebhookUrl" text COLLATE pg_catalog."default",
    "metaWebhookVerifyToken" character varying(255) COLLATE pg_catalog."default",
    "metaAccountStatus" text COLLATE pg_catalog."default",
    "metaSessionData" jsonb DEFAULT '{}'::jsonb,
    webhookb text COLLATE pg_catalog."default",
    "webchatToken" character varying(255) COLLATE pg_catalog."default" DEFAULT NULL::character varying,
    "webchatName" character varying(255) COLLATE pg_catalog."default" DEFAULT NULL::character varying,
    "webchatIcon" text COLLATE pg_catalog."default",
    "webchatSound" boolean DEFAULT true,
    "webchatConfig" jsonb,
    "remoteDevice" text COLLATE pg_catalog."default",
    "whatsappIP" text COLLATE pg_catalog."default",
    "proxyAddress" character varying(255) COLLATE pg_catalog."default" DEFAULT NULL::character varying,
    "proxyUsername" character varying(255) COLLATE pg_catalog."default" DEFAULT NULL::character varying,
    "proxyPassword" character varying(255) COLLATE pg_catalog."default" DEFAULT NULL::character varying,
    "sipConfig" jsonb,
    "voipPrefix" character varying(255) COLLATE pg_catalog."default" DEFAULT NULL::character varying,
    whatsmeowprolocation character varying(255) COLLATE pg_catalog."default" DEFAULT NULL::character varying,
    whatsmeowinternalip character varying(255) COLLATE pg_catalog."default" DEFAULT NULL::character varying,
    telegram_token text COLLATE pg_catalog."default",
    "telegramWebhookKey" text COLLATE pg_catalog."default",
    "metaPageId" text COLLATE pg_catalog."default",
    "metaPageAccessToken" text COLLATE pg_catalog."default",
    "metaPageName" text COLLATE pg_catalog."default",
    "metaIgBusinessId" text COLLATE pg_catalog."default",
    "newFollowerMessage" text COLLATE pg_catalog."default",
    CONSTRAINT "Whatsapps_pkey" PRIMARY KEY (id),
    CONSTRAINT "Whatsapps_name_key" UNIQUE (name),
    CONSTRAINT "Whatsapps_companyId_fkey" FOREIGN KEY ("companyId")
        REFERENCES public."Companies" (id) MATCH SIMPLE
        ON UPDATE CASCADE
        ON DELETE SET NULL
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public."Whatsapps"
    OWNER to todotips;

COMMENT ON COLUMN public."Whatsapps".telegram_token
    IS 'Token do Bot Telegram fornecido pelo @BotFather para conexoes telegram_aini';

COMMENT ON COLUMN public."Whatsapps"."telegramWebhookKey"
    IS 'Chave aleatoria que compoe a URL do webhook Telegram AINI (gateway AMQP)';

COMMENT ON COLUMN public."Whatsapps"."metaPageId"
    IS 'Page ID do Facebook (chave de identificação no payload do webhook Meta)';

COMMENT ON COLUMN public."Whatsapps"."metaPageAccessToken"
    IS 'Page Access Token long-lived obtido via /me/accounts';

COMMENT ON COLUMN public."Whatsapps"."metaPageName"
    IS 'Nome de exibição da Page';

COMMENT ON COLUMN public."Whatsapps"."metaIgBusinessId"
    IS 'Instagram Business Account ID linkado à Page (apenas instagram_aini)';

COMMENT ON COLUMN public."Whatsapps"."newFollowerMessage"
    IS 'Mensagem enviada automaticamente a novos seguidores do canal instagram_aini';
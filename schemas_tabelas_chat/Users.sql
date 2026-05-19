-- Table: public.Users

-- DROP TABLE IF EXISTS public."Users";

CREATE TABLE IF NOT EXISTS public."Users"
(
    id integer NOT NULL DEFAULT nextval('"Users_id_seq"'::regclass),
    name character varying(255) COLLATE pg_catalog."default" NOT NULL,
    email character varying(255) COLLATE pg_catalog."default" NOT NULL,
    "passwordHash" character varying(255) COLLATE pg_catalog."default" NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    profile character varying(255) COLLATE pg_catalog."default" NOT NULL DEFAULT 'admin'::character varying,
    "tokenVersion" integer NOT NULL DEFAULT 0,
    "companyId" integer,
    super boolean DEFAULT false,
    online boolean DEFAULT false,
    "whatsappId" integer,
    "endWork" character varying(255) COLLATE pg_catalog."default" DEFAULT '23:59'::character varying,
    "startWork" character varying(255) COLLATE pg_catalog."default" DEFAULT '00:00'::character varying,
    color character varying(255) COLLATE pg_catalog."default",
    "farewellMessage" text COLLATE pg_catalog."default",
    "perfexId" character varying(255) COLLATE pg_catalog."default",
    "rdId" character varying(255) COLLATE pg_catalog."default",
    "cvId" character varying(255) COLLATE pg_catalog."default",
    "cvImob" character varying(255) COLLATE pg_catalog."default",
    "number" character varying(255) COLLATE pg_catalog."default",
    "carteiraQueueId" character varying(255) COLLATE pg_catalog."default",
    "randomupdatedAt" character varying(255) COLLATE pg_catalog."default",
    limited boolean DEFAULT true,
    restricted boolean DEFAULT false,
    ausencia character varying(255) COLLATE pg_catalog."default",
    away boolean DEFAULT false,
    sigame boolean DEFAULT false,
    callstatus character varying(255) COLLATE pg_catalog."default" DEFAULT '0'::character varying,
    inactive boolean DEFAULT false,
    sipuri character varying(255) COLLATE pg_catalog."default",
    sippass character varying(255) COLLATE pg_catalog."default",
    sipws character varying(255) COLLATE pg_catalog."default",
    uuid uuid NOT NULL,
    "wabaConnectionId" integer,
    "menuPreference" text COLLATE pg_catalog."default",
    "canAccessContacts" boolean NOT NULL DEFAULT true,
    "canAccessCampaigns" boolean NOT NULL DEFAULT false,
    "fcmToken" text COLLATE pg_catalog."default",
    "canCreateTags" boolean NOT NULL DEFAULT false,
    "twoFactorEnabled" boolean NOT NULL DEFAULT false,
    "twoFactorSecret" character varying(255) COLLATE pg_catalog."default",
    "twoFactorVerified" boolean NOT NULL DEFAULT false,
    "allowedIPs" text COLLATE pg_catalog."default",
    CONSTRAINT "Users_pkey" PRIMARY KEY (id),
    CONSTRAINT "Users_email_key" UNIQUE (email),
    CONSTRAINT "Users_uuid_key" UNIQUE (uuid),
    CONSTRAINT "Users_uuid_key1" UNIQUE (uuid),
    CONSTRAINT "Users_companyId_fkey" FOREIGN KEY ("companyId")
        REFERENCES public."Companies" (id) MATCH SIMPLE
        ON UPDATE CASCADE
        ON DELETE SET NULL,
    CONSTRAINT "Users_whatsappId_fkey" FOREIGN KEY ("whatsappId")
        REFERENCES public."Whatsapps" (id) MATCH SIMPLE
        ON UPDATE CASCADE
        ON DELETE SET NULL
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public."Users"
    OWNER to todotips;

COMMENT ON COLUMN public."Users"."allowedIPs"
    IS 'JSON array of CIDR strings for IP-based access restriction. null = no restriction.';
-- Index: idx_users_fcm_token

-- DROP INDEX IF EXISTS public.idx_users_fcm_token;

CREATE INDEX IF NOT EXISTS idx_users_fcm_token
    ON public."Users" USING btree
    ("fcmToken" COLLATE pg_catalog."default" ASC NULLS LAST)
    TABLESPACE pg_default;
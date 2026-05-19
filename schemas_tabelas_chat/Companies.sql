-- Table: public.Companies

-- DROP TABLE IF EXISTS public."Companies";

CREATE TABLE IF NOT EXISTS public."Companies"
(
    id integer NOT NULL DEFAULT nextval('"Companies_id_seq"'::regclass),
    name character varying(255) COLLATE pg_catalog."default" NOT NULL,
    phone character varying(255) COLLATE pg_catalog."default",
    email character varying(255) COLLATE pg_catalog."default",
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    pais text COLLATE pg_catalog."default",
    namecomplete text COLLATE pg_catalog."default",
    indicator text COLLATE pg_catalog."default",
    "planId" integer,
    status boolean DEFAULT true,
    schedules jsonb DEFAULT '[]'::jsonb,
    "dueDate" timestamp with time zone,
    recurrence character varying(255) COLLATE pg_catalog."default" DEFAULT ''::character varying,
    "lastLogin" timestamp with time zone,
    document character varying(255) COLLATE pg_catalog."default" DEFAULT ''::character varying,
    "paymentMethod" character varying(255) COLLATE pg_catalog."default" DEFAULT ''::character varying,
    "messageCount" character varying(255) COLLATE pg_catalog."default" DEFAULT ''::character varying,
    importar boolean DEFAULT false,
    "typebotUrl" character varying(255) COLLATE pg_catalog."default" DEFAULT ''::character varying,
    "typebotName" character varying(255) COLLATE pg_catalog."default" DEFAULT ''::character varying,
    "iframeUserUrl" character varying(255) COLLATE pg_catalog."default" DEFAULT ''::character varying,
    "iframeAdminUrl" character varying(255) COLLATE pg_catalog."default" DEFAULT ''::character varying,
    "iframeUser" character varying(255) COLLATE pg_catalog."default" DEFAULT ''::character varying,
    "iframeAdmin" character varying(255) COLLATE pg_catalog."default" DEFAULT ''::character varying,
    keystorage character varying(255) COLLATE pg_catalog."default" DEFAULT 'postgres'::character varying,
    "apiUsada" character varying(255) COLLATE pg_catalog."default" DEFAULT 'postgres'::character varying,
    "iframeUserUrlB" character varying(255) COLLATE pg_catalog."default" DEFAULT ''::character varying,
    "iframeUserB" character varying(255) COLLATE pg_catalog."default" DEFAULT ''::character varying,
    "blockGroups" boolean DEFAULT false,
    "proxyURL" character varying(255) COLLATE pg_catalog."default" DEFAULT ''::character varying,
    "useProxy" character varying(255) COLLATE pg_catalog."default" DEFAULT 'noproxy'::character varying,
    logar boolean DEFAULT true,
    excluded boolean DEFAULT true,
    removido boolean DEFAULT false,
    "blockRead" boolean DEFAULT false,
    uuid uuid NOT NULL,
    ambiente character varying(255) COLLATE pg_catalog."default" DEFAULT 'wsw'::character varying,
    asaas_customer_id character varying(255) COLLATE pg_catalog."default" DEFAULT NULL::character varying,
    country character varying(255) COLLATE pg_catalog."default" DEFAULT 'BR'::character varying,
    "iframeUserC" character varying(255) COLLATE pg_catalog."default" DEFAULT NULL::character varying,
    "iframeUserUrlC" character varying(255) COLLATE pg_catalog."default" DEFAULT NULL::character varying,
    "iframeUserD" character varying(255) COLLATE pg_catalog."default" DEFAULT NULL::character varying,
    "iframeUserUrlD" character varying(255) COLLATE pg_catalog."default" DEFAULT NULL::character varying,
    "iframeUserE" character varying(255) COLLATE pg_catalog."default" DEFAULT NULL::character varying,
    "iframeUserUrlE" character varying(255) COLLATE pg_catalog."default" DEFAULT NULL::character varying,
    "iframeUserF" character varying(255) COLLATE pg_catalog."default" DEFAULT NULL::character varying,
    "iframeUserUrlF" character varying(255) COLLATE pg_catalog."default" DEFAULT NULL::character varying,
    "iframeUserG" character varying(255) COLLATE pg_catalog."default" DEFAULT NULL::character varying,
    "iframeUserUrlG" character varying(255) COLLATE pg_catalog."default" DEFAULT NULL::character varying,
    "iframeAdminB" character varying(255) COLLATE pg_catalog."default" DEFAULT NULL::character varying,
    "iframeAdminUrlB" character varying(255) COLLATE pg_catalog."default" DEFAULT NULL::character varying,
    "iframeAdminC" character varying(255) COLLATE pg_catalog."default" DEFAULT NULL::character varying,
    "iframeAdminUrlC" character varying(255) COLLATE pg_catalog."default" DEFAULT NULL::character varying,
    "iframeAdminD" character varying(255) COLLATE pg_catalog."default" DEFAULT NULL::character varying,
    "iframeAdminUrlD" character varying(255) COLLATE pg_catalog."default" DEFAULT NULL::character varying,
    "iframeAdminE" character varying(255) COLLATE pg_catalog."default" DEFAULT NULL::character varying,
    "iframeAdminUrlE" character varying(255) COLLATE pg_catalog."default" DEFAULT NULL::character varying,
    "iframeAdminF" character varying(255) COLLATE pg_catalog."default" DEFAULT NULL::character varying,
    "iframeAdminUrlF" character varying(255) COLLATE pg_catalog."default" DEFAULT NULL::character varying,
    CONSTRAINT "Companies_pkey" PRIMARY KEY (id),
    CONSTRAINT "Companies_name_key" UNIQUE (name),
    CONSTRAINT "Companies_uuid_key" UNIQUE (uuid),
    CONSTRAINT "Companies_uuid_key1" UNIQUE (uuid),
    CONSTRAINT "Companies_planId_fkey" FOREIGN KEY ("planId")
        REFERENCES public."Plans" (id) MATCH SIMPLE
        ON UPDATE CASCADE
        ON DELETE SET NULL
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public."Companies"
    OWNER to todotips;
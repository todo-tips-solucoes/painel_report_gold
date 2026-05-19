-- Table: public.PipelineLanes

-- DROP TABLE IF EXISTS public."PipelineLanes";

CREATE TABLE IF NOT EXISTS public."PipelineLanes"
(
    id integer NOT NULL DEFAULT nextval('"PipelineLanes_id_seq"'::regclass),
    name character varying(255) COLLATE pg_catalog."default" NOT NULL,
    color character varying(255) COLLATE pg_catalog."default" NOT NULL DEFAULT '#808080'::character varying,
    "order" integer NOT NULL DEFAULT 0,
    "isActive" boolean NOT NULL DEFAULT true,
    "userId" integer NOT NULL,
    "companyId" integer NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    "laneType" "enum_PipelineLanes_laneType" NOT NULL DEFAULT 'IN_PROGRESS'::"enum_PipelineLanes_laneType",
    CONSTRAINT "PipelineLanes_pkey" PRIMARY KEY (id),
    CONSTRAINT "PipelineLanes_companyId_fkey" FOREIGN KEY ("companyId")
        REFERENCES public."Companies" (id) MATCH SIMPLE
        ON UPDATE CASCADE
        ON DELETE CASCADE,
    CONSTRAINT "PipelineLanes_userId_fkey" FOREIGN KEY ("userId")
        REFERENCES public."Users" (id) MATCH SIMPLE
        ON UPDATE CASCADE
        ON DELETE CASCADE
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public."PipelineLanes"
    OWNER to todotips2;
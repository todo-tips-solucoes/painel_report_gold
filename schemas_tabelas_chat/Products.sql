-- Table: public.Products

-- DROP TABLE IF EXISTS public."Products";

CREATE TABLE IF NOT EXISTS public."Products"
(
    id integer NOT NULL DEFAULT nextval('"Products_id_seq"'::regclass),
    name character varying(255) COLLATE pg_catalog."default" NOT NULL,
    description text COLLATE pg_catalog."default",
    details text COLLATE pg_catalog."default",
    price numeric(10,2) NOT NULL,
    "imageUrl" text COLLATE pg_catalog."default",
    "companyId" integer NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    CONSTRAINT "Products_pkey" PRIMARY KEY (id),
    CONSTRAINT "Products_companyId_fkey" FOREIGN KEY ("companyId")
        REFERENCES public."Companies" (id) MATCH SIMPLE
        ON UPDATE CASCADE
        ON DELETE CASCADE
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public."Products"
    OWNER to todotips2;
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { env } from "@/env";
import * as schema from "./schema";
console.log(env.DATABASE_URL);
export const connection = postgres(env.DATABASE_URL, {
  max_lifetime: 10, // Remove this line if you're deploying to Docker / VPS
  // idle_timeout: 20, // Uncomment this line if you're deploying to Docker / VPS
});

export const db = drizzle(connection, { schema });

/*
okay somewhere around this token list what i need to do is to allow printing a client side form like this:
1. there will be a generate form.
it will have the following things:
Title: Buddhashanti Rural Municipality 
Address: Jhapa, Koshi Province
Logo of nepal government as svg

the name of the enumerator hardcoded, the area code hardcoded, the 
*/

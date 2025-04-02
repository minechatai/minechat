## Getting Started

## Requirements

* Node v22.12.0

## Running the build

1. Checkout this project and create an `.env.local` file with the following contents:

```
# OpenAI access
OPENAI_API_KEY=

# Facebook access
FB_APP_ACCESS_TOKEN=
FB_VERIFY_TOKEN=

# Supabase access
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=

# Used in Prisma Migration
DATABASE_URL=""

```

Make sure you fill the ids above with the correct ones.


2. Run `npm i` to install the dependencies.
```
npm i
```

3. Run `initializedb.sh` to initial supabase (DB).
```
chmod +x initializedb.sh
./initializedb.sh
```

4. run `npm run dev` to run the build. The build will be accessible from `localhost:3000`.

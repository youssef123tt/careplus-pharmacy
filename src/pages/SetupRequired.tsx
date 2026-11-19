/** Shown when the Supabase environment variables are missing, instead of a blank crash. */
export function SetupRequired() {
  return (
    <div className="flex min-h-dvh items-center justify-center p-6">
      <div className="max-w-lg rounded-carton border border-line bg-board p-8">
        <h1 className="text-xl font-bold text-ink">Database not configured</h1>
        <p className="mt-3 text-sm text-ink-2">
          Create a <code className="rounded bg-board-2 px-1">.env</code> file (see <code className="rounded bg-board-2 px-1">.env.example</code>) with
          your Supabase project URL and anon key, then restart the dev server:
        </p>
        <pre className="mt-4 overflow-x-auto rounded-carton bg-ink p-4 text-xs text-board">
{`VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...`}
        </pre>
        <p className="mt-4 text-sm text-ink-2">
          Then run <code className="rounded bg-board-2 px-1">supabase/schema.sql</code> and{' '}
          <code className="rounded bg-board-2 px-1">supabase/seed.sql</code> in the Supabase SQL editor.
        </p>
      </div>
    </div>
  )
}

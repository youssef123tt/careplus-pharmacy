/** Shown when the Supabase environment variables are missing, instead of a blank crash. */
export function SetupRequired() {
  return (
    <div className="flex min-h-dvh items-center justify-center p-6">
      <div className="max-w-lg rounded-2xl border border-amber-200 bg-white p-8 shadow-sm">
        <h1 className="text-xl font-bold text-slate-900">Database not configured</h1>
        <p className="mt-3 text-sm text-slate-600">
          Create a <code className="rounded bg-slate-100 px-1">.env</code> file (see <code className="rounded bg-slate-100 px-1">.env.example</code>) with
          your Supabase project URL and anon key, then restart the dev server:
        </p>
        <pre className="mt-4 overflow-x-auto rounded-lg bg-slate-900 p-4 text-xs text-slate-100">
{`VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...`}
        </pre>
        <p className="mt-4 text-sm text-slate-600">
          Then run <code className="rounded bg-slate-100 px-1">supabase/schema.sql</code> and{' '}
          <code className="rounded bg-slate-100 px-1">supabase/seed.sql</code> in the Supabase SQL editor.
        </p>
      </div>
    </div>
  )
}

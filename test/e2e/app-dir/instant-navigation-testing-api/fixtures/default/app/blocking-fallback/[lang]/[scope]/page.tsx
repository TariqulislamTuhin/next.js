import { cookies } from 'next/headers'
import { connection } from 'next/server'

// The deeper, blocking segment of the fallback route: reads request-time
// `cookies()` and has no <Suspense> of its own, so it has no static shell.
// Under instant() the navigation here must stay parked on the committed parent;
// the cookie value must not commit while the lock is held.
export default function ScopePage() {
  return (
    <div>
      <h1 data-testid="blocking-scope-title">Scope</h1>
      <Secret />
    </div>
  )
}

async function Secret() {
  // `await connection()` makes the segment strictly dynamic so no prefetch can
  // render it, which is what keeps it deferred under the instant lock.
  // `cookies()` alone would not suffice: the app-shell prefetch carries cookies
  // and could render the segment, while the empty static speculative prefetch
  // renders nothing here, so whichever reaches the segment cache first would
  // decide whether the content appears. `connection()` resolves only with a
  // real request, which no prefetch has.
  await connection()
  const cookieStore = await cookies()
  return (
    <div data-testid="blocking-secret">
      testCookie: {cookieStore.get('testCookie')?.value ?? 'not set'}
    </div>
  )
}

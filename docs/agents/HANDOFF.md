# Handoff

## November 24, 2026, gate session remediation

Branch `codex/personal-session-lifetime-20261124` builds on the reviewed personal journey at `8932c4e`. The gate now signs and registers each login separately for 30 days. Authenticated readers check the live KV grant and its signed deadline. Signing out at `/gate` retires that login, clears its browser cookies, and refreshes other open desktop tabs. Pending WHOOP connections are tied to the initiating owner session and can complete once.

The local candidate passed 270 tests, TypeScript, lint and the production build. Lint reported the same six existing warnings. A loopback production-build run used Valkey 9.2 for real session creation, absolute expiry, independent logins, revocation and the OAuth continuation. The remediation packet under `~/audits/my-project/remediation/personal/` has the review and four-view screenshots. Before release, check the existing KV binding’s command permissions and immediate revocation from deployed staging regions, and verify a normal owner sign-in. Existing pre-v3 sessions will require a new login. The optional guest account is currently disabled in production.

## November 24, 2026

The branch `codex/personal-journey-review-20261124` starts from main `1354cf5`. It adds a visible path from the About window to Writing and improves reading contrast and keyboard access. Matthew's role and biography use the existing public copy.

## Verification

The candidate passed all 278 tests, TypeScript, lint and the local production build. The metadata audit checked 40 indexable pages. There are six existing lint warnings. Chrome completed the visitor journey at 390 and 1440 pixels in both themes using touch or keyboard, and with JavaScript disabled. Playwright WebKit completed the phone journey in both themes. The scoped axe checks returned zero findings on all 24 candidate states.

## Design review

The review is in the November 24 rollout workspace under `outputs/personal-site/index.html`. It includes before and after images at both widths, in both themes, and the last approved home references. Matthew's November 23 approved release remains the visual baseline. The phone springboard uses its established graphite surface in either theme.

The candidate awaits Matthew's design review. The separate [design PR 23](https://github.com/atthewm/matthewrmckenzie.com/pull/23) also modifies shell and reading files. Reconcile overlapping changes and repeat the previews if both candidates are approved. Preserve [PR 15](https://github.com/atthewm/matthewrmckenzie.com/pull/15) and the repo's owner-data restrictions.

The prior handoff remains in main at `1354cf5`. See the session log and decisions for the release history, WHOOP integration and existing boundaries on public contact information.

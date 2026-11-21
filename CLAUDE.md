@AGENTS.md

## Claude only

On the historical offline Linux mount, Next build and Next lint need a native SWC package that the sandbox cannot download. Run npm run verify there. Use an environment with the required dependencies to finish the build gate.

If the mount prevents removing Git index locks, use a separate temporary index. The historical command sets GIT_INDEX_FILE to /tmp/repo.index and copies the repo index there before staging and committing. Use a separate temporary path per concurrent checkout. Warnings about unlinking temporary objects can appear on that mount. The macOS keychain is unavailable inside that sandbox. Hand the branch push to a session with credentials.

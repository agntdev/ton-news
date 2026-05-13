# Ton News quality control

Ton News uses automated checks to help moderators find submissions that need
editorial attention before publication. The checks support human review; they do
not replace the moderation policy or the final reviewer decision.

## Automated checks

Each pending submission receives a quality score and status in the moderation
queue.

| Check | Why it matters |
| --- | --- |
| Title length | Keeps headlines specific enough for search without becoming noisy. |
| Excerpt length | Keeps summaries useful in cards, metadata, and feeds. |
| Body depth | Flags submissions that may be too thin for evergreen coverage. |
| Source links | Encourages factual reporting based on verifiable references. |
| Tags | Keeps topic discovery consistent and avoids unfocused tagging. |
| Slug format | Highlights IDs that may be awkward for URLs or indexing. |
| Financial claims | Catches promotional or investment-advice language for extra review. |

## Score and status

Scores start at 100 and subtract points for every issue:

- Critical issue: 35 points
- Warning issue: 15 points
- Info issue: 5 points

The status is derived from the highest-severity issue:

| Status | Meaning |
| --- | --- |
| Ready | No automated issues were detected. |
| Needs review | One or more warnings should be checked before approval. |
| Blocked | A critical issue should be resolved or explicitly accepted by a moderator. |

## Moderator workflow

1. Open `/moderation` and review the queue summary.
2. Prioritize submissions marked `Blocked`, then `Needs review`.
3. Read the automated issue list and compare it with the review checklist.
4. Verify source links and any claims about TON data, teams, dates, or prices.
5. Approve, reject, or request changes with a concise reviewer note.

## Reporting

The queue header reports how many pending submissions are ready, need review, or
are blocked, plus the current count of critical issues. This gives editors a
lightweight health check for the submission backlog.

Use [`REVIEW_PROCESS.md`](REVIEW_PROCESS.md) for the approval checklist and
[`MODERATION_POLICY.md`](MODERATION_POLICY.md) for escalation, appeals, and
report handling.

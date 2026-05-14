# Ton News feedback system

Ton News collects article feedback through the article detail page and routes it
through moderator review before anything appears publicly.

## Feedback types

| Type | Use when |
| --- | --- |
| Comment | General discussion about the article. |
| Correction | A factual, spelling, date, name, or attribution correction. |
| Source tip | A source that can improve or verify the article. |
| Question | A reader question that may deserve a reply or follow-up article. |

## Submission flow

1. A signed-in reader opens an article page.
2. The reader chooses a feedback type and submits 10-1000 characters.
3. The feedback is stored as `pending`.
4. Moderators review it in `/moderation`.
5. Approved feedback appears below the article.
6. Rejected feedback remains hidden and keeps the moderator note for audit.

## Moderation rules

Approve feedback when it is relevant, civil, and useful to readers. Reject
feedback when it is spam, promotional, abusive, duplicate, off-topic, unsafe, or
missing enough context to act on.

Corrections and source tips should be checked against the article body and
source links before approval. If a correction reveals a material article issue,
update the article or create an editorial follow-up before approving the public
comment.

## Data model

Feedback records are stored in `data/comments.json` during local development.
Each record includes:

- Article slug
- Author identity
- Feedback type
- Moderation status
- Submission and review timestamps
- Optional reviewer note

The file-backed store matches the existing submission workflow and can be
replaced with a database without changing the route-level moderation flow.

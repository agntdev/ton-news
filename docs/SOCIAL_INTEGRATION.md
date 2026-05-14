# Ton News social integration

Ton News supports social sharing on article pages and optional GitHub-based
social login for contributors.

## Sharing

Every article page includes outbound share links for:

- X
- LinkedIn
- Telegram

The links use the article canonical URL and title. They do not auto-post or
track users; readers choose whether to share from their own accounts.

## GitHub login

Deployments can enable GitHub OAuth login with:

```bash
GITHUB_CLIENT_ID=...
GITHUB_CLIENT_SECRET=...
NEXT_PUBLIC_SITE_URL=https://your-ton-news.example
```

The callback URL should be:

```txt
https://your-ton-news.example/api/auth/social/github/callback
```

When configured, `/login` shows a GitHub login button. On success, Ton News
creates or reuses an author account and starts the normal session cookie flow.
When the environment variables are missing, the login page explains that GitHub
login is unavailable instead of pretending the provider works.

## Content strategy

Social posts should be useful summaries, not engagement bait:

- Lead with the article topic and why it matters to TON builders or users.
- Include the article link and one relevant tag.
- Avoid price predictions, undisclosed promotion, and exaggerated claims.
- Prefer educational threads for explainers and short posts for news updates.
- Reuse article tags to keep social topics aligned with the editorial calendar.

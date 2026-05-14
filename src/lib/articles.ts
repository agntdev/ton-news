import { listSubmissions, type Submission } from './submissions'
import { getTonStorageArticle, listTonStorageArticleRefs } from './ton-storage'

export interface Article {
  slug: string
  title: string
  excerpt: string
  body: string
  author: string
  publishedAt: string
  tags: string[]
}

export const SAMPLE_ARTICLES: Article[] = [
  {
    slug: 'ton-blockchain-guide',
    title: 'What Is TON Blockchain? A Practical Guide to The Open Network',
    excerpt:
      'Learn how TON blockchain works, why it uses sharding, and what builders should know about wallets, apps, and network fees.',
    body:
      'The Open Network, usually called TON, is a layer-one blockchain designed for fast settlement, consumer applications, and large-scale messaging-adjacent use cases. Its architecture focuses on horizontal scaling through workchains and shardchains, so the network can spread load across many chains instead of forcing every transaction through one global lane.\n\nFor users, TON is most visible through wallets, payments, collectibles, mini apps, and integrations around Telegram communities. For developers, the important starting point is that TON applications need to think carefully about asynchronous messages, smart contract addresses, fees, and user-friendly wallet flows.\n\nThe core SEO takeaway is simple: TON blockchain is not only a token network. It is an application platform with infrastructure for accounts, contracts, storage, naming, and services. That makes it relevant to teams building consumer crypto products, payment flows, games, social apps, and on-chain identity systems.',
    author: 'ton-news-team',
    publishedAt: '2026-05-13',
    tags: ['ton', 'blockchain', 'guide'],
  },
  {
    slug: 'ton-wallets-explained',
    title: 'TON Wallets Explained: Custody, Addresses, Fees, and Everyday Safety',
    excerpt:
      'A beginner-friendly overview of TON wallets, including custody models, transaction fees, address formats, and safer signing habits.',
    body:
      'A TON wallet is the user interface for holding Toncoin, signing transactions, and interacting with TON applications. Some wallets are self-custody products where the user controls recovery phrases or private keys. Others are custodial services where a platform manages account access and recovery.\n\nTON users should understand that signing is permission. Before approving a transaction, check the destination, amount, attached message, and the application asking for access. Small network fees are normal, but unexpected transfers, unfamiliar contract calls, or rushed prompts should be treated carefully.\n\nFor builders, wallet UX is a major adoption factor. Clear transaction descriptions, predictable fee estimates, and safe fallback states help users trust TON apps. Wallet documentation should explain custody, backups, phishing risks, and how to verify official app links.',
    author: 'ton-news-team',
    publishedAt: '2026-05-13',
    tags: ['wallets', 'security', 'ton'],
  },
  {
    slug: 'ton-validators-and-staking',
    title: 'TON Validators and Staking: How Network Security Works',
    excerpt:
      'Understand the role of TON validators, nominators, staking pools, and the operational practices that support network reliability.',
    body:
      'TON validators help secure the network by participating in consensus, producing blocks, and checking state transitions. Validators need reliable infrastructure, monitoring, and sufficient stake because downtime or misconfiguration can reduce performance and harm network quality.\n\nMany users do not run validator hardware directly. Instead, they may participate through nomination or staking pool systems depending on the available tools and their risk preferences. The key distinction is that staking is not a guaranteed return product; it is a network participation mechanism with operational and market risks.\n\nA healthy validator ecosystem depends on decentralization, transparent performance data, and responsible operations. TON coverage should track validator counts, uptime, software upgrades, and community tooling because these signals help readers understand the network beyond price movement.',
    author: 'ton-news-team',
    publishedAt: '2026-05-13',
    tags: ['validators', 'staking', 'network'],
  },
  {
    slug: 'ton-smart-contracts',
    title: 'TON Smart Contracts: Messages, State, and Developer Patterns',
    excerpt:
      'A developer-oriented introduction to TON smart contracts, asynchronous messages, state management, and practical design patterns.',
    body:
      'TON smart contracts communicate through messages. This asynchronous model is powerful, but it means developers should design for delayed execution, partial completion, and clear error handling. A contract interaction may involve multiple messages rather than one synchronous call stack.\n\nGood TON contract design starts with explicit state transitions. Contracts should validate senders, handle bounced messages where relevant, and keep storage costs understandable. Developers also need to think about upgrade paths, admin permissions, and how users will inspect contract behavior.\n\nFor teams coming from EVM ecosystems, the biggest shift is mental rather than syntactic. TON rewards designs that embrace message passing, small composable contracts, and careful wallet integration. Documentation and tests should show the full flow users will sign.',
    author: 'ton-news-team',
    publishedAt: '2026-05-13',
    tags: ['smart-contracts', 'developers', 'ton'],
  },
  {
    slug: 'ton-storage-overview',
    title: 'TON Storage Overview: Decentralized Files for Apps and Media',
    excerpt:
      'Explore how TON Storage fits into the TON ecosystem and when decentralized file storage can help applications and publishers.',
    body:
      'TON Storage is part of the broader TON infrastructure vision: applications should be able to store and retrieve files without depending entirely on a single centralized host. For publishers, this can mean more resilient article assets, media archives, or application bundles.\n\nDecentralized storage does not remove the need for product discipline. Teams still need content addressing, backup policies, moderation rules, and clear user expectations around availability. Large files, copyrighted media, and private data require extra care.\n\nFor TON News, storage matters because article text, images, and verification materials may eventually benefit from content-addressed publication. The practical path is to start with clean metadata, stable slugs, and repeatable backup procedures before moving assets onto decentralized infrastructure.',
    author: 'ton-news-team',
    publishedAt: '2026-05-13',
    tags: ['storage', 'infrastructure', 'media'],
  },
  {
    slug: 'telegram-mini-apps-and-ton',
    title: 'Telegram Mini Apps and TON: Why Distribution Matters',
    excerpt:
      'Telegram Mini Apps give TON builders a consumer distribution surface, but sustainable products still need trust, retention, and utility.',
    body:
      'Telegram Mini Apps can put crypto experiences inside familiar chat and community flows. That distribution advantage is one reason TON receives attention from consumer app teams, game developers, and payment products that want lower onboarding friction.\n\nDistribution is not the same as retention. A TON Mini App still needs clear value, safe wallet prompts, fast loading, and understandable recovery paths. If a product only depends on incentives, users may leave when rewards slow down.\n\nThe strongest TON Mini App strategies combine familiar Telegram entry points with real product utility. Examples include community tools, payments, creator features, games with durable economies, and services where on-chain ownership improves the experience instead of distracting from it.',
    author: 'ton-news-team',
    publishedAt: '2026-05-13',
    tags: ['telegram', 'mini-apps', 'adoption'],
  },
  {
    slug: 'ton-defi-basics',
    title: 'TON DeFi Basics: Swaps, Liquidity, Bridges, and Risk',
    excerpt:
      'A plain-language guide to TON DeFi concepts, including decentralized exchanges, liquidity pools, bridges, and common user risks.',
    body:
      'TON DeFi includes decentralized exchanges, liquidity pools, lending experiments, bridges, and payment tools. These products can make assets more useful, but they also introduce smart contract risk, liquidity risk, oracle risk, and user-error risk.\n\nUsers should understand slippage, pool depth, fees, and bridge assumptions before moving funds. A high advertised yield or fast-moving token is not a substitute for reading documentation and checking whether contracts have been reviewed.\n\nFor analysts, TON DeFi should be measured by more than total value locked. Useful signals include active wallets, swap volume quality, liquidity concentration, stablecoin availability, incident history, and whether applications solve real user problems.',
    author: 'ton-news-team',
    publishedAt: '2026-05-13',
    tags: ['defi', 'liquidity', 'risk'],
  },
  {
    slug: 'ton-nft-collectibles',
    title: 'TON NFTs and Collectibles: Utility Beyond Profile Pictures',
    excerpt:
      'TON NFTs can represent collectibles, memberships, game items, tickets, and identity-linked assets across consumer applications.',
    body:
      'NFTs on TON can be used for art and collectibles, but the broader opportunity is programmable ownership. A collectible can unlock community access, represent a game item, prove attendance, or act as a portable membership credential.\n\nGood NFT projects need clear metadata, durable media, transparent mint rules, and honest communication about utility. Users should be cautious around rushed drops, copied art, and promises that depend only on resale demand.\n\nTON is interesting for NFT builders because consumer distribution and wallet access can be smoother than in many crypto environments. The projects most likely to last will treat NFTs as product features, not just speculative objects.',
    author: 'ton-news-team',
    publishedAt: '2026-05-13',
    tags: ['nft', 'collectibles', 'consumer'],
  },
  {
    slug: 'ton-developer-tooling',
    title: 'TON Developer Tooling: What Builders Need Before Launch',
    excerpt:
      'A checklist for TON builders covering local development, contract tests, wallet flows, monitoring, documentation, and launch readiness.',
    body:
      'TON developer tooling should help teams move from prototype to production with confidence. A basic stack includes contract language support, local testing, deployment scripts, wallet connection flows, and clear logs for message-based interactions.\n\nBefore launch, teams should test failed transactions, bounced messages, insufficient fees, duplicate submissions, and interrupted user sessions. Monitoring should cover application errors, contract events, wallet connection failures, and infrastructure health.\n\nStrong tooling reduces support load. Documentation, examples, typed helpers, and repeatable deployment steps make it easier for new developers to build on TON without relying on private knowledge or fragile manual processes.',
    author: 'ton-news-team',
    publishedAt: '2026-05-13',
    tags: ['developers', 'tooling', 'launch'],
  },
  {
    slug: 'ton-ecosystem-metrics',
    title: 'TON Ecosystem Metrics: What to Track Beyond Token Price',
    excerpt:
      'Track TON ecosystem health with active wallets, developer activity, validator reliability, app retention, liquidity, and content quality.',
    body:
      'Token price is the loudest TON metric, but it is not the only useful one. Ecosystem health is better understood through active wallets, transaction quality, developer activity, app retention, validator reliability, and liquidity depth.\n\nPublishers should separate short-term market attention from durable adoption. A spike in transactions may come from incentives, a game launch, a wallet migration, or spam. Context matters, and good reporting explains what changed and why readers should care.\n\nA balanced TON metrics dashboard should combine network data, developer signals, user behavior, and qualitative product updates. This helps founders, validators, investors, and users understand whether the ecosystem is becoming more useful over time.',
    author: 'ton-news-team',
    publishedAt: '2026-05-13',
    tags: ['metrics', 'ecosystem', 'seo'],
  },
  {
    slug: 'welcome-to-ton-news',
    title: 'Welcome to Ton News',
    excerpt:
      'A community-edited, SEO-focused publication covering The Open Network.',
    body:
      'Ton News is the front page for the TON ecosystem. This scaffold ships the structure; future tasks add submission, moderation, and TON storage integration.',
    author: 'ton-news-team',
    publishedAt: '2026-05-13',
    tags: ['announcement'],
  },
]

function submissionToArticle(submission: Submission): Article {
  return {
    slug: submission.id,
    title: submission.title,
    excerpt: submission.excerpt,
    body: submission.body,
    author: submission.authorName,
    publishedAt: (submission.reviewedAt ?? submission.submittedAt).slice(0, 10),
    tags: submission.tags,
  }
}

export async function listPublishedArticles(): Promise<Article[]> {
  const approved = await listSubmissions({ status: 'approved' })
  const fromSubmissions = approved.map(submissionToArticle)
  const tonStorageRefs = await listTonStorageArticleRefs()
  const fromTonStorage = tonStorageRefs.map((ref) => ({
    slug: ref.slug,
    title: ref.title,
    excerpt: ref.excerpt,
    body: '',
    author: ref.author,
    publishedAt: ref.publishedAt,
    tags: ref.tags,
  }))
  return [...fromTonStorage, ...fromSubmissions, ...SAMPLE_ARTICLES].sort((a, b) =>
    b.publishedAt.localeCompare(a.publishedAt),
  )
}

export async function getArticleBySlug(slug: string): Promise<Article | null> {
  const tonStorageArticle = await getTonStorageArticle(slug)
  if (tonStorageArticle) return tonStorageArticle
  const articles = await listPublishedArticles()
  return articles.find((article) => article.slug === slug) ?? null
}

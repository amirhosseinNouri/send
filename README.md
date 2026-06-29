# Send

Send a **structured message** to a chat provider — from code or the command line.

Supported providers: **Slack**, **Microsoft Teams**, **Telegram**, **Element/Matrix**, **Mattermost**.

A message is provider-agnostic:

```ts
interface Message {
  title?: string;
  body: string;
  markdown?: boolean; // render the body as markdown in the provider's native format
}
```

Each provider renders it into its own native format (Slack blocks, Teams MessageCard,
Telegram/Element markdown, Mattermost attachment). With `markdown: true` the body is
rendered as rich markdown; otherwise it is sent as plain text.

## Install

```sh
npm i @amirhosseinnouri/send
# or run directly, no install:
npx @amirhosseinnouri/send --help
```

## Programmatic API

```ts
import { send, createSender } from "@amirhosseinnouri/send";

// one-shot — flat config + message
await send({
  provider: "slack",
  webhookUrl: "https://hooks.slack.com/services/...",
  title: "Release 1.2.0",
  body: "## Changes\n- Fixed a bug",
  markdown: true,
});

// reusable sender bound to one provider
const sender = createSender({ provider: "telegram", botToken: "T", chatId: "42" });
await sender.send({ body: "hello" });
```

Exports also include the zod schemas (`senderConfigSchema`, `messageSchema`,
`providerConfigSchemas`, ...) and the `PROVIDERS` list for consumers that want to
validate input or reuse the per-provider config shapes.

### Provider config

| provider     | config keys                                    |
| ------------ | ---------------------------------------------- |
| `slack`      | `webhookUrl`                                   |
| `teams`      | `webhookUrl`                                   |
| `mattermost` | `webhookUrl`                                   |
| `telegram`   | `botToken`, `chatId`                           |
| `element`    | `homeserverUrl`, `accessToken`, `roomId`       |

## CLI

```sh
send --provider slack --webhook-url <url> \
  --title "Release 1.2" --body "Bug **fixes**" --markdown
```

- Provider config flags: `--webhook-url` (slack/teams/mattermost);
  `--bot-token --chat-id` (telegram);
  `--homeserver-url --access-token --room-id` (element).
- Body: `--body <text>` (required).
- `--title` optional. `--markdown` renders the body as markdown (off by default).

```sh
send --provider telegram --bot-token T --chat-id 42 --title Hi --body "the body"
```

## Examples by provider

Each block shows the CLI invocation and the equivalent programmatic call.

### Slack

```sh
send --provider slack \
  --webhook-url https://hooks.slack.com/services/T000/B000/XXXX \
  --title "Release 1.2.0" --body "Bug **fixes** and improvements" --markdown
```

```ts
await send({
  provider: "slack",
  webhookUrl: "https://hooks.slack.com/services/T000/B000/XXXX",
  title: "Release 1.2.0",
  body: "Bug **fixes** and improvements",
  markdown: true,
});
```

### Microsoft Teams

```sh
send --provider teams \
  --webhook-url https://outlook.office.com/webhook/XXXX/IncomingWebhook/YYYY \
  --title "Deploy complete" --body "Shipped to **production**" --markdown
```

```ts
await send({
  provider: "teams",
  webhookUrl: "https://outlook.office.com/webhook/XXXX/IncomingWebhook/YYYY",
  title: "Deploy complete",
  body: "Shipped to **production**",
  markdown: true,
});
```

### Telegram

```sh
send --provider telegram \
  --bot-token 123456:ABC-DEF1234ghIkl \
  --chat-id -1001234567890 \
  --title "Alert" --body "Disk usage at *90%*" --markdown
```

```ts
await send({
  provider: "telegram",
  botToken: "123456:ABC-DEF1234ghIkl",
  chatId: "-1001234567890",
  title: "Alert",
  body: "Disk usage at *90%*",
  markdown: true,
});
```

### Element / Matrix

```sh
send --provider element \
  --homeserver-url https://matrix.org \
  --access-token syt_XXXX \
  --room-id '!abc123:matrix.org' \
  --title "CI" --body "Build **passed**" --markdown
```

```ts
await send({
  provider: "element",
  homeserverUrl: "https://matrix.org",
  accessToken: "syt_XXXX",
  roomId: "!abc123:matrix.org",
  title: "CI",
  body: "Build **passed**",
  markdown: true,
});
```

### Mattermost

```sh
send --provider mattermost \
  --webhook-url https://chat.example.com/hooks/xxxxxxxxxxxxxxxxx \
  --title "Backup" --body "Nightly backup `OK`" --markdown
```

```ts
await send({
  provider: "mattermost",
  webhookUrl: "https://chat.example.com/hooks/xxxxxxxxxxxxxxxxx",
  title: "Backup",
  body: "Nightly backup `OK`",
  markdown: true,
});
```

## License

MIT

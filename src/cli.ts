import commandLineArgs from "command-line-args";
import { z } from "zod";
import { parseConfig } from "@/lib/config";
import { optionDefinitions } from "@/lib/flags";
import { createSender } from "@/providers";
import { messageSchema } from "@/schema/sender";

const USAGE = `send — post a structured message to a chat provider

Usage:
  send --provider <slack|teams|telegram|element|mattermost> [config] --body <text> [options]

Provider config:
  slack | teams | mattermost   --webhook-url <url>
  telegram                     --bot-token <token> --chat-id <id>
  element                      --homeserver-url <url> --access-token <token> --room-id <id>

Message:
  --title <text>               Optional heading
  --body <text>                Message body
  --markdown                   Render the body as markdown

Examples:
  send --provider slack --webhook-url https://hooks.slack.com/... \\
    --title "Release 1.2" --body "Bug **fixes**" --markdown

  send --provider telegram --bot-token T --chat-id 42 --title Hi --body "the body"
`;

function fail(message: string): never {
	process.stderr.write(`${message}\n`);
	process.exit(1);
}

/** Message and control flags read directly here; config flags go to parseConfig. */
type CliValues = Record<string, unknown> & {
	provider?: string;
	title?: string;
	body?: string;
	markdown?: boolean;
	help?: boolean;
};

async function main(): Promise<void> {
	const values = commandLineArgs(optionDefinitions, {
		camelCase: true,
	}) as CliValues;

	if (values.help || !values.provider) {
		process.stdout.write(USAGE);
		process.exit(values.help ? 0 : 1);
	}

	const config = parseConfig(values);

	const messageResult = messageSchema.safeParse({
		title: values.title,
		body: values.body,
		markdown: values.markdown,
	});
	if (!messageResult.success) {
		fail(
			`Invalid message (a body is required):\n${z.prettifyError(messageResult.error)}`,
		);
	}

	const sender = createSender(config);
	try {
		await sender.send(messageResult.data);
		process.stdout.write(`Sent to ${sender.name}.\n`);
	} catch (error) {
		fail(`Failed to send to ${sender.name}: ${(error as Error).message}`);
	}
}

main().catch((error) => fail((error as Error).message));

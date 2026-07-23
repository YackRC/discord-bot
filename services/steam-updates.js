const fs = require('node:fs/promises');
const path = require('node:path');

const MARATHON_APP_ID = '3065800';

const MARATHON_NEWS_URL =
	'https://api.steampowered.com/' +
	'ISteamNews/GetNewsForApp/v2/' +
	`?appid=${MARATHON_APP_ID}`;

const updatesFile = path.join(
	__dirname,
	'..',
	'data',
	'updates.json',
);

/**
 * Read updates that have already been handled.
 */
async function readStoredUpdates() {
	try {
		const contents = await fs.readFile(
			updatesFile,
			'utf8',
		);

		const updates = JSON.parse(contents);

		if (!Array.isArray(updates)) {
			throw new TypeError(
				'data/updates.json must contain a JSON array.',
			);
		}

		return updates;
	}
	catch (error) {
		if (error.code === 'ENOENT') {
			console.log(
				'data/updates.json was not found. Starting fresh.',
			);

			return [];
		}

		throw error;
	}
}

/**
 * Save stored updates newest-first.
 */
async function writeStoredUpdates(updates) {
	await fs.mkdir(
		path.dirname(updatesFile),
		{
			recursive: true,
		},
	);

	const sortedUpdates = [...updates].sort(
		(a, b) => b.date - a.date,
	);

	await fs.writeFile(
		updatesFile,
		JSON.stringify(sortedUpdates, null, 4),
		'utf8',
	);
}

/**
 * Fetch official Marathon updates.
 *
 * Oldest-first ordering lets the initial batch appear
 * chronologically in Discord.
 */
async function fetchMarathonUpdates() {
	const response = await fetch(
		MARATHON_NEWS_URL,
		{
			signal: AbortSignal.timeout(15_000),
		},
	);

	if (!response.ok) {
		throw new Error(
			`Steam API returned ${response.status} ${response.statusText}`,
		);
	}

	const data = await response.json();
	const newsItems = data.appnews?.newsitems;

	if (!Array.isArray(newsItems)) {
		throw new Error(
			'Steam API response did not contain a newsitems array.',
		);
	}

	return newsItems
		.filter((item) => item.author === 'Marathon_Team')
		.sort((a, b) => a.date - b.date);
}

/**
 * Put the URL on its own line so Discord can create
 * the Steam preview card and image.
 */
function createUpdateMessage(update) {
	const published = new Date(update.date * 1000).toLocaleString(
		'en-US',
		{
			dateStyle: 'full',
			timeStyle: 'short',
		},
	);

	return [
		`**${update.title}**`,
		`Published: ${published}`,
		update.url,
	].join('\n');
}

/**
 * Fetch and validate the announcement channel.
 */
async function getUpdateChannel(client, channelId) {
	const channel = await client.channels.fetch(channelId);

	if (!channel) {
		throw new Error(
			`Discord channel ${channelId} was not found.`,
		);
	}

	if (!channel.isTextBased()) {
		throw new Error(
			`Discord channel ${channelId} is not text-based.`,
		);
	}

	return channel;
}

/**
 * Add an update to the stored list if it is not present.
 */
function addStoredUpdate(storedUpdates, update) {
	const alreadyStored = storedUpdates.some(
		(storedUpdate) => storedUpdate.gid === update.gid,
	);

	if (!alreadyStored) {
		storedUpdates.push(update);
	}
}

/**
 * Mark multiple updates as handled.
 */
function addStoredUpdates(storedUpdates, updates) {
	const knownGids = new Set(
		storedUpdates.map((update) => update.gid),
	);

	for (const update of updates) {
		if (!knownGids.has(update.gid)) {
			storedUpdates.push(update);
			knownGids.add(update.gid);
		}
	}
}

/**
 * Check Steam and post Marathon updates.
 *
 * First run:
 * - Post every official update returned by Steam.
 *
 * Later runs:
 * - Post only the newest unseen update.
 * - Mark all unseen updates as handled so older updates from
 *   that interval are not posted during future checks.
 */
async function checkAndPostUpdates(client, channelId) {
	const channel = await getUpdateChannel(
		client,
		channelId,
	);

	const storedUpdates = await readStoredUpdates();
	const fetchedUpdates = await fetchMarathonUpdates();

	const storedGids = new Set(
		storedUpdates.map((update) => update.gid),
	);

	const unseenUpdates = fetchedUpdates.filter(
		(update) => !storedGids.has(update.gid),
	);

	if (unseenUpdates.length === 0) {
		console.log('No new Marathon updates found.');
		return 0;
	}

	const isFirstRun = storedUpdates.length === 0;

	/*
	 * First run: send every returned update as its own message.
	 */
	if (isFirstRun) {
		console.log(
			`First run: found ${unseenUpdates.length} update(s).`,
		);

		let postedCount = 0;

		for (const update of unseenUpdates) {
			try {
				await channel.send({
					content: createUpdateMessage(update),
				});

				/*
				 * Only save an update after Discord successfully
				 * accepts the message.
				 */
				addStoredUpdate(storedUpdates, update);
				await writeStoredUpdates(storedUpdates);

				postedCount++;

				console.log(
					`Posted: ${update.title} (${update.gid})`,
				);
			}
			catch (error) {
				console.error(
					`Failed to post update ${update.gid}:`,
					error,
				);

				/*
				 * Stop processing so the failed update can be
				 * retried during the next check.
				 */
				break;
			}
		}

		return postedCount;
	}

	/*
	 * unseenUpdates is oldest-first, so the final item is newest.
	 */
	const latestUpdate = unseenUpdates.at(-1);

	await channel.send({
		content: createUpdateMessage(latestUpdate),
	});

	console.log(
		`Posted latest update: ${latestUpdate.title} ` +
		`(${latestUpdate.gid})`,
	);

	/*
	 * Mark all unseen updates as handled. Only the newest was posted,
	 * but older updates from the same interval will not be posted later.
	 */
	addStoredUpdates(storedUpdates, unseenUpdates);
	await writeStoredUpdates(storedUpdates);

	return 1;
}

module.exports = {
	fetchMarathonUpdates,
	checkAndPostUpdates,
};
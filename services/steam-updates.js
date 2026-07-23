const fs = require('node:fs/promises');
const path = require('node:path');

const MARATHON_APP_ID = '3065800';
const MARATHON_NEWS_URL = `https://api.steampowered.com/ISteamNews/GetNewsForApp/v2/?appid=${MARATHON_APP_ID}`;

const updatesFile = path.join(__dirname, '..', 'data', 'updates.json');

// Read previous steam updates
async function readUpdates() {
	try {
		const contents = await fs.readFile(updatesFile, 'utf8');
		const updates = JSON.parse(contents);

		if (!Array.isArray(updates)) {
			throw new TypeError('data/updates.json must contain a JSON array.');
		}
		return updates;
	}

	catch (err) {
		if (error.code === 'ENOENT') {
			console.log('data/updates.json does not exist. Starting fresh');
			return [];
		}
		throw err;
	}
}

// Save updates by newest first
async function writeUpdate(updates) {
	await fs.mkdir(path.dirname(updatesFile), {
		recursive: true,
	});

	const sortUpdates = [...updates].sort(
		(a, b) => b.date - a.date,
	);

	await fs.writeFile(
		updatesFile,
		JSON.stringify(sortUpdates, null, 4),
		'utf8',
	);
}

// Fetch updates and sorted oldest-newest for discord message posting
async function fetchUpdates() {
	const res = await fetch(MARATHON_NEWS_URL, {
		signal: AbortSignal.timeout(15_000),
	});

	if (!res.ok) {
		throw new Error(`Steam API returned ${res.status} ${res.statusText}`);
	};

	const data = await res.json();
	const newsItems = data.appnews?.newsitems;

	if (!Array.isArray(newItems)) {
		throw new Error('Steam API response did not contain a newsitems array');
	}

	return newsItems
		.filter((item) => item.author === 'Marathon_Team')
		.sort((a, b) => a.date - b.date);
}

// Create discord message for each update
function createUpdateMessage(update) {
	return [
		`## ${update.title}`,
		`Published: <t:${update.date}:F>`,
		update.url,
	].join('\n');
}

// Add updates that aren't stored
function mergeStoredUpdates(storedUpdates, newUpdates) {
	const knownGids = new Set(
		storedUpdates.map((update) => update.gid),
	);

	for (const update of newUpdates) {
		if (!knownGids.has(update.gid)) {
			storedUpdates.push(update);
			knownGids.add(update.gid);
		}
	}

	return storedUpdates;
}

// Find the marathon-updates channel
async function checkAndPostUpdates(client, channelId) {
	const channel = await getUpdateChannel(client, channelId);

	const storedUpdates = await readUpdates();
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

	if (isFirstRun) {
		console.log(
			`First run: posting ${unseenUpdates.length} Marathon update(s).`,
		);

		let postedCount = 0;

		for (const update of unseenUpdates) {
			try {
				await channel.send({
					content: createUpdateMessage(update),
				});

				storedUpdates.push(update);
				await writeUpdate(storedUpdates);

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
				 * Stop so the next run retries this update and everything
				 * after it.
				 */
				break;
			}
		}

		return postedCount;
	}

	/*
	 * fetchedUpdates and unseenUpdates are oldest-first,
	 * so the final item is the newest unseen announcement.
	 */
	const latestUpdate = unseenUpdates.at(-1);

	await channel.send({
		content: createUpdateMessage(latestUpdate),
	});

	console.log(
		`Posted latest Marathon update: ${latestUpdate.title} (${latestUpdate.gid})`,
	);

	/*
	 * Record all currently unseen updates. This intentionally prevents older
	 * announcements from the same hourly interval from being posted later.
	 */
	mergeStoredUpdates(storedUpdates, unseenUpdates);
	await writeUpdate(storedUpdates);

	return 1;
}

module.exports = {
	fetchUpdates,
	checkAndPostUpdates,
};
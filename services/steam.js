const MARATHON_APP_ID = '3065800';

const PLAYER_COUNT_URL =
	'https://api.steampowered.com/' +
	'ISteamUserStats/GetNumberOfCurrentPlayers/v1/';

const NEWS_URL =
	'https://api.steampowered.com/' +
	'ISteamNews/GetNewsForApp/v2/';

/**
 * Fetch the current Marathon player count.
 */
async function getPlayerCount(appId = MARATHON_APP_ID) {
	const response = await fetch(
		`${PLAYER_COUNT_URL}?appid=${appId}`,
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
	const steamResponse = data.response;

	if (!steamResponse || steamResponse.result !== 1) {
		throw new Error('Steam API returned an invalid player-count response.');
	}

	return steamResponse.player_count;
}

/**
 * Fetch the newest official Marathon update.
 */
async function getLatestUpdate(appId = MARATHON_APP_ID) {
	const response = await fetch(
		`${NEWS_URL}?appid=${appId}`,
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

	const officialUpdates = newsItems
		.filter((item) => item.author === 'Marathon_Team')
		.sort((a, b) => b.date - a.date);

	const latestUpdate = officialUpdates[0];

	if (!latestUpdate) {
		throw new Error('No official Marathon update was found.');
	}

	return latestUpdate;
}

module.exports = {
	getPlayerCount,
	getLatestUpdate,
};
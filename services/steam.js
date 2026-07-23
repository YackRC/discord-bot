const MARATHON_APP_ID = '3065800';

async function getPlayerCount(appId = MARATHON_APP_ID) {
	const url =
		'https://api.steampowered.com/' +
		'ISteamUserStats/GetNumberOfCurrentPlayers/v1/' +
		`?appid=${appId}`;

	const response = await fetch(url, {
		signal: AbortSignal.timeout(15_000),
	});

	if (!response.ok) {
		throw new Error(
			`Steam API returned ${response.status} ${response.statusText}`,
		);
	}

	const data = await response.json();
	const steamResponse = data.response;

	if (steamResponse.result !== 1) {
		throw new Error(
			`Steam API returned result ${steamResponse.result}`,
		);
	}

	return steamResponse.player_count;
}

async function getLatestUpdate(appId = MARATHON_APP_ID) {
	const url =
		'https://api.steampowered.com/' +
		'ISteamNews/GetNewsForApp/v2/' +
		`?appid=${appId}`;

	const response = await fetch(url, {
		signal: AbortSignal.timeout(15_000),
	});

	if (!response.ok) {
		throw new Error(
			`Steam API returned ${response.status} ${response.statusText}`,
		);
	}

	const data = await response.json();
	const updates = data.appnews?.newsitems;

	if (!Array.isArray(updates)) {
		throw new Error(
			'Steam API response did not contain a newsitems array.',
		);
	}

	const latestUpdate = updates.find(
		(item) => item.author === 'Marathon_Team',
	);

	if (!latestUpdate) {
		throw new Error(
			'No official Marathon update was found.',
		);
	}

	return latestUpdate;
}

module.exports = {
	getPlayerCount,
	getLatestUpdate,
};
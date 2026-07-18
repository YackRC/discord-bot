const MARATHON_APP_ID = '3065800';

async function getPlayerCount(appId = MARATHON_APP_ID) {
	const res = await fetch(`https://api.steampowered.com/ISteamUserStats/GetNumberOfCurrentPlayers/v1/?appid=${appId}`);

	if (!res.ok) {
		throw new Error(`Steam API returned ${res.status} ${res.statusText}`);
	};

	const { response: steamResponse } = await res.json();

	if (steamResponse.result !== 1) {
		throw new Error(`Steam API returned an error: ${steamResponse.result}`);
	}
	return steamResponse.player_count;
}

async function getLatestUpdate(appId = MARATHON_APP_ID) {
	const res = await fetch(`https://api.steampowered.com/ISteamNews/GetNewsForApp/v2/?appid=${appId}`);

	if (!res.ok) {
		throw new Error(`Steam API returned ${res.status} ${res.statusText}`);
	}

	const data = await res.json();
	const updates = data.appnews.newsitems;
	const latestUpdate = updates.find(
		item => item.author === 'Marathon_Team',
	);

	return latestUpdate;
}

module.exports = {
	getPlayerCount,
	getLatestUpdate,
};
const fs = require('fs/promises');

const MARATHON_APP_ID = '3065800';
const marathon = `https://api.steampowered.com/ISteamNews/GetNewsForApp/v2/?appid=${MARATHON_APP_ID}`;

async function getAllUpdates(url) {
	const file = './updates.json';
	let existing = [];

	try {
		const contents = await fs.readFile(file, 'utf8');
		existing = JSON.parse(contents);
	}
	catch {
		console.log('No existing update file found. Starting fresh');
	}


	try {
		const res = await fetch(url);

		if (!res.ok) {
			throw new Error(`HTTP error! Status ${res.status}`);
		}

		const data = await res.json();
		const newsItems = data.appnews.newsitems;

		for (const item of newsItems) {
			if (item.author == 'Marathon_Team') {

				const alreadyExists = existing.some(update => update.gid === item.gid);
				if (!alreadyExists) {
					existing.unshift(item);
				}
			}
		}

		// Keep newest first
		existing.sort((a, b) => b.date - a.date);

		await fs.writeFile(
			file,
			JSON.stringify(existing, null, 4),
		);
	}
	catch (error) {
		console.error('Error fetching data:', error.message);
	}
}

getAllUpdates(marathon);

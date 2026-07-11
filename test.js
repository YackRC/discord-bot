const { getLatestUpdate } = require('./commands/services/steam.js');

async function main() {
	try {
		const latestUpdate = await getLatestUpdate();
		console.log(latestUpdate.newsitems);
		return latestUpdate.newsitems;
	}
	catch (error) {
		console.error('Failed to fetch latest update:', error);
	}
}

main();
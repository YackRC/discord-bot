const MARATHON_APP_ID = '3065800';
const marathon = `https://api.steampowered.com/ISteamNews/GetNewsForApp/v2/?appid=${MARATHON_APP_ID}`;

async function getAllUpdates(url) {
	try {
		const res = await fetch(url);

		if (!res.ok) {
			throw new Error(`HTTP error! Status ${res.status}`);
		}

		const data = await res.json();
		console.log('Success');

		const newsItems = data.appnews.newsitems;
		for (const item of newsItems) {
			if (item.author == 'Marathon_Team') {console.log(item);}
		}
	}
	catch (error) {
		console.error('Error fetching data:', error.message);
	}
}

getAllUpdates(marathon);
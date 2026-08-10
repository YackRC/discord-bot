const path = require('node:path');

module.exports = {
	perimeter: {
		name: 'Perimeter',
		threat: 'Low',
		squadSpawns: '5 teams',
		soloSpawns: '7 to 10 runners',
		POIs: ['Hauler', 'North Relay', 'Station', 'South Relay', 'Overflow'],
		prioHostileLocation: 'Overflow',
	},
	dayMarsh: {
		name: 'Dire Marsh (Day)',
		threat: 'Medium',
		squadSpawns: '6 teams',
		soloSpawns: '8 to 12 runners',
		POIs: ['Quarantine', 'Algae Ponds', 'Greenhouse', 'Bio-Research', 'Complex', 'AI Uplink', 'Maintenance'],
		prioHostileLocation: 'Algae Ponds',
	},
	nightMarsh: {
		name: 'Dire Marsh (Night)',
		threat: 'Medium',
		squadSpawns: '6 teams',
		soloSpawns: '8 to 12 runners',
		POIs: ['Quarantine', 'Algae Ponds', 'Greenhouse', 'Bio-Research', 'Complex', 'AI Uplink', 'Maintenance'],
		prioHostileLocation: 'Between Bio-Research and Greenhouse',
		mapSecrets: {
			description: 'UESC Certs are able to open tiered lockboxes, activate radio towers, and activate Exfil Power Stations.',
			key: 'UESC Certs',
			mainEvent: {
				name: 'Upper Complex - Observation Labs',
				entry1: {
					name: 'Main Elevator Entrance',
					keyCost: '7 UESC Certs',
					location: 'North and South end of Complex',
				},
				entry2: {
					name: 'Stairwell Secret Entrance',
					keyCost: '12 UESC Certs',
					location: '4 Corner Stairwells',
				},
			},
			lockBox: {
				tier1: '1 UESC Cert',
				tier2: '3 UESC Certs',
				tier3: '5 UESC Certs',
			},
			radioTower: {
				keyCost: '3 UESC Certs',
				cacheType: ['Weapon', 'Supply', 'Gear'],
			},
		},
	},
	outpost: {
		name: 'Outpost',
		threat: 'High',
		squadSpawns: '4 teams',
		soloSpawns: '6 to 8 runners',
		POIs: ['Flight Control', 'Airfield', 'Orientation', 'Dormitories', 'Pinwheel Base', 'Processing'],
		prioHostileLocation: 'Dormitories',
		mapSecrets: {
			description: 'Clearance Codes are able to open locked rooms, activate transport drones, and activate Restricted Exfill.',
			key: {
				name:'Clearance Codes',
				keyTypes: {
					green: {
						name:'Access Clearance Codes (Green)',
						spawns: path.join(__dirname, 'assets', 'green-key-spawn.png'),
					},
					yellow: {
						name:'Supply Clearance Codes (Yellow)',
						spawns: path.join(__dirname, 'assets', 'yellow-key-spawn.png'),
					},
					red: {
						name:'Master Clearance Codes (Red)',
						spawns: path.join(__dirname, 'assets', 'red-key-spawn.png'),
					},
				},
			},
			mainEvent: {
				name: 'Pinwheel Base',
				entry1: {
					name: 'Main Entrace',
					keyCost: '2 Access Clearance Codes (Green)',
					entryLocation: path.join(__dirname, 'assets', 'main-entrance-location.png'),
				},
				entry2: {
					name: 'Conveyance Elevator',
					keyCost: 'Conveyance Request',
					entryLocation: path.join(__dirname, 'assets', 'conveyance-entrance-location.png'),
				},
				entry3: {
					name: 'Destroyed Wing',
					keyCost: '5 Destroyed Wing Boxes',
					entryLocation: path.join(__dirname, 'assets', 'destroyed-entrance-location.png'),
				},
				masterRoom: {
					name: 'Pinwheel Hub - Master Room',
					keyCost: '3 Master Clearance Codes (Red)',
				},
			},
			extraEvents: {
				armoryRoom: {
					name: 'Armory Lock Room',
					keyCost: '2 Supply Clearance Codes (Yellow) and 1 Access Clearance Code (Green)',
				},
			},
		},
	},
	cryoArchive: {
		name: 'Cryo Archive',
		threat: 'Very High',
		squadSpawns: '5 teams',
		soloSpawns: 'N/A',
		POIs: ['Cargo', 'Steerage', 'Biostock', 'Preservation', 'Revival', 'Index', 'Control'],
		prioHostileLocation: 'N/A',
	},
};
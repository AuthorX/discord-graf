'use babel';
'use strict';

import * as bot from '../';
import search from '../util/search';

export default class ModRole {
	static loadDatabase() {
		this.serversMap = JSON.parse(bot.storage.getItem('mod-roles'));
		if(!this.serversMap) this.serversMap = {};
	}

	static saveDatabase() {
		bot.logger.debug('Saving mod roles storage...', this.serversMap);
		bot.storage.setItem('mod-roles', JSON.stringify(this.serversMap));
	}

	static save(role) {
		if(!role) throw new Error('A role must be specified.');
		if(!this.serversMap) this.loadDatabase();
		if(!this.serversMap[role.server.id]) this.serversMap[role.server.id] = [];
		const serverRoles = this.serversMap[role.server.id];

		if(!serverRoles.includes(role.id)) {
			serverRoles.push(role.id);
			bot.logger.info('Added new mod role.', this.basicInfo(role));
			this.saveDatabase();
			return true;
		} else {
			bot.logger.info('Not adding mod role, because it already exists.', this.basicInfo(role));
			return false;
		}
	}

	static delete(role) {
		if(!role) throw new Error('A role must be specified.');
		if(!this.serversMap) this.loadDatabase();
		if(!this.serversMap[role.server.id]) return false;
		const serverRoles = this.serversMap[role.server.id];

		const roleIndex = serverRoles.findIndex(element => element === role.id);
		if(roleIndex >= 0) {
			serverRoles.splice(roleIndex, 1);
			bot.logger.info('Deleted mod role.', this.basicInfo(role));
			this.saveDatabase();
			return true;
		} else {
			bot.logger.info('Not deleting mod role, because it doesn\'t exist.', this.basicInfo(role));
			return false;
		}
	}

	static clearServer(server) {
		if(!server) throw new Error('A server must be specified.');
		if(!this.serversMap) this.loadDatabase();
		delete this.serversMap[server.id];
		bot.logger.info('Cleared mod roles.', { server: server.name, serverID: server.id });
		this.saveDatabase();
	}

	static findInServer(server, searchString = null) {
		if(!server) throw new Error('A server must be specified.');
		if(!this.serversMap) this.loadDatabase();
		if(!this.serversMap[server.id]) return [];

		// Find all of the server's roles that match, and filter them to ones that are mod roles
		const roles = search(server.roles, searchString, { searchExact: false }).filter(role => this.serversMap[server.id].includes(role.id));
		return search(roles, searchString, { searchInexact: false });
	}

	static serverHasAny(server) {
		if(!server) throw new Error('A server must be specified.');
		if(!this.serversMap) this.loadDatabase();
		return this.serversMap[server.id] && this.serversMap[server.id].length > 0;
	}

	static basicInfo(role) {
		return { id: role.id, name: role.name, server: role.server.name, serverID: role.server.id };
	}
}

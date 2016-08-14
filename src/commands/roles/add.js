'use babel';
'use strict';

import ModRole from '../../database/mod-role';
import search from '../../util/search';
import disambiguation from '../../util/disambiguation';
import usage from '../../util/command-usage';
import * as permissions from '../../util/permissions';
import CommandFormatError from '../../util/errors/command-format';
import { roleID } from '../../util/patterns';

export default {
	name: 'addmodrole',
	aliases: ['addmod'],
	group: 'roles',
	groupName: 'add',
	description: 'Adds a moderator role.',
	usage: 'addmodrole <role>',
	details: 'The role must be the name or ID of a role, or a role mention. Only administrators may use this command.',
	examples: ['addmodrole cool', 'addmodrole 205536402341888001', 'addmodrole @CoolPeopleRole'],
	serverOnly: true,

	isRunnable(message) {
		return permissions.isAdmin(message.server, message.author);
	},

	async run(message, args) {
		if(!args[0]) throw new CommandFormatError(this, message.server);
		const matches = roleID.exec(args[0]);
		let roles;
		const idRole = message.server.roles.get('id', matches[1]);
		if(idRole) roles = [idRole]; else roles = search(message.server.roles, matches[1]);

		if(roles.length === 1) {
			if(ModRole.save(roles[0])) {
				return `Added "${roles[0].name}" to the moderator roles.`;
			} else {
				return `Unable to add "${roles[0].name}" to the moderator roles. It already is one.`;
			}
		} else if(roles.length > 1) {
			return disambiguation(roles, 'roles');
		} else {
			return `Unable to identify role. Use ${usage('roles', message.server)} to view all of the server roles.`;
		}
	}
};

'use babel';
'use strict';

import { stripIndents } from 'common-tags';
import ModRole from '../../database/mod-role';
import * as permissions from '../../permissions';
import CommandFormatError from '../../errors/command-format';
import Util from '../../util';

export default {
	name: 'deletemodrole',
	aliases: ['removemodrole', 'delmodrole', 'removemod', 'deletemod', 'delmod'],
	group: 'roles',
	groupName: 'delete',
	description: 'Deletes a moderator role.',
	usage: 'deletemodrole <role>',
	details: 'The role must be the name or ID of a role, or a role mention. Only administrators may use this command.',
	examples: ['deletemodrole cool', 'deletemodrole 205536402341888001', 'deletemodrole @CoolPeopleRole'],
	serverOnly: true,

	isRunnable(message) {
		return permissions.isAdmin(message.server, message.author);
	},

	async run(message, args) {
		if(!args[0]) throw new CommandFormatError(this, message.server);
		const matches = Util.patterns.roleID.exec(args[0]);
		let roles;
		const idRole = message.server.roles.get('id', matches[1]);
		if(idRole) roles = [idRole]; else roles = ModRole.findInServer(message.server, matches[1]);

		if(roles.length === 1) {
			if(ModRole.delete(roles[0])) {
				return stripIndents`
					Removed "${roles[0].name}" from the moderator roles.
					${ModRole.findInServer(message.server).length === 0 ? 'Since there are no longer any moderator roles, moderators will be determined by the "Manage messages" permission.' : ''}
				`;
			} else {
				return `Unable to remove "${roles[0].name}" from the moderator roles. It isn\'t one.`;
			}
		} else if(roles.length > 1) {
			return Util.disambiguation(roles, 'roles');
		} else {
			return `Unable to identify role. Use ${Util.usage('modroles', message.server)} to view the moderator roles, and ${Util.usage('roles', message.server)} to view all of the server roles.`;
		}
	}
};

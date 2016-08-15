'use babel';
'use strict';

import { stripIndents } from 'common-tags';
import UsableChannel from '../../database/usable-channel';
import * as permissions from '../../permissions';
import CommandFormatError from '../../errors/command-format';
import Util from '../../util';

export default {
	name: 'disallowchannel',
	aliases: ['disallowchan', 'deletechannel', 'deletechan', 'delchan', 'removechannel', 'removechan'],
	group: 'channels',
	groupName: 'disallow',
	description: 'Disallows command operation in a channel.',
	usage: 'disallowchannel <channel>',
	details: 'The channel must be the name or ID of a channel, or a channel mention. Only administrators may use this command.',
	examples: ['disallowchannel #CoolChannel', 'disallowchannel cool', 'disallowchannel 205536402341888001'],
	serverOnly: true,

	isRunnable(message) {
		return permissions.isAdmin(message.server, message.author);
	},

	async run(message, args) {
		if(!args[0]) throw new CommandFormatError(this, message.server);
		const matches = Util.patterns.channelID.exec(args[0]);
		const idChannel = message.server.channels.get('id', matches[1]);
		const allowedChannels = UsableChannel.findInServer(message.server);
		if(allowedChannels.length > 0) {
			const channels = idChannel ? [idChannel] : UsableChannel.findInServer(message.server, matches[1]);
			if(channels.length === 1) {
				if(UsableChannel.delete(channels[0])) {
					return stripIndents`
						Disallowed operation in ${channels[0]}.
						${UsableChannel.findInServer(message.server).length === 0 ? 'Since there are no longer any allowed channels, operation is now allowed in all channels.' : ''}
					`;
				} else {
					return `Operation is already not allowed in ${channels[0]}.`;
				}
			} else if(channels.length > 1) {
				return Util.disambiguation(channels, 'channels');
			} else {
				return `Unable to identify channel. Use ${Util.usage('allowedchannels', message.server)} to view the allowed channels.`;
			}
		} else {
			const serverChannels = message.server.channels.getAll('type', 'text');
			const channels = idChannel ? [idChannel] : Util.search(serverChannels, args[0]);
			if(channels.length === 1) {
				const index = serverChannels.indexOf(channels[0]);
				serverChannels.splice(index, 1);
				for(const chn of serverChannels) UsableChannel.save(chn);
				return stripIndents`
					Disallowed operation in ${channels[0]}.
					Since there were no allowed channels already, all other channels have been allowed.
				`;
			} else if(channels.length > 1) {
				return Util.disambiguation(channels, 'channels');
			} else {
				return `Unable to identify channel. Use ${Util.usage('allowedchannels', message.server)} to view the allowed channels.`;
			}
		}
	}
};

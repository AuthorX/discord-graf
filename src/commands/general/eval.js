'use babel';
'use strict';

/* eslint-disable no-unused-vars */
import util from 'util';
import stringArgv from 'string-argv';
import * as bot from '../../';
import config from '../../config';
import version from '../../version';
import * as commands from '..';
import * as dispatcher from '../dispatcher';
import Setting from '../../database/setting';
import ModRole from '../../database/mod-role';
import search from '../../util/search';
import disambiguation from '../../util/disambiguation';
import pagination from '../../util/pagination';
import buildCommandPattern from '../../util/command-pattern';
import * as permissions from '../../util/permissions';
import * as usage from '../../util/command-usage';
import * as nbsp from '../../util/nbsp';
import * as patterns from '../../util/patterns';
import FriendlyError from '../../util/errors/friendly';
import CommandFormatError from '../../util/errors/command-format';
/* eslint-enable no-unused-vars */

let lastResult;

export default {
	name: 'eval',
	group: 'general',
	groupName: 'eval',
	description: 'Evaluates input as JavaScript.',
	usage: 'eval <script>',
	details: 'Only the bot owner may use this command.',

	isRunnable(message) {
		return message.author.id === config.owner;
	},

	async run(message, args) {
		if(!args[0]) throw new CommandFormatError(this, message.server);
		const msg = message; // eslint-disable-line no-unused-vars
		try {
			lastResult = eval(args[0]);
			return `Result: \`${util.inspect(lastResult, { depth: 0 })}\``;
		} catch(err) {
			return `Error while evaluating: ${err}`;
		}
	}
};

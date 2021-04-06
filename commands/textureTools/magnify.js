const prefix = process.env.PREFIX;

const strings = require('../../res/strings');

const { magnify }  = require('../../functions/magnify.js');
const { warnUser } = require('../../functions/warnUser.js');

module.exports = {
	name: 'magnify',
	aliases: ['zoom', 'scale', 'resize', 'm'],
	description: strings.HELP_DESC_MAGNIFY,
	guildOnly: false,
	uses: strings.COMMAND_USES_ANYONE,
	syntax: `${prefix}magnify <factor> & attach an image\n${prefix}magnify <factor> <Discord message url>\n${prefix}magnify <factor> <image URL>\n${prefix}magnify <factor> <message ID>\n${prefix}magnify <factor> [up/^/last]`,
	example: `${prefix}magnify 5`,
	async execute(client, message, args) {
		let FACTOR;
		let DATA;

		if (args != '') {

			// <factor>
			if (!isNaN(args[0]) && args[0] > 1) {
				FACTOR = args[0];
			} else return warnUser(message, strings.MAGNIFY_FACTOR_TOO_SMALL)

			// <data>
			// image attached
			if ((args[1] == undefined || args[1] == '') && message.attachments.size > 0) {
				DATA = message.attachments.first().url;
				return magnify(message, FACTOR, DATA);
			}

			// previous image
			else if ((args[1] == undefined || args[1] == '' || args[1] == 'up' || args[1] == '^' || args[1] == 'last') && message.attachments.size == 0) {
				return PreviousImage(FACTOR);
			}

			// Discord message URL
			else if (args[1].startsWith('https://discord.com/channels')) {
				message.channel.messages.fetch(args[1].split('/').pop()).then(msg => {
					if (msg.attachments.size > 0) {
						DATA = msg.attachments.first().url;
						return magnify(message, FACTOR, DATA);
					}
					else return warnUser(message, strings.COMMAND_MESSAGE_IMAGE_NOT_ATTACHED);
				}).catch(error => { return warnUser(message, strings.COMMAND_URL_ONLY_SAME_CHANNEL) });
			}

			// Image URL
			else if (args[1].startsWith('https://') || args[1].startsWith('http://')) {
				if (args[1].endsWith('.png') || args[1].endsWith('.jpeg') || args[1].endsWith('.jpg') || args[1].endsWith('.gif')) {
					DATA = args[1];
					return magnify(message, FACTOR, DATA);
				} else return warnUser(message, strings.COMMAND_INVALID_EXTENSION)
			}

			// Discord message ID
			else if (!isNaN(args[1])) {
				message.channel.messages.fetch(args[1]).then(msg => {
					if (msg.attachments.size > 0) {
						DATA = msg.attachments.first().url;
						return magnify(message, FACTOR, DATA);
					}
					else return warnUser(message, strings.COMMAND_ID_IMAGE_NOT_ATTACHED);
				}).catch(error => {
					return warnUser(message,error);
				})
			}
		} else return warnUser(message, strings.MAGNIFY_NO_ARGS_GIVEN);

		async function PreviousImage(FACTOR) {
			var found = false;
			var messages = [];
			var list_messages = await message.channel.messages.fetch({ limit: 10 });
			messages.push(...list_messages.array());

			for (var i in messages) {
				var msg = messages[i]
				var url = '';
				try {
					if (msg.attachments.size > 0) {
						found = true;
						url = msg.attachments.first().url;
						break;
					}
					else if (msg.embeds[0] != undefined && msg.embeds[0] != null && msg.embeds[0].image) {
						found = true;
						url = msg.embeds[0].image.url;
						break;
					}
				} catch(e) {
					return warnUser(message, strings.COMMAND_NO_IMAGE_FOUND);
				}
			}

			if (found) await magnify(message, FACTOR, url);
			else return warnUser(message, strings.COMMAND_NO_IMAGE_FOUND);
		}
	}
}

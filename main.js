
exportGenshinData();

function exportGenshinData() {
	const { exportCurve, exportData } = require('./extract/global.js');

	// exportData('characters', require('./extract/extractCharacter.js'));
	// exportCurve('characters', 'AvatarCurveExcelConfigData');
	// exportData('constellations', require('./extract/extractConstellation'));
	// exportData('talents', require('./extract/extractTalent.js'));
	// exportData('weapons', require('./extract/extractWeapon.js'));
	// exportCurve('weapons', 'WeaponCurveExcelConfigData')
	// exportData('artifacts', require('./extract/extractArtifact.js'));
	// exportData('foods', require('./extract/extractFood'));
	// exportData('materials', require('./extract/extractMaterial')); // change: used both TextList/JumpList.
	// exportData('domains', require('./extract/extractDomain')); // in the future use levelConfigMap to manually map to domain entrance name
	// exportData('enemies', require('./extract/extractEnemy'));
	// exportCurve('enemies', 'MonsterCurveExcelConfigData');

	// no // //exportData('domains', require('./extract/extractDomainMonsterList')); // run only after both domains and enemies have run. sync.

	// exportData('outfits', require('./extract/extractOutfit'));
	// exportData('windgliders', require('./extract/extractWindGlider'));
	// exportData('animals', require('./extract/extractAnimal'));
	// exportData('namecards', require('./extract/extractNamecard'));
	// exportData('geographies', require('./extract/extractGeography'));
	// exportData('achievements', require('./extract/extractAchievement'));
	// exportData('achievementgroups', require('./extract/extractAchievementGroup'));
	// exportData('adventureranks', require('./extract/extractAdventureRank'));
	// exportData('crafts', require('./extract/extractCraft'));
	// exportData('emojis', require('./extract/extractEmoji'));
	// exportData('emojisets', require('./extract/extractEmojiSet')); // dont release this. waste of space
	// exportData('voiceovers', require('./extract/extractVoiceover'));
	// writeVOFile();

	// exportData('tcgcharactercards', require('./extract/extractTcgCharacterCard'));
	// exportData('tcgenemycards', require('./extract/extractTcgEnemyCard'));
	// exportData('tcgactioncards', require('./extract/extractTcgActionCard'));
	// exportData('tcgstatuseffects', require('./extract/extractTcgStatusEffect'));
	// exportData('tcgsummons', require('./extract/extractTcgSummon'));
	// exportData('tcgkeywords', require('./extract/extractTcgKeyword'));
	// exportData('tcgdetailedrules', require('./extract/extractTcgDetailedRule'));
	// // // exportData('tcgsprites', require('./extract/extractTcgSprite'));
	// // // exportData('tcgshopitems', require('./extract/extractTcgShopItem'));

	// exportData('tcglevelrewards', require('./extract/extractTcgLevelReward'));
	// exportData('tcgcardboxes', require('./extract/extractTcgCardBox'));
	// exportData('tcgcardbacks', require('./extract/extractTcgCardBack'));




	// // exportData('commissions', require('./extract/extractCommission'), true); // unfinished

	// // exportData('fishingpoints', require('./extractFishingPoint'));  // unfinished
}

function writeVOFile() {
	const fs = require('fs');
	const config = require('./config.json');
	const voiceovers = require(`${config.genshin_export_folder}/EN/voiceovers.json`);

	let vofiles = Object.values(voiceovers).flatMap(voiceover => {
		const friendFiles = voiceover.friendLines.flatMap(line => {
			if (line.hasGenderedVoicefile) return [line.voicefile, line.voicefile_male];
			else return line.voicefile;
		});
		const actionFiles = voiceover.actionLines.flatMap(line => {
			if (line.hasGenderedVoicefile) return [line.voicefile, line.voicefile_male];
			else return line.voicefile;
		});

		return friendFiles.concat(actionFiles);
	});

	vofiles = vofiles.map(file => file.replaceAll('/', '\\')+'.wem');

	fs.writeFileSync('./voice/db-vo.txt', vofiles.join('\n'));
}
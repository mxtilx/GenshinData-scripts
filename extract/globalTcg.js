require('./global.js');
const fs = require('fs');

// Goes through binoutput to get data on tcg skill's damage and element
const tcgSkillKeyMap = {};
global.loadTcgSkillKeyMap = function() {
	if (tcgSkillKeyMap.loaded) return tcgSkillKeyMap;
	const filelist = fs.readdirSync(`${config.GenshinData_folder}/BinOutput/GCG/Gcg_DeclaredValueSet`);

	// Find DAMAGEVALUEPROP and ELEMENTVALUEPROP
	const tmpf = require(`${config.GenshinData_folder}/BinOutput/GCG/Gcg_DeclaredValueSet/Char_Skill_13023.json`);
	const tmpo = Object.values(tmpf)[1];
	tcgSkillKeyMap.DAMAGEVALUEPROP = Object.entries(tmpo['-2060930438']).find(([key, val]) => typeof val === 'number')[0];
	tcgSkillKeyMap.ELEMENTVALUEPROP = Object.entries(tmpo['476224977']).find(([key, val]) => val.startsWith('GCG'))[0];
	// console.log(tcgSkillKeyMap);
	if (!tcgSkillKeyMap.DAMAGEVALUEPROP || !tcgSkillKeyMap.ELEMENTVALUEPROP)
		console.log('ERROR: loadTcgSkillKeyMap is missing a property map!');

	for (const filename of filelist) {
		if (!filename.endsWith('.json')) continue;

		const fileObj = require(`${config.GenshinData_folder}/BinOutput/GCG/Gcg_DeclaredValueSet/${filename}`);

		try {
			const dataname = fileObj.name; //filename.replace('.json', '');
			const uncutmap = Object.values(fileObj)[1];

			tcgSkillKeyMap[dataname] = {};

			for (let [key, kobj] of Object.entries(uncutmap)) {
				switch (key) {
				case '-2060930438': // extract basedamage
					tcgSkillKeyMap[dataname].basedamage = kobj['value'] || kobj[tcgSkillKeyMap.DAMAGEVALUEPROP];
					if (tcgSkillKeyMap[dataname].basedamage === undefined) console.log(`loadTcgSkillKeyMap failed to extract basedamage from ${filename}`);
					break;
				case '1428448537': // D__KEY__DAMAGE_2
				case '1428448538':
				case '1428448539':
				case '1428448540':
				case '1428448541':
				case '1428448542':
					const damagekey = `damage_${parseInt(key)-1428448535}`;
					tcgSkillKeyMap[dataname][damagekey] = kobj['value'] || kobj[tcgSkillKeyMap.DAMAGEVALUEPROP];
					if (tcgSkillKeyMap[dataname][damagekey] === undefined) console.log(`loadTcgSkillKeyMap failed to extract damage key: ${key}`);
					break;
				case '476224977': // extract baseelement
					tcgSkillKeyMap[dataname].baseelement = kobj['value'] || kobj[tcgSkillKeyMap.ELEMENTVALUEPROP] || 'GCG_ELEMENT_NONE';
					if (tcgSkillKeyMap[dataname].baseelement === undefined) console.log('loadTcgSkillKeyMap failed to extract baseelement');
					break;
				// case '-1197212178': // effectnum
				// 	tcgSkillKeyMap[dataname].effectnum = kobj['value'] || kobj[tcgSkillKeyMap.EFFECTNUMVALUEPROP];
				// 	if (tcgSkillKeyMap[dataname].effectnum === undefined) console.log('loadTcgSkillKeyMap failed to extract effectnum');
				// 	break;
				}
			}

		} catch(e) {
			continue;
		}
	}

	tcgSkillKeyMap.loaded = true;
	// console.log(tcgSkillKeyMap)
	return tcgSkillKeyMap;
}

global.getDescriptionReplaced = function(data, description, translation, errormessage, skillkeydata) {
	const xcard = getExcel('GCGCardExcelConfigData');
	const xchar = getExcel('GCGCharExcelConfigData');
	const xskill = getExcel('GCGSkillExcelConfigData');
	const xelement = getExcel('GCGElementExcelConfigData');
	const xkeyword = getExcel('GCGKeywordExcelConfigData');
	const propKeywordId = getPropNameWithMatch(xelement, 'type', 'GCG_ELEMENT_CRYO', 101);

	let ind = description.indexOf('$[');
	while (ind !== -1) {
		const strToReplace = description.substring(ind, description.indexOf(']', ind)+1);
		let replacementText = strToReplace;

		let selector = strToReplace.substring(2, strToReplace.length-1).split('|');
		if (selector.length > 2) console.log(`Tcg description ${strToReplace} has extra pipes for ${data.name}`);
		selector = selector[1];
		if (selector === 'nc') selector = undefined;

		switch (description[ind+2]) {
			case 'D': // D__KEY__DAMAGE or D__KEY__ELEMENT
				switch (description[ind+10]) {
					case 'D': // DAMAGE
						if (description[ind+16] === '_') { // D__KEY__DAMAGE_2
							const damagekey = `damage_`+description[ind+17];

							if (!skillkeydata[damagekey]) {
								console.log(`skillkeydata ${errormessage} is missing damage key ${damagekey}`);
								console.log(skillkeydata)
							}
							replacementText = skillkeydata[damagekey]+'';

						} else {
							if (data.basedamage === undefined && skillkeydata.damage_2 && data.id === 22042) {
								replacementText = skillkeydata.damage_2+'';

							} else { // idk what im even doing
								replacementText = data.basedamage+'';

								if (data.basedamage === undefined) {
									console.log(description)
									console.log(`Tcg object is missing skill base damage for skill ${errormessage} for data id ${data.id}`);
								}
							}
						}

						break;

					case 'E': // ELEMENT
						const element = data.baseelement === 'GCG_ELEMENT_NONE' ? undefined : data.baseelement;
						const keywordId = xelement.find(e => e.type === element)[propKeywordId];
						const elementTextMapHash = xkeyword.find(e => e.id === keywordId).titleTextMapHash;
						replacementText = translation[elementTextMapHash];
						break;

					default:
						console.log(`Tcg description has unhandled replacement letter ${description[ind+2]} for ${data.name}`);
						break;
				}
				break;

			// case 'I':
			// 	 break;

			case 'C': // GCGCard
				const cardId = parseInt(description.substring(ind+3, description.indexOf(']', ind)), 10);
				const cardObj = xcard.find(e => e.id === cardId);
				const cardName = translation[cardObj.nameTextMapHash];

				replacementText = cardName;
				break;

			case 'K': // GCGKeyword
				const keywordId = parseInt(description.substring(ind+3, description.indexOf(']', ind)), 10);
				const keywordObj = xkeyword.find(e => e.id === keywordId);
				const keywordName = translation[keywordObj.titleTextMapHash];

				replacementText = keywordName;
				break;

			case 'A': // GCGChar
				const charId = parseInt(description.substring(ind+3, description.indexOf(']', ind)), 10);
				const charObj = xchar.find(e => e.id === charId);
				const charName = translation[charObj.nameTextMapHash];

				replacementText = charName;
				break;

			case 'S': // GCGSkill
				const skillId = parseInt(description.substring(ind+3, description.indexOf(']', ind)), 10);
				const skillObj = xskill.find(e => e.id === skillId);

				if (skillObj === undefined) {
					console.log(`No skillObj found to replace in description:`);
					console.log('  '+description);
				} else {

					const skillName = translation[skillObj.nameTextMapHash];

					replacementText = skillName;
				}
				break;

			// case 'S':
			// 	break;

			default:
				console.log(`Tcg description has unhandled replacement letter ${description[ind+2]} for ${data.name}`);
				break;
		}

		// console.log('===========');
		// console.log(description);
		// console.log(selector);
		// console.log(replacementText);

		const splitText = replacementText.split('|');
		if (selector && splitText.find(s => s.startsWith(selector))) {
			replacementText = splitText.find(s => s.startsWith(selector)).split(':')[1];
		} else {
			replacementText = splitText[0];
		}

		description = description.replaceAll(strToReplace, replacementText);

		ind = description.indexOf('$[', ind+1);
	}

	description = description.replaceAll('${[GCG_TOKEN_SHIELD]}', '{GCG_TOKEN_SHIELD}');

	if (description.indexOf('$') !== -1) 
		console.log(`Tcg description has unreplaced text for:\n  ${description} `);
	// Replace {PLURAL#1|pt.|pts.}
	ind = description.indexOf('{PLURAL');
	while (ind !== -1) {
		const strToReplace = description.substring(ind, description.indexOf('}', ind)+1);
		let replacementText = strToReplace;

		const values = strToReplace.substring(1, strToReplace.length-1).split('|');
		const number = parseInt(values[0].split('#')[1], 10);
		if (number === 1) replacementText = values[1];
		else if (number > 1) replacementText = values[2];
		else console.log(`Tcg plural has unhandled value ${number} for ${strToReplace} for ${data.name}`);

		description = description.replaceAll(strToReplace, replacementText);

		ind = description.indexOf('{PLURAL', ind+1);
	}

	return description;
}

global.getTcgTagImage = function(tag) {
	switch (tag) {
	case 'GCG_TAG_SLOWLY':
		return 'UI_Gcg_Tag_Card_CombatAction';

	case 'GCG_TAG_TALENT':
		return 'UI_Gcg_Tag_Card_Talent';
	case 'GCG_TAG_WEAPON':
		return 'UI_Gcg_Tag_Card_Weapon';
	case 'GCG_TAG_ARTIFACT':
		return 'UI_Gcg_Tag_Card_Relic';
	case 'GCG_TAG_PLACE':
		return 'UI_Gcg_Tag_Card_Location';
	case 'GCG_TAG_ALLY':
		return 'UI_Gcg_Tag_Card_Ally';
	case 'GCG_TAG_ITEM':
		return 'UI_Gcg_Tag_Card_Item';
	case 'GCG_TAG_RESONANCE':
		return 'UI_Gcg_Tag_Card_Sync';
	case 'GCG_TAG_FOOD':
		return 'UI_Gcg_Tag_Card_Food';
	case 'GCG_TAG_SHEILD':
		return 'UI_Gcg_Tag_Card_Shield';
	case 'GCG_TAG_LEGEND':
		return 'UI_Gcg_Tag_Card_Legend';
	// case 'GCG_TAG_VEHICLE':
	// 	return ''; // i dont know what the image name for this is

	case 'GCG_TAG_WEAPON_NONE':
		return 'UI_Gcg_Tag_Weapon_None';
	case 'GCG_TAG_WEAPON_CATALYST':
		return 'UI_Gcg_Tag_Weapon_Catalyst';
	case 'GCG_TAG_WEAPON_BOW':
		return 'UI_Gcg_Tag_Weapon_Bow';
	case 'GCG_TAG_WEAPON_CLAYMORE':
		return 'UI_Gcg_Tag_Weapon_Claymore';
	case 'GCG_TAG_WEAPON_POLE':
		return 'UI_Gcg_Tag_Weapon_Polearm';
	case 'GCG_TAG_WEAPON_SWORD':
		return 'UI_Gcg_Tag_Weapon_Sword';

	case 'GCG_TAG_ELEMENT_NONE':
		return 'UI_Gcg_Tag_Element_None';
	case 'GCG_TAG_ELEMENT_CRYO':
		return 'UI_Gcg_Tag_Element_Ice';
	case 'GCG_TAG_ELEMENT_HYDRO':
		return 'UI_Gcg_Tag_Element_Water';
	case 'GCG_TAG_ELEMENT_PYRO':
		return 'UI_Gcg_Tag_Element_Fire';
	case 'GCG_TAG_ELEMENT_ELECTRO':
		return 'UI_Gcg_Tag_Element_Electric';
	case 'GCG_TAG_ELEMENT_ANEMO':
		return 'UI_Gcg_Tag_Element_Wind';
	case 'GCG_TAG_ELEMENT_GEO':
		return 'UI_Gcg_Tag_Element_Rock';
	case 'GCG_TAG_ELEMENT_DENDRO':
	case 'GCG_TAG_DENDRO_PRODUCE':
		return 'UI_Gcg_Tag_Element_Grass';

	case 'GCG_TAG_NATION_LIYUE':
		return 'UI_Gcg_Tag_Faction_Liyue';
	case 'GCG_TAG_NATION_MONDSTADT':
		return 'UI_Gcg_Tag_Faction_Mondstadt';
	case 'GCG_TAG_NATION_INAZUMA':
		return 'UI_Gcg_Tag_Faction_Inazuma';
	case 'GCG_TAG_NATION_SUMERU':
		return 'UI_Gcg_Tag_Faction_Sumeru';
	case 'GCG_TAG_NATION_FONTAINE':
		return 'UI_Gcg_Tag_Faction_Fontaine';

	case 'GCG_TAG_ARKHE_OUSIA':
		return 'UI_Gcg_Tag_Faction_Ousia';
	case 'GCG_TAG_ARKHE_PNEUMA':
		return 'UI_Gcg_Tag_Faction_Pneuma';

	case 'GCG_TAG_CAMP_MONSTER':
		return 'UI_Gcg_Tag_Faction_Monster';
	case 'GCG_TAG_CAMP_HILICHURL':
		return 'UI_Gcg_Tag_Faction_Hili';
	case 'GCG_TAG_CAMP_FATUI':
		return 'UI_Gcg_Tag_Faction_Fatui';
	case 'GCG_TAG_CAMP_KAIRAGI':
		return 'UI_Gcg_Tag_Faction_Kairagi';
	case 'GCG_TAG_CAMP_EREMITE':
		return 'UI_Gcg_Tag_Faction_Eremite';
	case 'GCG_TAG_CAMP_SACREAD':
		return 'UI_Gcg_Tag_Faction_Sacred';
	default:
		console.log(`Tag ${tag} does not have an image mapped in global.getTcgTagImage(tag)`);
	}
}

global.getTcgHintIcon = function(type) {
	switch (type) {
	case 'GCG_HINT_HEAL':
		return 'UI_Gcg_Buff_Common_Element_Heal';
	case 'GCG_HINT_CRYO':
		return 'UI_Gcg_Buff_Common_Element_Ice';
	case 'GCG_HINT_HYDRO':
		return 'UI_Gcg_Buff_Common_Element_Water';
	case 'GCG_HINT_PYRO':
		return 'UI_Gcg_Buff_Common_Element_Fire';
	case 'GCG_HINT_ELECTRO':
		return 'UI_Gcg_Buff_Common_Element_Electric';
	case 'GCG_HINT_ANEMO':
		return 'UI_Gcg_Buff_Common_Element_Wind';
	case 'GCG_HINT_DENDRO':
		return 'UI_Gcg_Buff_Common_Element_Grass';
	case 'GCG_HINT_GEO':
		return 'UI_Gcg_Buff_Common_Element_Rock';
	// case 'GCG_HINT_PHYSICAL':
		//return 'UI_Gcg_Buff_Common_Element_Physics';
	}
	console.log(`Hint type ${type} does not have an image mapped in global.getTcgHintIcon`);
}

// UI_Gcg_Buff_
global.getTcgStatusIcon = function(cardid, type) {
	switch (cardid) {

	}

	switch (type) {
	case 'GCG_':
		return ''


	}
	console.log(`Status type ${type} does not have an image mapped in global.getTcgStatusIcon`);
}
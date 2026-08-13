require('./globalTcg.js');

const xmat = getExcel('MaterialExcelConfigData');
const xback = getExcel('GCGDeckBackExcelConfigData');
xback[0].id = 100;

const propSource = getPropNameWithMatch(xback, 'id', 101, 2711962534);

const skipdupelog = [];
function collate(lang) {
	const language = getLanguage(lang);
	const dupeCheck = {};
	let mydata = xback.reduce((accum, obj) => {
		let data = {};
		data.id = obj.id;

		data.name = sanitizeName(language[obj.nameTextMapHash]);

		data.description = sanitizeDescription(language[obj.descTextMapHash]);
		data.descriptionraw = language[obj.descTextMapHash];

		data.source = language[obj[propSource]];

		const mat = xmat.find(e => e.id === obj.itemId);
		data.rarity = mat.rankLevel;
		data.filename_icon = mat.icon;
		data.filename_icon_HD = mat.icon + '_HD';

		let filename = makeUniqueFileName(obj.nameTextMapHash, accum);
		if (filename === '') return accum;
		checkDupeName(data, dupeCheck, skipdupelog);
		accum[filename] = data;
		if (!validName(data.name)) console.log(`${__filename.split(/[\\/]/).pop()} invalid data name: ${data.name}`);

		return accum;
	}, {});

	return mydata;
}

module.exports = collate;
require('./global.js');

const xview = getExcel('ViewCodexExcelConfigData');
const xcity = getExcel('CityConfigData');
const xarea = getExcel('WorldAreaConfigData');

function collageGeography(lang) {
	const language = getLanguage(lang);
	const dupeCheck = {};
	let mygeography = xview.reduce((accum, obj) => {

		let data = {};
		data.id = obj.id;

		data.name = language[obj.nameTextMapHash];
		data.areaName = language[xarea.find(area => area.id === obj.worldAreaId).areaNameTextMapHash];
		data.areaId = obj.worldAreaId;
		data.description = sanitizeDescription(language[obj.descTextMapHash]);
		data.regionName = language[xcity.find(city => city.cityId === obj.cityId)[getCityNameTextMapHash()]];
		data.regionId = obj.cityId;
		data.showOnlyUnlocked = obj.showOnlyUnlocked ? true : undefined;
		data.sortOrder = obj.sortOrder;

		// console.log(obj.cityID);

		data.filename_image = obj.image;

		let filename = makeFileName(getLanguage('EN')[obj.nameTextMapHash]);
		if(filename === '') return accum;
		if(accum[filename] !== undefined) console.log('filename collision: ' + filename);
		checkDupeName(data, dupeCheck);
		accum[filename] = data;
		return accum;
	}, {});

	return mygeography;
}


let cityNameTextMapHash = undefined;
function getCityNameTextMapHash() {
	if(cityNameTextMapHash !== undefined) return cityNameTextMapHash;
	for (let [key, value] of Object.entries(xcity[0])) {
		if (typeof value === 'number' && getLanguage('EN')[value] === 'Mondstadt') {
			cityNameTextMapHash = key;
			return cityNameTextMapHash;
		}
	}
}


module.exports = collageGeography;
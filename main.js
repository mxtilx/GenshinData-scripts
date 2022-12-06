const { exportCurve, exportData } = require('./extract/global.js');

exportData('characters', require('./extract/extractCharacter.js'));
exportCurve('characters', 'AvatarCurveExcelConfigData');
exportData('constellations', require('./extract/extractConstellation'));
exportData('talents', require('./extract/extractTalent.js'));
exportData('weapons', require('./extract/extractWeapon.js'));
exportCurve('weapons', 'WeaponCurveExcelConfigData')
exportData('artifacts', require('./extract/extractArtifact.js'));
exportData('foods', require('./extract/extractFood'));
exportData('materials', require('./extract/extractMaterial')); // change: used both TextList/JumpList.
exportData('domains', require('./extract/extractDomain')); // run twice
exportData('enemies', require('./extract/extractEnemy'));
exportCurve('enemies', 'MonsterCurveExcelConfigData');

exportData('domains', require('./extract/extractDomainMonsterList')); // MUST do run only after both domains and enemies have run. sync.

exportData('outfits', require('./extract/extractOutfit'));
exportData('windgliders', require('./extract/extractWindGlider'));
exportData('animals', require('./extract/extractAnimal'));
exportData('namecards', require('./extract/extractNamecard'));
exportData('geographies', require('./extract/extractGeography'));
exportData('achievements', require('./extract/extractAchievement'));
exportData('achievementgroups', require('./extract/extractAchievementGroup'));
exportData('adventureranks', require('./extract/extractAdventureRank'));
exportData('crafts', require('./extract/extractCraft'));






// exportData('commissions', require('./extract/extractCommission'), true); // unfinished
// exportData('voiceovers', require('./extract/extractVoiceover'), true); // unfinished

// // exportData('fishingpoints', require('./extractFishingPoint'));  // unfinished

export class D35E {
    get version() {
        return 2;
    }
    get id() {
        return 'D35E';
    }
    async actorRollSkill(actor, skillId) {
        let roll = await actor.rollSkill(skillId);
        return this.fixReadySetRoll(roll);
    }
    async actorRollAbility(actor, abilityId) {
        let roll = await actor.rollAbilityTest(abilityId);
        return this.fixReadySetRoll(roll);
    }
    fixReadySetRoll(roll) {
        if (roll === null) {
            return null;
        }
        if (roll.total === undefined) {
            if (roll.fields !== undefined && roll.fields[2] !== undefined) {
                roll = roll.fields[2][1]?.roll;
            }
        }
        return roll;
    }
    actorCurrenciesGet(actor) {
        function addCurrency(currency) {
            if (currency)
                Object.entries(currency).forEach(([k, v]) => (currencies[k] = (currencies[k] ?? 0) + v));
        }
        const currencies = {};
        addCurrency(actor.system.currency);
        addCurrency(actor.system.altCurrency);
        addCurrency(actor.system.customCurrency);
        return currencies;
    }
    async actorCurrenciesStore(actor, currencies) {
        await actor.update({ system: { currency: currencies } });
    }
    actorSheetAddTab(sheet, html, actor, tabData, tabBody) {
        if (sheet.constructor.name !== 'Character')
            return;
        const tabs = $(html).find('.tabs[data-group="primary"]');
        const tabItem = $('<a class="item" data-tab="' + tabData.id + '">' + tabData.label + '</a>');
        tabs.append(tabItem);
        const body = $(html).find('.primary-body');
        const tabContent = $('<div class="tab" data-group="primary" data-tab="' + tabData.id + '"></div>');
        body.append(tabContent);
        tabContent.append(tabBody);
        if (sheet.position.width < 836) {
            sheet.position.width = 836;
            sheet.element[0].style.width = '836px';
        }
    }
    itemSheetReplaceContent(app, html, element) {
        html.find('.summary')[0].innerHTML = '<li>Recipe</li>';
        if (game.user.isGM === false && app.object.system.identified === false)
            return;
        const sheetNavigation = html.find('.sheet-navigation[data-group=primary]');
        const initialTab = app._initialTab.primary === 'crafting';
        sheetNavigation.append($(`<a class="item ${initialTab ? 'active' : ''}" data-tab="crafting">Crafting</a>`));
        const body = $(`<div class="tab crafting ${initialTab ? 'active' : ''}" data-group="primary" data-tab="crafting"></div>`);
        body.append(element);
        html.find('.primary-body').append(body);
    }
    get configSkills() {
        function includeSubSkills(actor) {
            arbitrarySkills.forEach((id) => {
                const skill = actor.system.skills[id];
                if (skill === undefined)
                    return;
                Object.entries(skill.namedSubSkills).forEach(([k, v]) => {
                    const subSkillId = `${id}.namedSubSkills.${k}`;
                    if (subSkillId in skills)
                        return;
                    const label = `${CONFIG['D35E'].skills[id]}: ${v.name}`;
                    skills[subSkillId] = { id: subSkillId, label };
                });
            });
        }
        const arbitrarySkills = CONFIG['D35E'].arbitrarySkills;
        const skills = {};
        Object.entries(CONFIG['D35E'].skills).forEach(([id, label]) => {
            if (arbitrarySkills.includes(id) === false)
                skills[id] = { id, label };
        });
        game.actors.forEach(includeSubSkills);
        return Object.values(skills).sort((a, b) => a.label.localeCompare(b.label));
    }
    get configAbilities() {
        return Object.entries(CONFIG['D35E'].abilities).map((ab) => {
            return { id: ab[0], label: ab[1] };
        });
    }
    get configCurrencies() {
        const currencies = [
            {
                id: 'pp',
                factor: 1000,
                label: CONFIG['D35E'].currencies.pp,
            },
            {
                id: 'gp',
                factor: 100,
                label: CONFIG['D35E'].currencies.gp,
            },
            {
                id: 'sp',
                factor: 10,
                label: CONFIG['D35E'].currencies.sp,
            },
            {
                id: 'cp',
                factor: 1,
                label: CONFIG['D35E'].currencies.cp,
            },
        ];
        game.settings.get('D35E', 'currencyConfig').currency.forEach(([id, label, weight, factor, group]) => {
            currencies.push({ id, factor, label });
        });
        return currencies;
    }
    get configCanRollAbility() {
        return true;
    }
    get configLootItemType() {
        return 'loot';
    }
    get itemPriceAttribute() {
        return 'system.price';
    }
    get itemQuantityAttribute() {
        return 'system.quantity';
    }
}

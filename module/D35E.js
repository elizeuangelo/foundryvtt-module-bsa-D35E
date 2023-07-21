export class D35E {
    get version() {
        return 2;
    }
    get id() {
        return "D35E";
    }
    async actorRollSkill(actor, skillId) {
        let roll = await actor.rollSkill(skillId);
        return this.fixReadySetRoll(roll);
    }
    async actorRollAbility(actor, abilityId) {
        let roll = await actor.rollAbilityTest(abilityId);
        return this.fixReadySetRoll(roll);
    }
    async actorRollTool(actor, item) {
        let roll = await item.rollToolCheck();
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
        return actor["system"].currency;
    }
    async actorCurrenciesStore(actor, currencies) {
        await actor.update({ system: { currency: currencies } });
    }
    actorSheetAddTab(sheet, html, actor, tabData, tabBody) {
        const tabs = $(html).find('.tabs[data-group="primary"]');
        const tabItem = $('<a class="item" data-tab="' + tabData.id + '">' + tabData.label + '</a>');
        tabs.append(tabItem);
        const body = $(html).find(".sheet-body");
        const tabContent = $('<div class="tab" data-group="primary" data-tab="' + tabData.id + '"></div>');
        body.append(tabContent);
        tabContent.append(tabBody);
    }
    get configSkills() {
        return Object.entries(game["D35E"].config.skills)
            .map(skills => {
            return { id: skills[0], label: skills[1].label };
        });
    }
    get configAbilities() {
        return Object.entries(game["D35E"].config.abilities).map(ab => {
            return { id: ab[0], label: ab[1] };
        });
    }
    get configCurrencies() {
        return [
            {
                id: "pp",
                factor: 1000,
                label: game["D35E"].config.currencies.pp.label
            },
            {
                id: "gp",
                factor: 100,
                label: game["D35E"].config.currencies.gp.label
            },
            {
                id: "ep",
                factor: 50,
                label: game["D35E"].config.currencies.ep.label
            },
            {
                id: "sp",
                factor: 10,
                label: game["D35E"].config.currencies.sp.label
            },
            {
                id: "cp",
                factor: 1,
                label: game["D35E"].config.currencies.cp.label
            }
        ];
    }
    get configCanRollAbility() {
        return true;
    }
    get configLootItemType() {
        return "loot";
    }
    get itemPriceAttribute() {
        return "system.price";
    }
    get itemQuantityAttribute() {
        return "system.quantity";
    }
}

export class D35E implements SystemApi {
	get version() {
		return 2;
	}

	get id() {
		return 'D35E';
	}

	async actorRollSkill(actor, skillId): Promise<Roll | null> {
		let roll = await actor.rollSkill(skillId);
		return this.fixReadySetRoll(roll);
	}

	async actorRollAbility(actor, abilityId): Promise<Roll | null> {
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

	actorCurrenciesGet(actor): Currencies {
		function addCurrency(currency?: Currencies) {
			if (currency) Object.entries(currency).forEach(([k, v]) => (currencies[k] = (currencies[k] ?? 0) + v));
		}
		const currencies: Currencies = {};
		addCurrency(actor.system.currency);
		addCurrency(actor.system.altCurrency);
		addCurrency(actor.system.customCurrency);
		return currencies;
	}

	async actorCurrenciesStore(actor, currencies: Currencies): Promise<void> {
		await actor.update({ system: { currency: currencies } });
	}

	actorSheetAddTab(sheet, html, actor, tabData: { id: string; label: string; html: string }, tabBody: string): void {
		// Only applies to the standard Character Sheet
		if (sheet.constructor.name !== 'Character') return;

		const tabs = $(html).find('.tabs[data-group="primary"]');
		const tabItem = $('<a class="item" data-tab="' + tabData.id + '">' + tabData.label + '</a>');
		tabs.append(tabItem);
		const body = $(html).find('.primary-body');
		const tabContent = $('<div class="tab" data-group="primary" data-tab="' + tabData.id + '"></div>');
		body.append(tabContent);
		tabContent.append(tabBody);

		// Expands the sheet
		if (sheet.position.width < 836) {
			sheet.position.width = 836;
			sheet.element[0].style.width = '836px';
		}
	}

	itemSheetReplaceContent(app, html, element): void {
		html.find('.summary')[0].innerHTML = '<li>Recipe</li>';
		if (game.user!.isGM === false && app.object.system.identified === false) return;

		const sheetNavigation = html.find('.sheet-navigation[data-group=primary]');
		const initialTab = app._initialTab.primary === 'crafting';
		sheetNavigation.append($(`<a class="item ${initialTab ? 'active' : ''}" data-tab="crafting">Crafting</a>`));

		const body = $(`<div class="tab crafting ${initialTab ? 'active' : ''}" data-group="primary" data-tab="crafting"></div>`);
		body.append(element);
		html.find('.primary-body').append(body);
	}

	get configSkills(): SkillConfig[] {
		function includeSubSkills(actor) {
			arbitrarySkills.forEach((id) => {
				const skill = actor.system.skills[id];
				if (skill === undefined) return;
				Object.entries(skill.namedSubSkills).forEach(([k, v]) => {
					const subSkillId = `${id}.namedSubSkills.${k}`;
					if (subSkillId in skills) return;
					const label = `${CONFIG['D35E'].skills[id]}: ${(v as { name: string }).name}`;
					skills[subSkillId] = { id: subSkillId, label };
				});
			});
		}
		const arbitrarySkills = CONFIG['D35E'].arbitrarySkills;
		const skills: Record<string, { id: string; label: string }> = {};
		Object.entries(CONFIG['D35E'].skills).forEach(([id, label]: [string, string]) => {
			if (arbitrarySkills.includes(id) === false) skills[id] = { id, label };
		});
		game.actors!.forEach(includeSubSkills);
		return Object.values(skills).sort((a, b) => a.label.localeCompare(b.label));
	}

	get configAbilities(): AbilityConfig[] {
		return Object.entries(CONFIG['D35E'].abilities).map((ab) => {
			return { id: ab[0], label: ab[1] as string };
		});
	}

	get configCurrencies(): CurrencyConfig[] {
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
		(
			game.settings.get('D35E', 'currencyConfig') as { currency: [string, string, number, number, string][] }
		).currency.forEach(([id, label, weight, factor, group]) => {
			currencies.push({ id, factor, label });
		});
		return currencies;
	}

	get configCanRollAbility(): boolean {
		return true;
	}

	get configLootItemType(): string {
		return 'loot';
	}

	get itemPriceAttribute(): string {
		return 'system.price';
	}

	get itemQuantityAttribute(): string {
		return 'system.quantity';
	}
}

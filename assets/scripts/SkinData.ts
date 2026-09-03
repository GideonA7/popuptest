/**
 * 定义皮肤的4种类型：球杆、拖尾、落袋、球桌
 */
export enum SkinType {
    Cue,
    Trail,
    Pocket,
    Table,
};

/**
 * 定义皮肤的稀有程度：普通、稀有、史诗
 */
export enum SkinRarity {
    Common,
    Rare,
    Epic,
};

/**
 * 定义皮肤的配置信息：皮肤id、皮肤类型、皮肤预览图路径、是否是默认皮肤、皮肤稀有程度
 */
export interface SkinConfig {
    id: number;
    type: SkinType;
    previewPath: string;
    isDefault?: boolean;
    rarity: SkinRarity;
};

/**
 * 定义玩家对这个皮肤的状态：皮肤id、拥有这个皮肤的数量、是否是新皮肤
 */
export interface PlayerSkinState {
    skinId: number;
    count: number;
    isNew: boolean;
};

/**
 * 定义每个类型的皮肤状态：皮肤类型、是否有新皮肤提示、这个类别下正在使用的皮肤的皮肤id
 */
export interface SkinTypeState {
    type: SkinType;
    hasNewTip: boolean;
    inUseSkinId: number | null;
};

export class SkinData {
    private skinConfigs: SkinConfig[] = [];   // 保存皮肤配置数据
    private playerSkinStates: PlayerSkinState[] = [];  // 保存玩家对皮肤的状态数据
    private skinTypeStates: SkinTypeState[] = [];  // 保存每个类型的皮肤状态数据

    constructor() {
        // 导入球杆数据
        this.createSkinConfigs(SkinType.Cue, 20, SkinRarity.Common);
        this.createSkinConfigs(SkinType.Cue, 10, SkinRarity.Rare);
        this.createSkinConfigs(SkinType.Cue, 6, SkinRarity.Epic);

        // 导入拖尾数据
        this.createSkinConfigs(SkinType.Trail, 5, SkinRarity.Common);
        this.createSkinConfigs(SkinType.Trail, 1, SkinRarity.Rare);
        this.createSkinConfigs(SkinType.Trail, 1, SkinRarity.Epic);

        // 导入落袋数据
        this.createSkinConfigs(SkinType.Pocket, 1, SkinRarity.Common);
        this.createSkinConfigs(SkinType.Pocket, 3, SkinRarity.Rare);
        this.createSkinConfigs(SkinType.Pocket, 1, SkinRarity.Epic);

        // 导入球桌数据
        const tableDefaultId = this.skinConfigs.length + 1;
        this.createSkinConfigs(SkinType.Table, 7, SkinRarity.Common);
        this.createSkinConfigs(SkinType.Table, 3, SkinRarity.Rare);
        this.createSkinConfigs(SkinType.Table, 2, SkinRarity.Epic);

        this.setIsDefault(1);   // 设置第一个球杆是默认皮肤
        this.setIsDefault(tableDefaultId);   // 设置导入的第一个球桌是默认球桌

        // 玩家库存数据：测试不同玩家库存状态，可以改这里的数据（实际这里的数据应该从服务端接收）
        this.playerSkinStates = [
            { skinId: 1, count: 1, isNew: false },
            { skinId: 2, count: 5, isNew: false },
            { skinId: 6, count: 22, isNew: true },
            { skinId: 10, count: 100, isNew: false },
            { skinId: 13, count: 99, isNew: false },
            { skinId: 37, count: 21, isNew: false },
            { skinId: 40, count: 3, isNew: false },
            { skinId: 45, count: 21, isNew: true },
            { skinId: 46, count: 5, isNew: false },
            { skinId: 50, count: 1, isNew: false },
            { skinId: 55, count: 105, isNew: true },
        ];

        // 皮肤类型状态数据：测试不同皮肤类型状态，可以改这里的数据（实际这里的数据应该从服务端接收）
        this.skinTypeStates = [
            { type: SkinType.Cue, hasNewTip: false, inUseSkinId: 2 },
            { type: SkinType.Trail, hasNewTip: false, inUseSkinId: 40 },
            { type: SkinType.Pocket, hasNewTip: false, inUseSkinId: 46 },
            { type: SkinType.Table, hasNewTip: false, inUseSkinId: 50 },
        ];

        this.initNewTips();   // 根据playerSkinStates中的isNew状态，初始化4个tab中的hasNewTip状态
    }

    /**
     * 快速写入皮肤配置数据到configs中
     * @param type 皮肤类型
     * @param count 要加入到configs中的皮肤数量
     * @param rarity 皮肤的稀有程度
     */
    private createSkinConfigs(type: SkinType, count: number, rarity: SkinRarity): void {
        const id = this.skinConfigs.length + 1;   // 皮肤的id
        const pathName = type === SkinType.Cue ? "cue" : type === SkinType.Trail ? "trail" : type === SkinType.Pocket ? "pocket" : "table";   // 路径名称，统一根据类型分类存放的皮肤
        const rarityName = rarity === SkinRarity.Common ? "common" : rarity === SkinRarity.Rare ? "rare" : "epic";   // 稀有程度名称，统一根据稀有程度分类存放的皮肤
        for (let i = 0; i < count; i++) {
            const num = String(i + 1).padStart(2, '0');   // 皮肤编号，统一根据编号分类存放的皮肤
            // 拼接出来的路径比如：texture/cue/common/Property 1=01/spriteFrame
            this.skinConfigs.push({ id: id + i, type: type, previewPath: `texture/${pathName}/${rarityName}/Property 1=${num}/spriteFrame`, rarity: rarity });   // 将皮肤配置数据push到configs中
        }
    }

    /**
     * 根据类型获取皮肤配置数据
     * @param type 皮肤类型
     * @returns 该类型下的所有皮肤配置数据
     */
    public getSkinConfigs(type: SkinType): SkinConfig[] {
        return this.skinConfigs.filter(config => config.type === type);
    }

    public getPlayerSkinStates(): PlayerSkinState[] {
        return this.playerSkinStates;
    }

    public getSkinTypeStates(): SkinTypeState[] {
        return this.skinTypeStates;
    }

    /**
     * 设置该类别中哪个皮肤是 使用中 的状态 （根据id设置）
     * @param type 皮肤类型
     * @param skinId 正在使用的皮肤id
     */
    public setInUseSkinId(type: SkinType, skinId: number | null): void {
        const typeState = this.skinTypeStates.find(item => item.type === type);
        if (typeState) {
            typeState.inUseSkinId = skinId;   // 设置正在使用的皮肤id,为null表示现在不使用任何皮肤
        }
    }

    /**
     * 根据id设置皮肤为默认皮肤 （这里主要设置 cue 和 table 两个有默认皮肤）
     * @param id 需要设置成默认皮肤的id
     */
    private setIsDefault(id: number) {
        const config = this.skinConfigs.find(item => item.id === id);
        if (config) {
            config.isDefault = true;
        }
    }

    /**
     * 根据玩家库存中state里的isNew状态 ——> 设置4个tab中的hasNewTip状态
     */
    private initNewTips() {
        for (const state of this.playerSkinStates) {
            if (!state.isNew) continue;   // 这个皮肤的状态不是isNew就下一个
            
            // 如果这个皮肤的状态是 新获得的 那就根据state中的skinid和config中的id对比，得到这个item对应的config
            const config = this.skinConfigs.find(item => item.id === state.skinId);

            // 根据config中的type，找到该type对应的typestate，并设置他的hasNewTips状态为true
            const typeState = this.skinTypeStates.find(item => item.type === config?.type);
            if (typeState) {
                typeState.hasNewTip = true;
            }
        }
    }
}
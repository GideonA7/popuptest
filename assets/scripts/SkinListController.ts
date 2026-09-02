import { _decorator, Button, Component, instantiate, Node, Prefab } from 'cc';
import { PlayerSkinState, SkinConfig, SkinData, SkinType, SkinTypeState } from './SkinData';
import { SkinItemView } from './SkinItemView';
const { ccclass, property } = _decorator;

export type SkinListClickCallback = (skinType: SkinType, skinId: number | null) => void;

@ccclass('SkinListController')
export class SkinListController extends Component {
    @property(Prefab)
    cueItem: Prefab;

    @property(Prefab)
    trailItem: Prefab;

    @property(Prefab)
    pocketItem: Prefab;

    @property(Prefab)
    tableItem: Prefab;

    @property(Prefab)
    noEffectItem: Prefab;

    private skinType: SkinType;   // 接收皮肤类型，实例化对应的列表

    private skinData: SkinData;
    private clickCallback: SkinListClickCallback | null = null;

    init(skinData: SkinData, clickCallback: SkinListClickCallback) {
        this.skinData = skinData;
        this.clickCallback = clickCallback;
    }

    /**
     * 根据皮肤类别，查找对应类型的皮肤配置数据、玩家库存状态、各个类别的皮肤状态 ——> 初始化列表
     * @param skinType 
     */
    public setSkinType(skinType: SkinType) {
        this.skinType = skinType;
        this.initSkinList();
    }

    /**
     *  根据查找出来该类型下对应的：列表内容、玩家库存状态、各个类别的皮肤状态 ——> 初始化列表
     */
    private initSkinList() {
        this.clearSkinItems();   // 实例新的list之前，先清理旧的list显示
        // trail和pocket类型现在列表前加一个 不使用任何特效的item，因为他没有默认皮肤，所以可以选择不使用任何特效
        if (this.skinType === SkinType.Trail || this.skinType === SkinType.Pocket ) {   // 先加一个没有特效的item，再遍历列表添加item
            const noEffectItem = instantiate(this.noEffectItem);
            noEffectItem.on(Button.EventType.CLICK, () => {
                this.clickCallback?.(this.skinType, null);
            });   // 给item绑定点击事件，点击时执行回调
            this.node.addChild(noEffectItem);
        }
        // 遍历列表添加item
        const skinConfigs = this.skinData.getSkinConfigs(this.skinType);
        const allPlayerSkinStates = this.skinData.getPlayerSkinStates();
        const typeState = this.skinData.getSkinTypeStates().find(item => item.type === this.skinType);
        for (const config of skinConfigs) {
            const state = allPlayerSkinStates.find(item => item.skinId === config.id);
            const skinItem = this.createSkinItem(this.skinType, config, state, typeState);
            this.node.addChild(skinItem);
        }
    }

    /**
     * 根据皮肤类型、皮肤配置、玩家库存状态、各个类别的皮肤状态 ——> 实例化item
     * @param skinType 
     * @param skinConfig 
     * @param playerSkinState 
     * @param skinTypeState 
     * @returns 
     */
    private createSkinItem(skinType: SkinType, skinConfig: SkinConfig, playerSkinState: PlayerSkinState | undefined, typeState: SkinTypeState) {
        let skinItem: Node;
        switch (skinType) {
            case SkinType.Cue:
                skinItem = instantiate(this.cueItem);
                break;
            case SkinType.Trail:
                skinItem = instantiate(this.trailItem);
                break;
            case SkinType.Pocket:
                skinItem = instantiate(this.pocketItem);
                break;
            case SkinType.Table:
                skinItem = instantiate(this.tableItem);
                break;
        }

        skinItem.getComponent(SkinItemView).setData(skinConfig, playerSkinState, typeState);
        skinItem.on(Button.EventType.CLICK, () => {
            this.clickCallback?.(skinType, skinConfig.id);
        }, this);   // 给item绑定点击事件，点击时执行回调
        return skinItem;
    }

    // 清理之前的item
    private clearSkinItems() {
        for (const child of [...this.node.children]) {
            child.destroy();
        }
    }
}


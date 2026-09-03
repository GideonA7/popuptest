import { _decorator, Button, Component, instantiate, Node, Prefab } from 'cc';
import { PlayerSkinState, SkinConfig, SkinData, SkinType, SkinTypeState } from './SkinData';
import { SkinItemView } from './SkinItemView';
const { ccclass, property } = _decorator;

export type SkinListClickCallback = (skinType: SkinType, skinId: number | null) => void;

@ccclass('SkinListController')
export class SkinListController extends Component {
    @property(Node)
    content: Node;

    @property(Prefab)
    itemPrefab: Prefab;

    @property(Prefab)
    noEffectItem: Prefab;

    private skinType: SkinType;   // 接收皮肤类型，实例化对应的列表
    private skinData: SkinData;
    private clickCallback: SkinListClickCallback | null = null;

    private isInitialized: boolean = false;   // 标记列表是否已创建

    private itemViews: Map<number, SkinItemView> = new Map();   // 存储皮肤id和对应的itemView

    init(skinType: SkinType, skinData: SkinData, clickCallback: SkinListClickCallback) {
        this.skinType = skinType;
        this.skinData = skinData;
        this.clickCallback = clickCallback;
    }

    /**
     * 初次创建list
     * @returns 是否初次创建
     */
    public ensureInitialized(): boolean {
        if (this.isInitialized) return false;
        this.initSkinList();
        this.isInitialized = true;
        return true;
    }

    /**
     * 刷新list状态
     */
    public refreshState() {
        if (!this.isInitialized) return;

        const typeState = this.skinData.getSkinTypeStates().find(item => item.type === this.skinType);
        const playerSkinStates = this.skinData.getPlayerSkinStates();

        for (const [skinId, itemView] of this.itemViews) {
            const playerSkinState = playerSkinStates.find(item => item.skinId === skinId);
            itemView.refreshState(playerSkinState, typeState);
        }
    }

    private initSkinList() {
        if (this.skinType === SkinType.Trail || this.skinType === SkinType.Pocket) {   // 先加一个没有特效的item，再遍历列表添加item
            const noEffectItem = instantiate(this.noEffectItem);
            noEffectItem.on(Button.EventType.CLICK, () => {
                this.clickCallback?.(this.skinType, null);
            });
            this.content.addChild(noEffectItem);
        }

        // 遍历列表添加item
        const skinConfigs = this.skinData.getSkinConfigs(this.skinType);
        const allPlayerSkinStates = this.skinData.getPlayerSkinStates();
        const typeState = this.skinData.getSkinTypeStates().find(item => item.type === this.skinType);
        for (const config of skinConfigs) {
            const state = allPlayerSkinStates.find(item => item.skinId === config.id);
            const skinItem = this.createSkinItem(config, state, typeState);
            const itemView = skinItem.getComponent(SkinItemView);
            this.itemViews.set(config.id, itemView);
            this.content.addChild(skinItem);
        }

    }

    /**
     * 根据皮肤类型、皮肤配置、玩家库存状态、各个类别的皮肤状态 ——> 实例化item
     */
    private createSkinItem(skinConfig: SkinConfig, playerSkinState: PlayerSkinState | undefined, typeState: SkinTypeState) {
        const skinItem = instantiate(this.itemPrefab);
        skinItem.getComponent(SkinItemView).setData(skinConfig, playerSkinState, typeState);
        skinItem.on(Button.EventType.CLICK, () => {
            this.clickCallback?.(this.skinType, skinConfig.id);
        }, this);   // 给item绑定点击事件，点击时执行回调
        return skinItem;
    }

}


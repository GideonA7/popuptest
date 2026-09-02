import { _decorator, Component, Node, Toggle } from 'cc';
import { SkinListController } from './SkinListController';
import { SkinData, SkinType, SkinTypeState } from './SkinData';
import { SkinDetailPopupView } from './SkinDetailPopupView';
const { ccclass, property } = _decorator;

@ccclass('SkinPopupController')
export class SkinPopupController extends Component {
    @property(Toggle)
    cueToggle: Toggle;

    @property(Toggle)
    trailToggle: Toggle;

    @property(Toggle)
    pocketToggle: Toggle;

    @property(Toggle)
    tableToggle: Toggle;

    @property(SkinListController)
    skinListController: SkinListController;

    @property(SkinDetailPopupView)
    skinDetailPopup: SkinDetailPopupView;

    private skinData: SkinData;
    private skinTypeStates: SkinTypeState[] = [];

    protected onLoad(): void {   // 数据初始化加载在onLoad里就行，不用在onEnable中，这样数据只用创建一次
        this.skinData = new SkinData();
        this.skinListController.init(this.skinData, (skinType: SkinType, skinId: number | null) => {this.onSkinListClick(skinType, skinId)});   // 传入皮肤数据、和点击皮肤item时需要的回调方法
        this.skinTypeStates = this.skinData.getSkinTypeStates();
    }

    protected onEnable(): void {
        this.refreshNewTips();   // 打开弹窗的时候刷新角标
        if (this.cueToggle.isChecked) {
            this.onCueToggleSelected();
        }
        this.cueToggle.node.on(Toggle.EventType.TOGGLE, this.onCueToggleSelected, this);   // 这里不用CLICK监听是因为，虽然可以切换，但是它再次点击已经选中的tab也会重新清空和生成列表
        this.trailToggle.node.on(Toggle.EventType.TOGGLE, this.onTrailToggleSelected, this);
        this.pocketToggle.node.on(Toggle.EventType.TOGGLE, this.onPocketToggleSelected, this);
        this.tableToggle.node.on(Toggle.EventType.TOGGLE, this.onTableToggleSelected, this);
    }
    
    protected onDisable(): void {
        this.cueToggle.node.off(Toggle.EventType.TOGGLE, this.onCueToggleSelected, this);
        this.trailToggle.node.off(Toggle.EventType.TOGGLE, this.onTrailToggleSelected, this);
        this.pocketToggle.node.off(Toggle.EventType.TOGGLE, this.onPocketToggleSelected, this);
        this.tableToggle.node.off(Toggle.EventType.TOGGLE, this.onTableToggleSelected, this);
    }

    private onSkinListClick(skinType: SkinType, skinId: number | null): void {
        if (skinId === null) {
            this.skinData.setInUseSkinId(skinType, null);   // 选择禁用皮肤特效
            this.skinListController.setSkinType(skinType);   // 刷新列表
            return;
        }
        const config = this.skinData.getSkinConfigs(skinType).find(item => item.id === skinId);
        const state = this.skinData.getPlayerSkinStates().find(item => item.skinId === skinId);
        const typeState = this.skinData.getSkinTypeStates().find(item => item.type === skinType);

        const isOwner = config.isDefault === true || state?.count > 0;   // 皮肤是默认的 或 皮肤数量 > 0 说明拥有该皮肤
        const isInUse = typeState.inUseSkinId === skinId;   // 根据id找到该item皮肤是否是正在使用中的皮肤

        if (state?.isNew) {
            state.isNew = false;
            if (isInUse) {   // 如果是使用中的item，则点击直接刷新显示并return，如果不是使用中的，则点击后和下方 拥有皮肤且皮肤没有在使用 里一起刷新显示
                this.skinListController.setSkinType(skinType);   // 刷新列表
                this.skinDetailPopup.show(config);   // 因为是使用中状态下的皮肤，所以点击直接打开弹窗 并 消除new状态
                return;
            }
        }

        if (isOwner && !isInUse) {   // 拥有皮肤 且 皮肤没有在使用
            this.skinData.setInUseSkinId(skinType, skinId);   // 切换皮肤的使用状态
            this.skinListController.setSkinType(skinType);   // 刷新列表
            return;
        }

        // 其余状态都是直接打开弹窗，在这下面写
        console.log('打开弹窗', skinType, "皮肤id：", skinId); 
        this.skinDetailPopup.show(config);

    }

    private onCueToggleSelected(): void {
        this.switchSkinType(SkinType.Cue, this.cueToggle);
    }

    private onTrailToggleSelected(): void {
        this.switchSkinType(SkinType.Trail, this.trailToggle);
    }

    private onPocketToggleSelected(): void {
        this.switchSkinType(SkinType.Pocket, this.pocketToggle);
    }

    private onTableToggleSelected(): void {
        this.switchSkinType(SkinType.Table, this.tableToggle);
    }

    private isNewTip(skinType: SkinType): boolean {
        const typeState = this.skinTypeStates.find(item => item.type === skinType);
        return typeState.hasNewTip;
    }

    /**
     * 根据皮肤类型，切换tab，刷新列表和角标
     * @param skinType 
     * @param toggle 
     * @returns 
     */
    private switchSkinType(skinType: SkinType, toggle: Toggle) {
        if (!toggle.isChecked) return;   // 使用TOGGLE监听，会触发两次，选中->未选中 和 未选中->选中 都会触发一次，所以必须判断一下是否是选择状态再出发后续的加载
        this.skinTypeStates.find(item => item.type === skinType).hasNewTip = false;
        this.skinListController.setSkinType(skinType);   // 刷新列表
        this.refreshNewTips();   // 切换tab，刷新角标 
    }

    /**
     * 刷新4个tab标签右上角的新角标提示
     */
    private refreshNewTips() {
        this.cueToggle.node.getChildByName('NewTip').active = this.isNewTip(SkinType.Cue);
        this.trailToggle.node.getChildByName('NewTip').active = this.isNewTip(SkinType.Trail);
        this.pocketToggle.node.getChildByName('NewTip').active = this.isNewTip(SkinType.Pocket);
        this.tableToggle.node.getChildByName('NewTip').active = this.isNewTip(SkinType.Table);
    }
}


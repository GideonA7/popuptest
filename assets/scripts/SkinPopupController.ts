import { _decorator, Component, Toggle, Tween, UITransform, Vec3, Node, tween } from 'cc';
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
    cueListController: SkinListController;

    @property(SkinListController)
    trailListController: SkinListController;

    @property(SkinListController)
    pocketListController: SkinListController;

    @property(SkinListController)
    tableListController: SkinListController;

    @property(SkinDetailPopupView)
    skinDetailPopup: SkinDetailPopupView;

    @property(Node)
    selectNode: Node;

    private skinData: SkinData;
    private skinTypeStates: SkinTypeState[] = [];
    private listControllerMap = new Map<SkinType, SkinListController>();   // 对应表，根据skintype获取对应的listController
    private currentSkinType: SkinType = SkinType.Cue;

    private readonly skinTypeOrder: SkinType[] = [SkinType.Cue, SkinType.Trail, SkinType.Pocket, SkinType.Table];   // 用于判断谁是谁的相邻列表

    protected onLoad(): void {   // 数据初始化加载在onLoad里就行，不用在onEnable中，这样数据只用创建一次
        this.skinData = new SkinData();
        this.skinTypeStates = this.skinData.getSkinTypeStates();
        this.listControllerMap.set(SkinType.Cue, this.cueListController);
        this.listControllerMap.set(SkinType.Trail, this.trailListController);
        this.listControllerMap.set(SkinType.Pocket, this.pocketListController);
        this.listControllerMap.set(SkinType.Table, this.tableListController);
        const clickCallback = (skinType: SkinType, skinId: number | null) => {this.onSkinListClick(skinType, skinId)};
        this.listControllerMap.forEach((listController, skinType) => {
            listController.init(skinType, this.skinData, clickCallback);
        });
    }

    protected onEnable(): void {
        this.cueToggle.node.on(Toggle.EventType.TOGGLE, this.onCueToggleSelected, this);   // 这里不用CLICK监听是因为，虽然可以切换，但是它再次点击已经选中的tab也会重新清空和生成列表
        this.trailToggle.node.on(Toggle.EventType.TOGGLE, this.onTrailToggleSelected, this);
        this.pocketToggle.node.on(Toggle.EventType.TOGGLE, this.onPocketToggleSelected, this);
        this.tableToggle.node.on(Toggle.EventType.TOGGLE, this.onTableToggleSelected, this);

        this.showCurrentSelectedList();

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
            this.getListController(skinType).refreshState();
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
                this.getListController(skinType).refreshState();
                this.skinDetailPopup.show(config);   // 因为是使用中状态下的皮肤，所以点击直接打开弹窗 并 消除new状态
                return;
            }
        }

        if (isOwner && !isInUse) {   // 拥有皮肤 且 皮肤没有在使用
            this.skinData.setInUseSkinId(skinType, skinId);   // 切换皮肤的使用状态
            this.getListController(skinType).refreshState();
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

    private getListController(skinType: SkinType): SkinListController {
        return this.listControllerMap.get(skinType);
    }

    /**
     * 根据皮肤类型，切换tab，刷新列表和角标
     */
    private switchSkinType(skinType: SkinType, toggle: Toggle, animated: boolean = true) {
        if (!toggle.isChecked) return;   // 使用TOGGLE监听，会触发两次，选中->未选中 和 未选中->选中 都会触发一次，所以必须判断一下是否是选择状态再出发后续的加载
        this.currentSkinType = skinType;
        this.skinTypeStates.find(item => item.type === skinType).hasNewTip = false;
        this.showList(skinType);
        this.refreshNewTips();   // 切换tab，刷新角标 
        if (animated) {
            this.moveSelect(toggle, true);
        } else {
            this.scheduleOnce(() => {
                this.moveSelect(toggle, false);
            }, 0);   // 首次打开：下一帧直接校准位置
        }
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

    /**
     * 显示当前列表
     */
    private showList(skinType: SkinType) {
        const targetController = this.listControllerMap.get(skinType);

        if (!targetController) return;

        for (const controller of this.listControllerMap.values()) {
            controller.node.active = controller === targetController;
        }

        const isFirstInit = targetController.ensureInitialized();
        if (!isFirstInit) {
            targetController.refreshState();   // 缓存列表再次显示时，刷新状态；首次创建时 setData 已经设置状态
        }
        
        // 当前列表处理完成后，下一帧预加载相邻列表
        this.scheduleOnce(() => {
            this.preloadNextList(skinType);
        }, 0);
    }

    /**
     * 预加载左右两边相邻列表
     */
    private preloadNextList(skinType: SkinType) {
        const currentIndex = this.skinTypeOrder.indexOf(skinType);

        // 预加载左边相邻的列表
        if (currentIndex > 0) {
            const leftSkinType = this.skinTypeOrder[currentIndex - 1];
            const leftController = this.listControllerMap.get(leftSkinType);
            if (leftController) {
                leftController.ensureInitialized();
            }
        }

        // 预加载右边相邻的列表
        if (currentIndex < this.skinTypeOrder.length - 1) {
            const rightSkinType = this.skinTypeOrder[currentIndex + 1];
            const rightController = this.listControllerMap.get(rightSkinType);
            if (rightController) {
                rightController.ensureInitialized();
            }
        }
    }

    private moveSelect(toggle: Toggle, animated: boolean) {
        const targetPos = this.getSelectPos(toggle);
        Tween.stopAllByTarget(this.selectNode);
        if (!animated) {
            this.selectNode.setPosition(targetPos);
            return;
        }
        tween(this.selectNode).to(0.18, { position: targetPos }, { easing: 'smooth' }).start();
    }

    private getSelectPos(toggle: Toggle): Vec3 {
        const selectParentTransform = this.selectNode.parent.getComponent(UITransform);
        const targetLocalPos = selectParentTransform.convertToNodeSpaceAR(toggle.node.worldPosition);
        return new Vec3(targetLocalPos.x + 2, targetLocalPos.y - 3, 0);
    }

    private showCurrentSelectedList(): void {
        if (this.cueToggle.isChecked) {
            this.switchSkinType(SkinType.Cue, this.cueToggle, false);
        } else if (this.trailToggle.isChecked) {
            this.switchSkinType(SkinType.Trail, this.trailToggle, false);
        } else if (this.pocketToggle.isChecked) {
            this.switchSkinType(SkinType.Pocket, this.pocketToggle, false);
        } else if (this.tableToggle.isChecked) {
            this.switchSkinType(SkinType.Table, this.tableToggle, false);
        }
    }
}


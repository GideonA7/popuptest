import { _decorator, Component, Label, Node, resources, Sprite, SpriteFrame } from 'cc';
import { SkinConfig, SkinRarity, SkinType } from './SkinData';
const { ccclass, property } = _decorator;

@ccclass('SkinDetailPopupView')
export class SkinDetailPopupView extends Component {
    @property(Label)
    titleLabel: Label;

    @property(Node)
    trailView: Node;

    @property(Node)
    pocketView: Node;

    @property(Node)
    tableView: Node;

    @property(Node)
    cueView: Node;

    @property(Node)
    probabilityPopup: Node;

    private trailSprite: Sprite;
    private pocketSprite: Sprite;
    private tableSprite: Sprite;
    private cueSprite: Sprite;

    protected onLoad(): void {
        this.trailSprite = this.trailView.getChildByName('Effect').getComponent(Sprite);
        this.pocketSprite = this.pocketView.getChildByName('Effect').getComponent(Sprite);
        this.tableSprite = this.tableView.getChildByName('Table').getComponent(Sprite);
        this.cueSprite = this.cueView.getChildByName('Cue').getComponent(Sprite);
    }

    /**
     * 显示弹窗细节
     */
    show(config: SkinConfig) {
        this.trailView.active = false;
        this.pocketView.active = false;
        this.tableView.active = false;
        this.cueView.active = false;
        // 显示弹窗
        this.node.active = true;
        // 设置皮肤标题
        const titleType = config.type === SkinType.Trail ? '拖尾' : config.type === SkinType.Pocket ? '落袋' : config.type === SkinType.Table ? '球桌' : '球杆';
        const rarity = config.rarity === SkinRarity.Common ? '普通' : config.rarity === SkinRarity.Rare ? '稀有' : '史诗';
        this.titleLabel.string = `${titleType} (${rarity})`;

        // 显示皮肤预览图
        const previewPath = config.previewPath;
        const type = config.type;
        if (type === SkinType.Trail) {
            this.loadSprite(previewPath, this.trailSprite);
            this.trailView.active = true;
        } else if (type === SkinType.Pocket) {
            this.loadSprite(previewPath, this.pocketSprite);
            this.pocketView.active = true;
        } else if (type === SkinType.Table) {
            this.loadSprite(previewPath, this.tableSprite);
            this.tableView.active = true;
        } else if (type === SkinType.Cue) {
            this.loadSprite(previewPath, this.cueSprite);
            this.cueView.active = true;
        }
    }

    hide() {
        this.node.active = false;
    }

    /**
     * 加载图片到sprite组件
     * @param path 图片路径
     * @param sprite 要修改的sprite组件
     */
    private loadSprite(path: string, sprite: Sprite) {
        resources.load(path, SpriteFrame, (err, spriteFrame) => {
            if (err) {
                console.error(err);
            } else {
                sprite.spriteFrame = spriteFrame;
            }
        });
    }

    private onProbabilityButtonClick(): void {
        this.probabilityPopup.active = true;
    }

    private closeProbabilityPopup(): void {
        this.probabilityPopup.active = false;
    }
}


import { _decorator, Component, Label, Node, resources, Sprite, SpriteFrame, UIOpacity } from 'cc';
import { PlayerSkinState, SkinConfig, SkinTypeState } from './SkinData';
const { ccclass, property } = _decorator;

/**
 * 负责显示一张皮肤卡片
 */
@ccclass('SkinItemView')
export class SkinItemView extends Component {
    @property(Sprite)
    previewSprite: Sprite;   // 绑定皮肤预览图的Sprite组件

    @property(Node)
    usingBorder: Node;   // 绑定正在使用的边框

    @property(Node)
    newBorder: Node;   // 绑定新皮肤的边框

    @property(Node)
    countNode: Node;   // 绑定皮肤数量的节点


    public setData(config: SkinConfig, state: PlayerSkinState | undefined, typeState: SkinTypeState) {
        resources.load(config.previewPath, SpriteFrame, (err, spriteFrame) => {
            if (err) {
                console.error(err);
            } else {
                this.previewSprite.spriteFrame = spriteFrame;
            }
        });

        this.usingBorder.active = typeState.inUseSkinId === config.id;   // 设置使用中的框

        if (config.isDefault) {   // 如果皮肤是默认皮肤，则显示数量角标为无限个数
            this.countNode.active = true;
            this.countNode.getChildByName('Icon').active = false;
            this.countNode.getChildByName('InfinityCon').active = true;
            return;
        }

        if (!state) {   // 如果玩家对应的皮肤状态是undefined，说明这个皮肤没有玩家状态，设置透明度一半，然后返回
            this.node.getComponent(UIOpacity).opacity = 128;
            return;
        };

        if (state.count > 0) {   // 如果玩家对应的皮肤状态的count大于0，则显示数量角标
            this.countNode.getComponentInChildren(Label).string = `${state.count}`;

            if (state.count > 99) {   // 如果玩家对应的皮肤状态的count大于99，则显示数量角标为99+
                this.countNode.getChildByName('Icon').active = false;
                this.countNode.getChildByName('Icon2').active = true;
            } else {
                this.countNode.getChildByName('Icon').active = true;
                this.countNode.getChildByName('Icon2').active = false;
            }

            this.countNode.active = true;
        } else {   // 如果玩家对应的皮肤状态的count等于0，则设置透明度一半，然后返回
            this.node.getComponent(UIOpacity).opacity = 128;
            this.countNode.active = false;
        }

        this.newBorder.active = state.isNew;   // 设置新皮肤的边框

    }
}


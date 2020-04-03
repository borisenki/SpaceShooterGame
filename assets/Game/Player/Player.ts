import { GameEvents } from "../GameEvents";

const { ccclass, property } = cc._decorator;

@ccclass
export default class Player extends cc.Component {

    @property(cc.Node)
    canvas: cc.Node = null;

    @property(cc.Node)
    bulletSpawnPoint: cc.Node = null;

    @property(cc.Animation)
    shootAnimation: cc.Animation = null;

    mousePosition: cc.Vec2;
    updateRotation: boolean;
    fire: boolean;
    soundComponent: cc.AudioSource;

    start() {
        var self = this;
        self.mousePosition = new cc.Vec2();
        self.updateRotation = false;
        self.fire = false;
        self.canvas.on(cc.Node.EventType.MOUSE_MOVE, function (event) {
            self.updateRotation = true;
            self.node.parent.convertToNodeSpaceAR(event.getLocation(), self.mousePosition);
        });
        self.canvas.on(cc.Node.EventType.MOUSE_UP, function (event) {
            self.fire = true;
        });
        this.shootAnimation.on(cc.Animation.EventType.FINISHED, this.onShootAnimationFinished.bind(this));
        this.soundComponent = this.node.getComponent<cc.AudioSource>(cc.AudioSource);
    };

    onShootAnimationFinished() {
        this.shootAnimation.node.active = false;
    }

    playShootAnimation() {
        this.shootAnimation.node.active = true;
        this.shootAnimation.play();
    }

    update(dt) {
        if (this.updateRotation) {
            this.updateRotation = false;
            this.node.angle = Math.atan2(this.mousePosition.y - this.node.y, this.mousePosition.x - this.node.x) * (180 / Math.PI) - 90;
        }
        if (this.fire) {
            this.fire = false;
            this.node.emit(GameEvents.PLAYER_FIRE);
            this.playShootAnimation();
            this.soundComponent.play();
        }
    };
}

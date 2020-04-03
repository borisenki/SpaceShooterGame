const { ccclass, property } = cc._decorator;

@ccclass
export default class Bullet extends cc.Component {

    @property(cc.Vec2)
    direction: cc.Vec2 = null;

    @property
    speed: number = 1000;

    onCollisionEnter(other) {
        if (this.node.parent) {
            this.node.parent.removeChild(this.node);
        }
    }

    update(dt) {
        this.node.y += this.speed * dt * this.direction.y;
        this.node.x += this.speed * dt * this.direction.x;
    }
}

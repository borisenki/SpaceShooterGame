const { ccclass, property } = cc._decorator;

@ccclass
export default class ExplosionComponent extends cc.Component {

    animationComponent: cc.Animation = null;
    soundComponent: cc.AudioSource;

    onLoad() {
        this.animationComponent = this.node.getComponent<cc.Animation>(cc.Animation);
        this.animationComponent.on(cc.Animation.EventType.FINISHED, this.onAnimationFinished.bind(this));
        this.soundComponent = this.node.getComponent<cc.AudioSource>(cc.AudioSource);
        this.soundComponent.play();
    }

    onAnimationFinished() {
        this.node.parent.removeChild(this.node);
    }
}

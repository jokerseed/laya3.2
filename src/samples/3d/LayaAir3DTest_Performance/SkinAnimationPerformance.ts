import { Laya } from "Laya";
import { Animator } from "laya/d3/component/Animator/Animator";
import { Camera } from "laya/d3/core/Camera";
import { Scene3D } from "laya/d3/core/scene/Scene3D";
import { Sprite3D } from "laya/d3/core/Sprite3D";
import { Stage } from "laya/display/Stage";
import { Color } from "laya/maths/Color";
import { Matrix4x4 } from "laya/maths/Matrix4x4";
import { Vector3 } from "laya/maths/Vector3";
import { Button } from "laya/ui/Button";
import { Handler } from "laya/utils/Handler";
import { Stat } from "laya/utils/Stat";
import { Laya3D } from "Laya3D";
import { CameraMoveScript } from "../common/CameraMoveScript";
import { DirectionLightCom } from "laya/d3/core/light/DirectionLightCom";

/**
 * ...
 * @author
 */
export class SkinAnimationPerformance {
	private changeActionButton: Button;
	private zombieAnimator: Animator;
	private curStateIndex: number = 0;
	private clipName: any[] = ["idle", "fallingback", "idle", "walk", "Take 001"];

	constructor() {
		//Config3D.debugFrustumCulling = true;
		Laya.init(0, 0).then(() => {
			Laya.stage.scaleMode = Stage.SCALE_FULL;
			Laya.stage.screenMode = Stage.SCREEN_NONE;
			Stat.show();

			var scene: Scene3D = (<Scene3D>Laya.stage.addChild(new Scene3D()));

			var camera: Camera = (<Camera>(scene.addChild(new Camera(0, 0.1, 1000))));
			camera.transform.translate(new Vector3(0, 1.5, 4));
			camera.transform.rotate(new Vector3(-15, 0, 0), true, false);
			camera.addComponent(CameraMoveScript);

			let directlightSprite = new Sprite3D();
			let dircom = directlightSprite.addComponent(DirectionLightCom);
			scene.addChild(directlightSprite);
			var mat: Matrix4x4 = directlightSprite.transform.worldMatrix;
			mat.setForward(new Vector3(-1.0, -1.0, -1.0));
			directlightSprite.transform.worldMatrix = mat;
			dircom.color = new Color(1, 1, 1, 1);

			Sprite3D.load("res/threeDimen/skinModel/Zombie/Plane.lh", Handler.create(null, function (plane: Sprite3D): void {
				scene.addChild(plane);
			}));

			//Sprite3D.load("test/Conventional/monkey.lh", Handler.create(null, function(zombie:Sprite3D):void {
			//Sprite3D.load("test/monkey.lh", Handler.create(null, function(zombie:Sprite3D):void {
			Sprite3D.load("res/threeDimen/skinModel/Zombie/Zombie.lh", Handler.create(null, function (zombie: Sprite3D): void {
				for (var i: number = 0; i < 200; i++) {
					zombie = <Sprite3D>zombie.clone();
					zombie.transform.localPosition = new Vector3(i * 0.04 - 4.0, 0, 0);
					scene.addChild(zombie);
					this.zombieAnimator = (<Animator>((<Sprite3D>zombie.getChildAt(0))).getComponent(Animator));//获取Animator动画组件
				}
			}));
		});
	}

}


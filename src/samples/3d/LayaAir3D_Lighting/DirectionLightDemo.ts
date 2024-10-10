import { Laya } from "Laya";
import { Camera } from "laya/d3/core/Camera";
import { Scene3D } from "laya/d3/core/scene/Scene3D";
import { Sprite3D } from "laya/d3/core/Sprite3D";
import { Stage } from "laya/display/Stage";
import { Matrix4x4 } from "laya/maths/Matrix4x4";
import { Quaternion } from "laya/maths/Quaternion";
import { Vector3 } from "laya/maths/Vector3";
import { Handler } from "laya/utils/Handler";
import { Stat } from "laya/utils/Stat";
import { CameraMoveScript } from "../common/CameraMoveScript";
import { DirectionLightCom } from "laya/d3/core/light/DirectionLightCom";


/**
 * ...
 * @author ...
 */
export class DirectionLightDemo {

	private _quaternion: Quaternion = new Quaternion();
	private _direction: Vector3 = new Vector3();

	constructor() {
		//初始化引擎
		Laya.init(0, 0).then(() => {
			Laya.stage.scaleMode = Stage.SCALE_FULL;
			Laya.stage.screenMode = Stage.SCREEN_NONE;
			//显示性能面板
			Stat.show();
			//添加场景
			var scene: Scene3D = (<Scene3D>Laya.stage.addChild(new Scene3D()));

			//添加相机
			var camera: Camera = (<Camera>(scene.addChild(new Camera(0, 0.1, 1000))));
			camera.transform.translate(new Vector3(0, 0.7, 1.3));
			camera.transform.rotate(new Vector3(-15, 0, 0), true, false);
			camera.addComponent(CameraMoveScript);

			//创建方向光
			let directlightSprite = new Sprite3D();
			let dircom = directlightSprite.addComponent(DirectionLightCom);
			scene.addChild(directlightSprite);
			//方向光的颜色
			dircom.color.setValue(1, 1, 1, 1);
			//设置平行光的方向
			var mat: Matrix4x4 = directlightSprite.transform.worldMatrix;
			mat.setForward(new Vector3(-1.0, -1.0, -1.0));
			directlightSprite.transform.worldMatrix = mat;

			//加载地面
			Sprite3D.load("res/threeDimen/staticModel/grid/plane.lh", Handler.create(this, function (sprite: Sprite3D): void {
				var grid: Sprite3D = (<Sprite3D>scene.addChild(sprite));
				//加载猴子精灵
				Sprite3D.load("res/threeDimen/skinModel/LayaMonkey/LayaMonkey.lh", Handler.create(this, function (layaMonkey: Sprite3D): void {
					var layaMonkey: Sprite3D = (<Sprite3D>scene.addChild(layaMonkey));

					//设置时钟定时执行
					Laya.timer.frameLoop(1, this, function (): void {
						//从欧拉角生成四元数（顺序为Yaw、Pitch、Roll）
						Quaternion.createFromYawPitchRoll(0.025, 0, 0, this._quaternion);
						//根据四元数旋转三维向量
						directlightSprite.transform.worldMatrix.getForward(this._direction);
						Vector3.transformQuat(this._direction, this._quaternion, this._direction);
						var mat: Matrix4x4 = directlightSprite.transform.worldMatrix;
						mat.setForward(this._direction);
						directlightSprite.transform.worldMatrix = mat;
					});
				}));

			}));

		});

	}
}


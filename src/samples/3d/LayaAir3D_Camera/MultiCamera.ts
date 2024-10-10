import { Laya } from "Laya";
import { Camera, CameraClearFlags } from "laya/d3/core/Camera";
import { Material } from "laya/resource/Material";
import { SkyBoxMaterial } from "laya/d3/core/material/SkyBoxMaterial";
import { Scene3D } from "laya/d3/core/scene/Scene3D";
import { Sprite3D } from "laya/d3/core/Sprite3D";
import { SkyBox } from "laya/d3/resource/models/SkyBox";
import { SkyRenderer } from "laya/d3/resource/models/SkyRenderer";
import { Stage } from "laya/display/Stage";
import { Color } from "laya/maths/Color";
import { Vector3 } from "laya/maths/Vector3";
import { Handler } from "laya/utils/Handler";
import { Stat } from "laya/utils/Stat";
import { CameraMoveScript } from "../common/CameraMoveScript";
import { DirectionLightCom } from "laya/d3/core/light/DirectionLightCom";
import { Viewport } from "laya/maths/Viewport";

/**
 * ...
 * @author ...
 */
export class MultiCamera {
	private _translate: Vector3 = new Vector3(0, 0, 1.5);

	constructor() {
		//初始化引擎
		Laya.init(0, 0).then(() => {
			Laya.stage.scaleMode = Stage.SCALE_FULL;
			Laya.stage.screenMode = Stage.SCREEN_NONE;
			//显示性能面板
			Stat.show();
			//创建场景
			var scene: Scene3D = (<Scene3D>Laya.stage.addChild(new Scene3D()));
			//创建相机
			var camera1: Camera = (<Camera>scene.addChild(new Camera(0, 0.1, 100)));
			//设置相机清除颜色
			camera1.clearColor = new Color(0.3, 0.3, 0.3, 1.0);
			camera1.transform.translate(this._translate);
			//设置裁剪空间的视口
			camera1.normalizedViewport = new Viewport(0, 0, 0.5, 1.0);

			//创建相机
			var camera2: Camera = (<Camera>scene.addChild(new Camera(0, 0.1, 100)));
			camera2.clearColor = new Color(0.0, 0.0, 1.0, 1.0);
			this._translate.setValue(0, 0, 1.5);
			camera2.transform.translate(this._translate);
			camera2.normalizedViewport = new Viewport(0.5, 0.0, 0.5, 0.5);
			//相机添加视角控制组件(脚本)
			camera2.addComponent(CameraMoveScript);
			//设置相机清除标志，使用天空
			camera2.clearFlag = CameraClearFlags.Sky;
			Material.load("res/threeDimen/skyBox/skyBox2/skyBox2.lmat", Handler.create(this, function (mat: SkyBoxMaterial): void {
				var skyRenderer: SkyRenderer = camera2.scene.skyRenderer;
				skyRenderer.mesh = SkyBox.instance;
				skyRenderer.material = mat;
			}));

			//添加平行光

			let directlightSprite = new Sprite3D();
			let dircom = directlightSprite.addComponent(DirectionLightCom);
			scene.addChild(directlightSprite);
			//加载资源
			Sprite3D.load("res/threeDimen/skinModel/LayaMonkey/LayaMonkey.lh", Handler.create(this, function (sp: Sprite3D): void {
				var layaMonkey: Sprite3D = (<Sprite3D>scene.addChild(sp));
			}))
		});

	}

}



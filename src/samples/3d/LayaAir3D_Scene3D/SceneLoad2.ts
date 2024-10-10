import { Laya } from "Laya";
import { Camera, CameraClearFlags } from "laya/d3/core/Camera";
import { Material } from "laya/resource/Material";
import { MeshSprite3D } from "laya/d3/core/MeshSprite3D";
import { Scene3D } from "laya/d3/core/scene/Scene3D";
import { SkyBox } from "laya/d3/resource/models/SkyBox";
import { SkyRenderer } from "laya/d3/resource/models/SkyRenderer";
import { Stage } from "laya/display/Stage";
import { Color } from "laya/maths/Color";
import { Matrix4x4 } from "laya/maths/Matrix4x4";
import { Vector3 } from "laya/maths/Vector3";
import { Handler } from "laya/utils/Handler";
import { Stat } from "laya/utils/Stat";
import { Laya3D } from "Laya3D";
import { CameraMoveScript } from "../common/CameraMoveScript";
import { Sprite3D } from "laya/d3/core/Sprite3D";
import { DirectionLightCom } from "laya/d3/core/light/DirectionLightCom";

export class SceneLoad2 {
	constructor() {
		//初始化引擎
		Laya.init(0, 0).then(() => {
			Laya.stage.scaleMode = Stage.SCALE_FULL;
			Laya.stage.screenMode = Stage.SCREEN_NONE;
			//显示性能面板
			Stat.show();

			Scene3D.load("res/threeDimen/scene/TerrainScene/XunLongShi.ls", Handler.create(this, function (scene: Scene3D): void {
				Laya.stage.addChild(scene);
				//开启雾化效果
				scene.enableFog = true;
				//设置雾化的颜色
				scene.fogColor = new Color(0, 0, 0.6);
				//设置雾化的起始位置，相对于相机的距离
				scene.fogStart = 10;
				//设置雾化最浓处的距离。
				scene.fogRange = 40;
				//设置场景环境光
				scene.ambientColor = new Color(0.6, 0, 0);

				//添加相机
				var camera: Camera = new Camera();
				scene.addChild(camera);
				//调整相机的位置
				camera.transform.translate(new Vector3(10, 15, -25));
				camera.transform.rotate(new Vector3(-20, 170, 0), false, false);
				//设置相机横纵比
				camera.aspectRatio = 0;
				//设置相机近距裁剪
				camera.nearPlane = 0.1;
				//设置相机远距裁剪
				camera.farPlane = 1000;
				//相机设置清楚标记
				camera.clearFlag = CameraClearFlags.Sky;
				//设置摄像机视野范围（角度）
				camera.fieldOfView = 60;
				//设置背景颜色
				//camera.clearColor = new Vector4(0,0,0.6,1);    
				//加入摄像机移动控制脚本
				camera.addComponent(CameraMoveScript);

				//加载相机天空盒材质
				Material.load("res/threeDimen/skyBox/skyBox2/skyBox2.lmat", Handler.create(this, function (mat: Material): void {
					var skyRenderer: SkyRenderer = camera.scene.skyRenderer;
					skyRenderer.mesh = SkyBox.instance;
					skyRenderer.material = mat;
				}));

				//创建方向光
				let directlightSprite = new Sprite3D();
				let dircom = directlightSprite.addComponent(DirectionLightCom);
				scene.addChild(directlightSprite);

				//移动灯光位置
				directlightSprite.transform.translate(new Vector3(0, 2, 5));
				//调整灯光方向
				var mat: Matrix4x4 = directlightSprite.transform.worldMatrix;
				mat.setForward(new Vector3(0, -5, 1));
				directlightSprite.transform.worldMatrix = mat;
				//设置灯光漫反射颜色
				dircom.color = new Color(0.3, 0.3, 0.3, 1);

				//激活场景中的两个子节点
				((<MeshSprite3D>scene.getChildByName('Scenes').getChildByName('HeightMap'))).active = false;
				((<MeshSprite3D>scene.getChildByName('Scenes').getChildByName('Area'))).active = false;
			}));
		});
	}
}


import { Laya } from "Laya";
import { Camera } from "laya/d3/core/Camera";
import { Material } from "laya/resource/Material";
import { PBRStandardMaterial } from "laya/d3/core/material/PBRStandardMaterial";
import { MeshSprite3D } from "laya/d3/core/MeshSprite3D";
import { Scene3D } from "laya/d3/core/scene/Scene3D";
import { Stage } from "laya/display/Stage";
import { Event } from "laya/events/Event";
import { Loader } from "laya/net/Loader";
import { Button } from "laya/ui/Button";
import { Browser } from "laya/utils/Browser";
import { Handler } from "laya/utils/Handler";
import { Stat } from "laya/utils/Stat";
import Client from "../../Client";
import { CameraMoveScript } from "../common/CameraMoveScript";
import { Scene } from "laya/display/Scene";
import { MeshRenderer } from "laya/d3/core/MeshRenderer";

/**
 * ...
 * @author ...
 */
export class MaterialDemo {
	private sphere: MeshSprite3D;
	private changeActionButton: Button;
	private index: number = 0;

	/**实例类型*/
	private btype: any = "MaterialDemo";
	/**场景内按钮类型*/
	private stype: any = 0;

	constructor() {
		//初始化引擎
		Laya.init(0, 0).then(() => {
			Laya.stage.scaleMode = Stage.SCALE_FULL;
			Laya.stage.screenMode = Stage.SCREEN_NONE;
			//显示性能面板
			Stat.show();
			//预加载所有资源
			var resource: any[] = ["res/threeDimen/scene/ChangeMaterialDemo/Conventional/scene.ls", "res/threeDimen/texture/earth.png"];
			Laya.loader.load(resource, Handler.create(this, this.onPreLoadFinish));
		});
	}

	onPreLoadFinish() {
		Scene.open("res/threeDimen/scene/ChangeMaterialDemo/Conventional/scene.ls", true, null, Handler.create(this, (sce: Scene) => {
			//初始化3D场景
			var scene: Scene3D = sce.scene3D;
			//获取相机
			var camera: Camera = (<Camera>scene.getChildByName("Main Camera"));
			//为相机添加视角控制组件(脚本)
			camera.addComponent(CameraMoveScript);
			//获取球型精灵
			this.sphere = (<MeshSprite3D>scene.getChildByName("Sphere"));
			//加载UI
			this.loadUI();
		}));


	}

	private loadUI(): void {

		Laya.loader.load(["res/threeDimen/ui/button.png"], Handler.create(this, () => {

			this.changeActionButton = (<Button>Laya.stage.addChild(new Button("res/threeDimen/ui/button.png", "切换材质")));
			this.changeActionButton.size(160, 40);
			this.changeActionButton.labelBold = true;
			this.changeActionButton.labelSize = 30;
			this.changeActionButton.sizeGrid = "4,4,4,4";
			this.changeActionButton.scale(Browser.pixelRatio, Browser.pixelRatio);
			this.changeActionButton.pos(Laya.stage.width / 2 - this.changeActionButton.width * Browser.pixelRatio / 2, Laya.stage.height - 100 * Browser.pixelRatio);

			this.changeActionButton.on(Event.CLICK, this, this.stypeFun0);
		}));
	}

	stypeFun0(index: number = 0): void {
		this.index++;
		if (this.index % 2 === 1) {
			Laya.loader.load("res/threeDimen/texture/earth.png").then(() => {
				var pbrStandardMaterial = new PBRStandardMaterial();
				//获取新的纹理
				var pbrTexture = Loader.getTexture2D("res/threeDimen/texture/earth.png");
				//为PBRStandard材质设置漫反射贴图
				pbrStandardMaterial.albedoTexture = pbrTexture;
				//切换至PBRStandard材质
				this.sphere.getComponent(MeshRenderer).material = pbrStandardMaterial;
			});
		} else {
			Material.load("res/threeDimen/scene/ChangeMaterialDemo/Conventional/Assets/Materials/layabox.lmat", Handler.create(this, (mat) => {
				//切换至BlinnPhong材质
				this.sphere.getComponent(MeshRenderer).material = mat;
			}));
		}
		index = this.index;
		Client.instance.send({ type: "next", btype: this.btype, stype: 0, value: index });
	}
}



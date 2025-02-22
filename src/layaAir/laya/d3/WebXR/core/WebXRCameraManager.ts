import { Quaternion } from "../../../maths/Quaternion";
import { Vector3 } from "../../../maths/Vector3";
import { WebXRCamera } from "./WebXRCamera";
import { WebXRRenderTexture } from "./WebXRRenderTexture";
import { WebXRSessionManager } from "./WebXRSessionManager";


/**
 * @en This class is used to manage XRCamera
 * @zh 此类用来管理XRCamera
 */
export class WebXRCameraManager {
    /**
     * reference Quaternin
     */
    private _referenceQuaternion: Quaternion = new Quaternion();
    /**
     * reference Position
     */
    private _referencedPosition: Vector3 = new Vector3();
    /**
     * WebXR Session Manager
     */
    private _webXRSessionManager: WebXRSessionManager;
    /**
     * first Frame Flag
     */
    private _firstFrame = true;//初始帧
    /**
     * WebXR RenderTexture
     */
    private _XRRenderTexture: WebXRRenderTexture = new WebXRRenderTexture();
    /**
     * WebXRCamera Array
     */
    private _rigCameras = new Array<WebXRCamera>();
    /**
     * Reference position
     */
    private _position = new Vector3();

    /**
     * @en The parent object that owns this camera manager.
     * @zh 拥有此摄像机管理器的父对象。
     */
    public owner: any;

    /**
     * @en The position of the camera.
     * @zh 摄像机的位置。
     */
    get position(): Vector3 {
        return this._position;
    }

    set position(newPosition: Vector3) {

        newPosition.cloneTo(this._position);
    }

    /**
     * @en The rotation of the camera.
     * @zh 摄像机的旋转
     */
    get rotationQuaternion(): Quaternion {
        return this._referenceQuaternion;
    }
    set rotationQuaternion(value: Quaternion) {
        value.cloneTo(this._referenceQuaternion);
    }

    /** 
     * @en The array of rig cameras.
     * @zh 绑定在此摄像机管理器上的摄像机数组。
     */
    get rigCameras(): WebXRCamera[] {
        return this._rigCameras;
    }

    /**
     * @en Creates a new instance of the WebXRCameraManager class.
     * @param camera The parent object that owns this camera manager.
     * @param manager WebXR Session Manager.
     * @zh 创建 WebXRCameraManager 类的新实例。
     * @param camera 父对象，拥有此摄像机管理器。
     * @param manager WebXR管理器。
     */
    constructor(camera: any, manager: WebXRSessionManager = null) {
        this.owner = camera;
        this.owner.enableRender = false;
        if (!this.owner.aspectRatio) {
            console.warn("owner is not Camera");
        }
        this._webXRSessionManager = manager;
        this._webXRSessionManager.on(WebXRSessionManager.EVENT_FRAME_LOOP, this, this._updateFromXRSession);
        this._webXRSessionManager.on(WebXRSessionManager.EVENT_FRAME_LOOP, this, this._updateReferenceSpace);
        this._webXRSessionManager.on(WebXRSessionManager.EVENT_MANAGER_END, this, this.destroy);
    }

    /**
     * @en Updates the frame by the WebXR session, adjusting the camera's position, rotation, and viewport based on the XR session's viewer pose.
     * @zh 通过WebXR会话更新帧，根据XR会话的观察者姿势调整相机的位置、旋转和视口。
     */
    _updateFromXRSession() {
        //XRViewerPose
        let pose = this._webXRSessionManager.currentFrame && this._webXRSessionManager.currentFrame.getViewerPose(this._webXRSessionManager.referenceSpace);
        //update pose data
        const pos = pose.transform.position;
        const orientation = pose.transform.orientation;
        this._referenceQuaternion.setValue(orientation.x, orientation.y, orientation.z, orientation.w);
        this._referencedPosition.setValue(pos.x, pos.y, pos.z);
        if (this._firstFrame) {
            this._firstFrame = false;
            this.position.y += this._referencedPosition.y;
            // avoid using the head rotation on the first frame.
            this._referenceQuaternion.setValue(0, 0, 0, 1);
        } else {
            // update position and rotation as reference
            this.rotationQuaternion = this._referenceQuaternion;
            this.position = this._referencedPosition;
        }
        // Update camera rigs
        if (this.rigCameras.length !== pose.views.length) {
            this._updateNumberOfRigCameras(pose.views.length);
        }
        //XRView
        pose.views.forEach((view: any, i: any) => {
            const currentRig = this.rigCameras[i];
            if (view.eye === "right")
                currentRig.name = "right";
            else if (view.eye === "left")
                currentRig.name = "left";
            // Update view/projection matrix
            const pos = view.transform.position;
            const orientation = view.transform.orientation;
            currentRig.transform.position.setValue(pos.x, pos.y, pos.z);
            currentRig.transform.rotation.setValue(orientation.x, orientation.y, orientation.z, orientation.w);
            currentRig.transform.position = currentRig.transform.position;
            currentRig.transform.rotation = currentRig.transform.rotation;
            // Update viewport
            if (this._webXRSessionManager.session.renderState.baseLayer) {
                var viewport = this._webXRSessionManager.session.renderState.baseLayer.getViewport(view);
                var width = this._webXRSessionManager.session.renderState.baseLayer.framebufferWidth;
                var height = this._webXRSessionManager.session.renderState.baseLayer.framebufferHeight;
                this._XRRenderTexture.frameBuffer = this._webXRSessionManager.session.renderState.baseLayer.framebuffer;
                //update FrameBuffer
                currentRig.renderTarget = this._XRRenderTexture;
                //update clientSize
                currentRig.clientWidth = width;
                currentRig.clientHeight = height;
                //update viewPort
                var cameraViewPort = currentRig.viewport;
                cameraViewPort.x = viewport.x;
                cameraViewPort.y = viewport.y;
                cameraViewPort.width = viewport.width;
                cameraViewPort.height = viewport.height;
                currentRig.viewport = cameraViewPort;
                currentRig.projectionMatrix.cloneByArray(view.projectionMatrix);
            }
        });
    }

    /**
     * update number of WebXRCamera
     * @param viewCount 
     */
    private _updateNumberOfRigCameras(viewCount = 1) {
        while (this.rigCameras.length < viewCount) {
            //add camera
            var xrcamera = new WebXRCamera(this.owner.aspectRatio, this.owner.nearPlane, this.owner.farPlane);
            xrcamera.clearFlag = this.owner.clearFlag;
            xrcamera.clearColor = this.owner.clearColor;
            this.owner.addChild(xrcamera);
            this.rigCameras.push(xrcamera);
        }
        while (this.rigCameras.length > viewCount) {
            //remove camera
            let xrcamera = this.rigCameras.pop();
            this.owner.removeChild(xrcamera);
        }
    }

    /**
     * TODO:update of Reference Space
     */
    private _updateReferenceSpace() {
        //TODO:
    }

    /**
     * @en Destroys and cleans up resources used by the WebXRCameraManager.
     * @zh 销毁 WebXRCameraManager 并清理使用的资源。
     */
    destroy() {
        this.owner.enableRender = true;
        this._webXRSessionManager.off(WebXRSessionManager.EVENT_FRAME_LOOP, this, this._updateFromXRSession);
        this._webXRSessionManager.off(WebXRSessionManager.EVENT_FRAME_LOOP, this, this._updateReferenceSpace);
        this._webXRSessionManager.off(WebXRSessionManager.EVENT_MANAGER_END, this, this.destroy);
        this._rigCameras.forEach(element => {
            element.destroy();
        });
        this._rigCameras = null;
        this._XRRenderTexture.destroy();
    }

}
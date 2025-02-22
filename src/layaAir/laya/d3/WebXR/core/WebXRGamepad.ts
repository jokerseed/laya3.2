import { EventDispatcher } from "../../../events/EventDispatcher";
import { Vector2 } from "../../../maths/Vector2";

/**
 * @en The class used to describe the gamepad axis
 * @zh 用于描述设备手柄上的摇杆轴
 */
export class AxiGamepad extends EventDispatcher {
    /**
     * @en Static event name for output axis events.
     * @zh 事件名称，用于输出轴事件。
     */
    static EVENT_OUTPUT: string = "outputAxi_id";
    /**
     * @en The name of the axis device.
     * @zh 轴设备名字。
     */
    public handness: string;
    /**
     * @en The number of axes.
     * @zh 轴数量。
     */
    public axisLength: number;
    /**
     * axis Array
     */
    private axisData: Array<Vector2> = new Array();

    /**
     * 类用于创建轴数据
     * @internal
     * @param handness 轴设备名字
     * @param length 轴数量
     */
    constructor(handness: string, length: number) {
        super();
        this.handness = handness;
        this.axisData.length = length;
        this.axisLength = length;
    }

    /**
     * @internal
     * @param padGameAxi 轴数据
     */
    update(padGameAxi: any) {
        for (let i = 0, j = 0; i < padGameAxi.axes.length; i += 2, ++j) {
            if (!this.axisData[j])
                this.axisData[j] = new Vector2();
            this.axisData[j].setValue(padGameAxi.axes[i], padGameAxi.axes[i + 1]);
            this.outPutStickValue(this.axisData[j], j);
        }
    }

    /**
     * 派发轴事件
     * @internal
     * @param value 
     * @param index 
     */
    outPutStickValue(value: Vector2, index: number) {
        const eventnam = AxiGamepad.EVENT_OUTPUT + index.toString();
        this.event(eventnam, [value]);
    }

    /**
     * @en Cleans up and removes all listeners for this gamepad's axis events.
     * @zh 清理并移除此游戏手柄轴的所有事件监听器。
     */
    destroy() {
        for (let i = 0; i < this.axisLength; i++) {
            let eventname = AxiGamepad.EVENT_OUTPUT + i.toString();
            this.offAll(eventname);
        }
    }

}

/**
 * @en The `ButtonGamepad` class is used to describe gamepad buttons.
 * @zh `ButtonGamepad` 类用来描述游戏手柄上的按钮。
 */
export class ButtonGamepad extends EventDispatcher {
    static EVENT_TOUCH_ENTER: string = "touchEnter";
    static EVENT_TOUCH_STAY: string = "touchStay";
    static EVENT_TOUCH_OUT: string = "touchOut";
    static EVENT_PRESS_ENTER: string = "pressEnter";
    static EVENT_PRESS_STAY: string = "pressStay";
    static EVENT_PRESS_OUT: string = "pressOut";
    static EVENT_PRESS_VALUE: string = "outpressed";

    /**
     * @en The handness of the gamepad.
     * @zh 游戏手柄的名称。
     */
    public handness: string;
    /**
     * @en The index of the button on the gamepad.
     * @zh 游戏手柄上按钮的索引。
     */
    public index: number;

    /**
     * front touch state
     */
    private lastTouch: boolean = false;
    private lastPress: boolean = false;
    private lastPressValue: number = 0;

    /**
     * current touch state
     */
    private touch: boolean = false;
    private press: boolean = false;
    private pressValue: number = 0;


    /**
     * @en Creates a new instance of the `ButtonGamepad` class.
     * @param handness The name of the gamepad.
     * @param index The index of the button on the gamepad.
     * @zh 创建 ButtonGamepad 类的新实例。
     * @param handness 设备名称
     * @param index button索引
     */
    constructor(handness: string, index: number) {
        super();
        this.handness = handness;
        this.index = index;
    }

    /**
     * @internal
     * GamePadButton update
     */
    update(padButton: any) {
        //set Data
        this.lastTouch = this.touch;
        this.lastPress = this.press;
        this.lastPressValue = this.pressValue;
        this.touch = padButton.touched;
        this.press = padButton.pressed;
        this.pressValue = padButton.value;
        if (!this.lastTouch && !this.touch) {
            return;
        }
        if (this.lastTouch != this.touch && this.touch) {
            this.touchEnter();
        } else if (this.lastTouch == this.touch && this.touch) {
            this.touchStay();
        } else if (this.lastTouch != this.touch && !this.touch) {
            this.touchOut();
        }
        if (this.lastPress != this.press && this.press) {
            this.pressEnter();
        } else if (this.lastPress == this.press && this.press) {
            this.pressStay();
        } else if (this.lastPress != this.press && !this.press) {
            this.pressOut();
        }
        if (this.touch) {
            this.outpressed();
        }
    }

    /**
     * @internal
     * event touch enter
     */
    private touchEnter() {
        this.event(ButtonGamepad.EVENT_TOUCH_ENTER);
    }

    /**
     * @internal
     * event touch Stay
     */
    private touchStay() {
        this.event(ButtonGamepad.EVENT_TOUCH_STAY);
    }

    /**
     * @internal
     * event touch Out
     */
    private touchOut() {
        this.event(ButtonGamepad.EVENT_TOUCH_OUT);
    }

    /**
     * @internal
     * event press enter
     */
    private pressEnter() {
        this.event(ButtonGamepad.EVENT_PRESS_ENTER);
    }

    /**
     * @internal
     * event press Stay
     */
    private pressStay() {
        this.event(ButtonGamepad.EVENT_PRESS_STAY);
    }

    /**
     * @internal
     * event press Out
     */
    private pressOut() {
        this.event(ButtonGamepad.EVENT_PRESS_OUT);
    }

    /**
     * @internal
     * event press value
     */
    private outpressed() {
        this.event(ButtonGamepad.EVENT_PRESS_VALUE, [this.pressValue]);
    }

    /**
     * @en Cleans up and removes all listeners for this gamepad's button events.
     * @zh 清理并移除此游戏手柄按钮的所有事件监听器。
     */
    destroy() {
        this.offAll(ButtonGamepad.EVENT_PRESS_ENTER);
        this.offAll(ButtonGamepad.EVENT_PRESS_STAY);
        this.offAll(ButtonGamepad.EVENT_PRESS_OUT);
        this.offAll(ButtonGamepad.EVENT_PRESS_ENTER);
        this.offAll(ButtonGamepad.EVENT_PRESS_STAY);
        this.offAll(ButtonGamepad.EVENT_PRESS_OUT);
        this.offAll(ButtonGamepad.EVENT_PRESS_VALUE);
    }
}
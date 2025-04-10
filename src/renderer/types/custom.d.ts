// 定义事件类型，用于电源管理功能
interface PowerEventDetail {
  event: string;
  powerState: {
    online: boolean;
    charging: boolean;
    level: number;
    remainingTime: number | null;
  } | null;
}

interface PowerEventInit extends CustomEventInit {
  detail: PowerEventDetail;
}

interface PowerEvent extends CustomEvent {
  detail: PowerEventDetail;
}

// 扩展 Window 接口，包含自定义事件
interface WindowEventMap {
  'power-event': PowerEvent;
} 
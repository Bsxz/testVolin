import { create } from 'zustand';

// 设备接口
export interface Device {
  id: string;
  name: string;
  type: 'light' | 'switch' | 'sensor' | 'camera' | 'thermostat' | 'other';
  status: 'online' | 'offline' | 'error';
  isOn: boolean;
  room: string;
  lastSeen: string;
  properties?: Record<string, any>;
}

// 空间接口
export interface Space {
  id: string;
  name: string;
  deviceCount: number;
  status: 'active' | 'inactive';
  devices: Device[];
}

// 场景接口
export interface Scene {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'inactive';
  type: 'schedule' | 'condition' | 'location' | 'manual';
  enabled: boolean;
  devices: string[]; // 设备ID列表
  conditions?: Record<string, any>;
}

// 设备状态管理
interface DeviceState {
  // 状态
  devices: Device[];
  spaces: Space[];
  scenes: Scene[];
  isLoading: boolean;
  selectedSpace: string | null;

  // 设备操作
  toggleDevice: (deviceId: string) => Promise<void>;
  updateDeviceStatus: (deviceId: string, status: Device['status']) => void;
  updateDeviceProperty: (deviceId: string, property: string, value: any) => void;

  // 空间操作
  setSelectedSpace: (spaceId: string | null) => void;
  getDevicesBySpace: (spaceId: string) => Device[];

  // 场景操作
  toggleScene: (sceneId: string) => Promise<void>;
  enableScene: (sceneId: string, enabled: boolean) => void;

  // 数据加载
  loadDevices: () => Promise<void>;
  loadSpaces: () => Promise<void>;
  loadScenes: () => Promise<void>;
  refreshAll: () => Promise<void>;

  // 状态管理
  setLoading: (loading: boolean) => void;
}

// 创建设备状态管理
export const useDeviceStore = create<DeviceState>((set, get) => ({
  // 初始状态
  devices: [],
  spaces: [],
  scenes: [],
  isLoading: false,
  selectedSpace: null,

  // 切换设备状态
  toggleDevice: async (deviceId: string) => {
    const device = get().devices.find(d => d.id === deviceId);
    if (!device) return;

    set(state => ({
      devices: state.devices.map(d =>
        d.id === deviceId ? { ...d, isOn: !d.isOn } : d
      ),
    }));

    // 这里可以调用API来实际控制设备
    try {
      // await deviceService.toggleDevice(deviceId);
      console.log(`设备 ${device.name} 已${device.isOn ? '关闭' : '开启'}`);
    } catch (error) {
      console.error('切换设备状态失败:', error);
      // 回滚状态
      set(state => ({
        devices: state.devices.map(d =>
          d.id === deviceId ? { ...d, isOn: device.isOn } : d
        ),
      }));
    }
  },

  // 更新设备状态
  updateDeviceStatus: (deviceId: string, status: Device['status']) => {
    set(state => ({
      devices: state.devices.map(d =>
        d.id === deviceId ? { ...d, status } : d
      ),
    }));
  },

  // 更新设备属性
  updateDeviceProperty: (deviceId: string, property: string, value: any) => {
    set(state => ({
      devices: state.devices.map(d =>
        d.id === deviceId
          ? {
            ...d,
            properties: {
              ...d.properties,
              [property]: value,
            },
          }
          : d
      ),
    }));
  },

  // 设置选中的空间
  setSelectedSpace: (spaceId: string | null) => {
    set({ selectedSpace: spaceId });
  },

  // 根据空间获取设备
  getDevicesBySpace: (spaceId: string) => {
    return get().devices.filter(device => device.room === spaceId);
  },

  // 切换场景
  toggleScene: async (sceneId: string) => {
    const scene = get().scenes.find(s => s.id === sceneId);
    if (!scene) return;

    set(state => ({
      scenes: state.scenes.map(s =>
        s.id === sceneId ? { ...s, enabled: !s.enabled } : s
      ),
    }));

    try {
      // await sceneService.toggleScene(sceneId);
      console.log(`场景 ${scene.name} 已${scene.enabled ? '禁用' : '启用'}`);
    } catch (error) {
      console.error('切换场景失败:', error);
      // 回滚状态
      set(state => ({
        scenes: state.scenes.map(s =>
          s.id === sceneId ? { ...s, enabled: scene.enabled } : s
        ),
      }));
    }
  },

  // 启用/禁用场景
  enableScene: (sceneId: string, enabled: boolean) => {
    set(state => ({
      scenes: state.scenes.map(s =>
        s.id === sceneId ? { ...s, enabled } : s
      ),
    }));
  },

  // 加载设备列表
  loadDevices: async () => {
    set({ isLoading: true });
    try {
      // 模拟API调用
      await new Promise<void>(resolve => setTimeout(resolve, 1000));

      const mockDevices: Device[] = [
        {
          id: '1',
          name: '客厅灯',
          type: 'light',
          status: 'online',
          isOn: true,
          room: '客厅',
          lastSeen: new Date().toISOString(),
          properties: { brightness: 80, color: '#ffffff' },
        },
        {
          id: '2',
          name: '卧室空调',
          type: 'thermostat',
          status: 'online',
          isOn: false,
          room: '卧室',
          lastSeen: new Date().toISOString(),
          properties: { temperature: 26, mode: 'cool' },
        },
        {
          id: '3',
          name: '厨房开关',
          type: 'switch',
          status: 'offline',
          isOn: false,
          room: '厨房',
          lastSeen: new Date(Date.now() - 3600000).toISOString(),
        },
      ];

      set({ devices: mockDevices, isLoading: false });
    } catch (error) {
      console.error('加载设备失败:', error);
      set({ isLoading: false });
    }
  },

  // 加载空间列表
  loadSpaces: async () => {
    set({ isLoading: true });
    try {
      // 模拟API调用
      await new Promise<void>(resolve => setTimeout(resolve, 500));

      const mockSpaces: Space[] = [
        {
          id: '1',
          name: '客厅',
          deviceCount: 5,
          status: 'active',
          devices: [],
        },
        {
          id: '2',
          name: '卧室',
          deviceCount: 3,
          status: 'active',
          devices: [],
        },
        {
          id: '3',
          name: '厨房',
          deviceCount: 2,
          status: 'inactive',
          devices: [],
        },
      ];

      set({ spaces: mockSpaces, isLoading: false });
    } catch (error) {
      console.error('加载空间失败:', error);
      set({ isLoading: false });
    }
  },

  // 加载场景列表
  loadScenes: async () => {
    set({ isLoading: true });
    try {
      // 模拟API调用
      await new Promise<void>(resolve => setTimeout(resolve, 500));

      const mockScenes: Scene[] = [
        {
          id: '1',
          name: '回家模式',
          description: '自动开启灯光和空调',
          status: 'active',
          type: 'manual',
          enabled: true,
          devices: ['1', '2'],
        },
        {
          id: '2',
          name: '定时开关灯',
          description: '每天18:00自动开启客厅灯',
          status: 'active',
          type: 'schedule',
          enabled: true,
          devices: ['1'],
        },
        {
          id: '3',
          name: '温度控制',
          description: '室温超过26°C自动开启空调',
          status: 'active',
          type: 'condition',
          enabled: true,
          devices: ['2'],
        },
      ];

      set({ scenes: mockScenes, isLoading: false });
    } catch (error) {
      console.error('加载场景失败:', error);
      set({ isLoading: false });
    }
  },

  // 刷新所有数据
  refreshAll: async () => {
    await Promise.all([
      get().loadDevices(),
      get().loadSpaces(),
      get().loadScenes(),
    ]);
  },

  // 设置加载状态
  setLoading: (loading: boolean) => {
    set({ isLoading: loading });
  },
}));

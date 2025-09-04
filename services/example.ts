import { get, post } from '../utils/axios';

// 使用示例 - 展示不同路径的代理效果

// 1. /metis/ 路径会被代理到 https://metis-api-dev.18qjz.cn
export async function getMetisData() {
  try {
    const { data, success } = await get('/metis/rule/bizList/select?bizType=2');
    if (success) {
      console.log('Metis数据获取成功:', data);
      return data;
    }
  } catch (error) {
    console.error('获取Metis数据失败:', error);
  }
}

// 2. /api/ 路径会被代理到 http://192.168.1.100:3000 (并移除/api前缀)
export async function getApiData() {
  try {
    const { data, success } = await get('/api/users');
    if (success) {
      console.log('API数据获取成功:', data);
      return data;
    }
  } catch (error) {
    console.error('获取API数据失败:', error);
  }
}

// 3. 其他路径不会使用代理，直接访问
export async function getStaticData() {
  try {
    const { data, success } = await get('/static/config.json');
    if (success) {
      console.log('静态数据获取成功:', data);
      return data;
    }
  } catch (error) {
    console.error('获取静态数据失败:', error);
  }
}

// 4. POST请求示例
export async function createUser(userData: any) {
  try {
    const { data, success } = await post('/api/users', userData);
    if (success) {
      console.log('用户创建成功:', data);
      return data;
    }
  } catch (error) {
    console.error('创建用户失败:', error);
  }
}

// 5. 测试不同环境的代理
export async function testEnvironmentProxy() {
  console.log('当前环境:', __DEV__ ? 'development' : 'production');

  // 在开发环境中，这些请求会使用代理
  if (__DEV__) {
    console.log('开发环境 - 使用代理配置');

    // 测试metis代理
    await getMetisData();

    // 测试api代理
    await getApiData();
  } else {
    console.log('生产环境 - 直接访问');
  }
}

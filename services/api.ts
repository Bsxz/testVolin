import { get, post, put, del, upload } from '../utils/axios';

// 示例：获取帖子列表
export async function getPostList() {
  const { data, success } = await get('/metis/rule/bizList/select?bizType=2');

  if (success) {
    return data;
  }

  throw new Error('获取帖子列表失败');
}

// 示例：获取用户信息
export async function getUserInfo(userId: string) {
  const { data, success } = await get(`/user/${userId}`);

  if (success) {
    return data;
  }

  throw new Error('获取用户信息失败');
}

// 示例：创建帖子
export async function createPost(postData: {
  title: string;
  content: string;
  category: string;
}) {
  const { data, success } = await post('/posts', postData);

  if (success) {
    return data;
  }

  throw new Error('创建帖子失败');
}

// 示例：更新帖子
export async function updatePost(postId: string, postData: {
  title?: string;
  content?: string;
  category?: string;
}) {
  const { data, success } = await put(`/posts/${postId}`, postData);

  if (success) {
    return data;
  }

  throw new Error('更新帖子失败');
}

// 示例：删除帖子
export async function deletePost(postId: string) {
  const { data, success } = await del(`/posts/${postId}`);

  if (success) {
    return data;
  }

  throw new Error('删除帖子失败');
}

// 示例：批量操作
export async function batchDeletePosts(postIds: string[]) {
  const { data, success } = await post('/posts/batch-delete', { postIds });

  if (success) {
    return data;
  }

  throw new Error('批量删除失败');
}

// 示例：带查询参数的请求
export async function searchPosts(params: {
  keyword?: string;
  category?: string;
  page?: number;
  pageSize?: number;
}) {
  const queryString = new URLSearchParams(
    Object.entries(params)
      .filter(([_, value]) => value !== undefined)
      .map(([key, value]) => [key, String(value)])
  ).toString();

  const { data, success } = await get(`/posts/search?${queryString}`);

  if (success) {
    return data;
  }

  throw new Error('搜索帖子失败');
}

// 示例：文件上传
export async function uploadFile(file: FormData) {
  const { data, success } = await upload('/upload', file);

  if (success) {
    return data;
  }

  throw new Error('文件上传失败');
}

// 示例：带认证的请求
export async function getPrivateData() {
  const { data, success } = await get('/private/data', {
    headers: {
      'Authorization': 'Bearer your-token-here',
    },
  });

  if (success) {
    return data;
  }

  throw new Error('获取私有数据失败');
}

// 示例：带超时的请求
export async function getDataWithTimeout() {
  const { data, success } = await get('/api/data', {
    timeout: 5000, // 5秒超时
  });

  if (success) {
    return data;
  }

  throw new Error('获取数据失败');
}

// 示例：带重试的请求
export async function getDataWithRetry(retryCount = 3) {
  let lastError: Error | null = null;

  for (let i = 0; i < retryCount; i++) {
    try {
      const { data, success } = await get('/api/data');

      if (success) {
        return data;
      }

      throw new Error('请求失败');
    } catch (error) {
      lastError = error as Error;
      console.log(`请求失败，第${i + 1}次重试...`);

      if (i < retryCount - 1) {
        // 等待一段时间后重试
        await new Promise<void>(resolve => setTimeout(resolve, 1000 * (i + 1)));
      }
    }
  }

  throw lastError || new Error('重试失败');
}

// 示例：并发请求
export async function getMultipleData() {
  const [postsResult, usersResult, categoriesResult] = await Promise.allSettled([
    get('/posts'),
    get('/users'),
    get('/categories'),
  ]);

  return {
    posts: postsResult.status === 'fulfilled' ? postsResult.value.data : null,
    users: usersResult.status === 'fulfilled' ? usersResult.value.data : null,
    categories: categoriesResult.status === 'fulfilled' ? categoriesResult.value.data : null,
  };
}

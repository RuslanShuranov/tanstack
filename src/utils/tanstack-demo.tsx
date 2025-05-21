import { queryOptions } from '@tanstack/react-query';
import axios from 'redaxios';

export type Post = {
  id: number;
  title: string;
  body: string;
  userId: number;
};

export type Comment = {
  id: number;
  postId: number;
  name: string;
  email: string;
  body: string;
};

export const postsQueryOptions = () =>
  queryOptions({
    queryKey: ['demo-posts'],
    queryFn: () =>
      axios
        .get<Array<Post>>('https://jsonplaceholder.typicode.com/posts')
        .then((r) => r.data.slice(0, 10))
        .catch(() => {
          throw new Error('Failed to fetch posts');
        }),
  });

export const initialPostFormValues = {
  title: '',
  body: '',
  userId: 1,
};

import axios from 'axios';
import { FETCH_USER, FETCH_BLOGS, FETCH_BLOG } from './types';

export const fetchUser = () => async dispatch => {
  const res = await axios.get('/api/current_user');

  dispatch({ type: FETCH_USER, payload: res.data });
};

export const handleToken = token => async dispatch => {
  const res = await axios.post('/api/stripe', token);

  dispatch({ type: FETCH_USER, payload: res.data });
};

export const submitBlog = (values, file, history) => async dispatch => {
  console.log(file);
  const uploadCongif = await axios.get('/api/upload');
  console.log(uploadCongif.data.url);
  await axios.post(uploadCongif.data.url, file,
    {
      headers:
      {
        Bucket: 's3-blog-bucket',
        Key: uploadCongif.data.key,
        ACL: 'public-read-write',
        Body: file,
        ContentType: file.type,
        
      }
    }
  );
  // const res = await axios.post('/api/blogs', values);

  // history.push('/blogs');
  // dispatch({ type: FETCH_BLOG, payload: res.data });
};

export const fetchBlogs = () => async dispatch => {
  const res = await axios.get('/api/blogs');

  dispatch({ type: FETCH_BLOGS, payload: res.data });
};

export const fetchBlog = id => async dispatch => {
  const res = await axios.get(`/api/blogs/${id}`);

  dispatch({ type: FETCH_BLOG, payload: res.data });
};

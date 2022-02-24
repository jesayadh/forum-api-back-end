const pool = require('../../database/postgres/pool');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const container = require('../../container');
const createServer = require('../createServer');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');

describe('/comments endpoint', () => {
  afterAll(async () => {
    await pool.end();
  });

  afterEach(async () => {
    await CommentsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
  });

  describe('when POST /comments', () => {
    it('should response 201 and persisted comment', async () => {
      // Arrange
      const requestPayload = {
        content: 'dicoding',
      };
      const userPayload = {
        username: 'dicoding',
        password: 'secret',
      };
      // eslint-disable-next-line no-undef
      const server = await createServer(container);
      // add user
      await server.inject({
        method: 'POST',
        url: '/users',
        payload: {
          username: 'dicoding',
          password: 'secret',
          fullname: 'Dicoding Indonesia',
        },
      });
      // Action
      const getAuth = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: userPayload,
      });
      const { accessToken } = getAuth.result.data;

      const getThread = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: {
          title: 'dicoding',
          body: 'Dicoding Indonesia',
        },
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      const { id } = getThread.result.data.addedThread;

      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/threads/'+id+'/comments',
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(201);
      expect(responseJson.status).toEqual('success');
      expect(responseJson.data.addedComment).toBeDefined();
      expect(responseJson.data.addedComment.content).toEqual(requestPayload.content);
    });

    it('should response 400 when request payload not contain needed property', async () => {
      // Arrange
      const requestPayload = {
      };
      const userPayload = {
        username: 'dicoding',
        password: 'secret',
      };
      // eslint-disable-next-line no-undef
      const server = await createServer(container);
      // add user
      await server.inject({
        method: 'POST',
        url: '/users',
        payload: {
          username: 'dicoding',
          password: 'secret',
          fullname: 'Dicoding Indonesia',
        },
      });
      // Action
      const getAuth = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: userPayload,
      });
      const { accessToken } = getAuth.result.data;

      const getThread = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: {
          title: 'dicoding',
          body: 'Dicoding Indonesia',
        },
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      const { id } = getThread.result.data.addedThread;

      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/threads/'+id+'/comments',
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('tidak dapat membuat comment baru karena properti yang dibutuhkan tidak ada');
    });

    it('should response 400 when request payload not meet data type specification', async () => {
      // Arrange
      const requestPayload = {
        content: ['dicoding'],
      };
      const userPayload = {
        username: 'dicoding',
        password: 'secret',
      };
      // eslint-disable-next-line no-undef
      const server = await createServer(container);
      // add user
      await server.inject({
        method: 'POST',
        url: '/users',
        payload: {
          username: 'dicoding',
          password: 'secret',
          fullname: 'Dicoding Indonesia',
        },
      });
      // Action
      const getAuth = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: userPayload,
      });
      const { accessToken } = getAuth.result.data;

      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/threads/thread-123/comments',
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('tidak dapat membuat comment baru karena tipe data tidak sesuai');
    });
  });

  describe('when DELETE /comments', () => {
    it('should response 200 if commentId valid', async () => {
      // Arrange
      const requestPayload = {
        content: 'dicoding',
      };
      const userPayload = {
        username: 'dicoding',
        password: 'secret',
      };
      // eslint-disable-next-line no-undef
      const server = await createServer(container);
      // add user
      await server.inject({
        method: 'POST',
        url: '/users',
        payload: {
          username: 'dicoding',
          password: 'secret',
          fullname: 'Dicoding Indonesia',
        },
      });
      // Action
      const getAuth = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: userPayload,
      });
      const { accessToken } = getAuth.result.data;

      const getThread = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: {
          title: 'dicoding',
          body: 'Dicoding Indonesia',
        },
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      const { id } = getThread.result.data.addedThread;
      
      const getComment = await server.inject({
        method: 'POST',
        url: '/threads/'+id+'/comments',
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      const { id:commentId } = getComment.result.data.addedComment;
      // Action
      const response = await server.inject({
        method: 'DELETE',
        url: '/threads/'+id+'/comments/'+commentId,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual('success');
    });

    it('should response 404 if commentId not registered in database', async () => {
      // Arrange
      const commentId = 'comment-456';

      const userPayload = {
        username: 'dicoding',
        password: 'secret',
      };
      // eslint-disable-next-line no-undef
      const server = await createServer(container);
      // add user
      await server.inject({
        method: 'POST',
        url: '/users',
        payload: {
          username: 'dicoding',
          password: 'secret',
          fullname: 'Dicoding Indonesia',
        },
      });
      // Action
      const getAuth = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: userPayload,
      });
      const { accessToken } = getAuth.result.data;
      // Action
      const response = await server.inject({
        method: 'DELETE',
        url: '/threads/'+"id"+'/comments/'+commentId,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('commentId tidak ditemukan di database');
    });

    it('should response 404 if payload not contain commentId', async () => {
      // Arrange
      const requestPayload = {
        content: 'dicoding',
      };
      const userPayload = {
        username: 'dicoding',
        password: 'secret',
      };
      // eslint-disable-next-line no-undef
      const server = await createServer(container);
      // add user
      await server.inject({
        method: 'POST',
        url: '/users',
        payload: {
          username: 'dicoding',
          password: 'secret',
          fullname: 'Dicoding Indonesia',
        },
      });
      // Action
      const getAuth = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: userPayload,
      });
      const { accessToken } = getAuth.result.data;
      // Action
      const getThread = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: {
          title: 'dicoding',
          body: 'Dicoding Indonesia',
        },
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      const { id } = getThread.result.data.addedThread;
      
      const getComment = await server.inject({
        method: 'POST',
        url: '/threads/'+id+'/comments',
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      const { id:commentId } = getComment.result.data.addedComment;
      // Action
      const response = await server.inject({
        method: 'DELETE',
        url: '/threads/'+id+'/comments/'+commentId,
        headers: {
          Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImpvaG5kb2UiLCJpZCI6InVzZXItLUVjTmNQcHQ2TnFZMnRNbkpVVExZIiwiaWF0IjoxNjQ1Njg4Mzc3fQ.aKiGRNP1unSwHH4pq33kQ-Diyt5e0y9QcgXkcoQDwfc`,
        },
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(403);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('Anda tidak berhak mengakses resource ini');
    });
  });
});

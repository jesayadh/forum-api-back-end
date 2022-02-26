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

      const getComment = await server.inject({
        method: 'POST',
        url: '/threads/'+id+'/comments',
        payload: {
          content: 'dicoding',
        },
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      const { id:commentId } = getComment.result.data.addedComment;

      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/threads/'+id+'/comments/'+commentId+'/replies',
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(201);
      expect(responseJson.status).toEqual('success');
      expect(responseJson.data.addedReply).toBeDefined();
      expect(responseJson.data.addedReply.content).toEqual(requestPayload.content);
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

      const getReply = await server.inject({
        method: 'POST',
        url: '/threads/'+id+'/comments/'+commentId+'/replies',
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      const { id:replyId } = getReply.result.data.addedReply;
      // Action
      const response = await server.inject({
        method: 'DELETE',
        url: '/threads/'+id+'/comments/'+commentId+'/replies/'+replyId,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      console.log("tester");
      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual('success');
    });
  });
});

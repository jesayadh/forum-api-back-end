const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const RegisterThread = require('../../../Domains/threads/entities/RegisterThread');
const RegisteredThread = require('../../../Domains/threads/entities/RegisteredThread');
const pool = require('../../database/postgres/pool');
const ThreadRepositoryPostgres = require('../ThreadRepositoryPostgres');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');

describe('ThreadRepositoryPostgres', () => {
  afterEach(async () => {
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('addThread function', () => {
    it('should persist register thread and return registered thread correctly', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: 'user-123' });
      const registerThread = new RegisterThread({
        title: 'dicoding',
        body: 'Dicoding Indonesia',
        owner:'user-123'
      });
      const fakeIdGenerator = () => '123'; // stub!
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      await threadRepositoryPostgres.addThread(registerThread);

      // Assert
      const threads = await ThreadsTableTestHelper.findThreadsById('thread-123');
      expect(threads).toHaveLength(1);
    });

    it('should return registered thread correctly', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ username: 'dicoding' });
      const registerThread = new RegisterThread({
        title: 'dicoding',
        body: 'Dicoding Indonesia',
        owner : 'user-123'
      });
      const fakeIdGenerator = () => '123'; // stub!
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      const registeredThread = await threadRepositoryPostgres.addThread(registerThread);

      // Assert
      expect(registeredThread).toStrictEqual(new RegisteredThread({
        id: 'thread-123',
        title: 'dicoding',
        owner: 'user-123',
      }));
    });
  });

  describe('getThreadById', () => {
    it('should get thread from database', async () => {
      await UsersTableTestHelper.addUser({ username: 'dicoding' });
      const threadRepository = new ThreadRepositoryPostgres(pool);
      const thread = 'thread-123';
      await ThreadsTableTestHelper.addThread({id:thread});

      const threads = await threadRepository.getThreadById(thread);
      console.log(threads);
      const checkThread = await ThreadsTableTestHelper.findThreadsById(thread);
      expect(checkThread).toHaveLength(1);
    });
  });

  describe('verifyAvailableThread function', () => {
    it('should throw NotFoundError if thread not available', async () => {
      // Arrange
      const threadRepository = new ThreadRepositoryPostgres(pool);
      const thread = 'thread';

      // Action & Assert
      await expect(threadRepository.verifyAvailableThread(thread))
        .rejects.toThrow(NotFoundError);
    });

    it('should not throw NotFoundError if thread available', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ username: 'dicoding' });
      const threadRepository = new ThreadRepositoryPostgres(pool);
      const content = 'content';
      await ThreadsTableTestHelper.addThread(content);

      // Action & Assert
      await expect(threadRepository.verifyAvailableThread("thread-123"))
        .resolves.not.toThrow(NotFoundError);
    });
  });
});
